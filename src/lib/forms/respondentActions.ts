'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/forms/currentEmployee'

const MAX_TEXT = 10000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

type Parsed = { value: unknown; empty: boolean; incomplete?: boolean; error?: string }

function parseField(field: any, formData: FormData): Parsed {
  const key = `f_${field.id}`
  const label = String(field.label)
  const type = String(field.field_type)
  const choices: string[] = Array.isArray(field.options?.choices) ? field.options.choices : []
  const raw = String(formData.get(key) ?? '').trim()

  if (type === 'short_text' || type === 'long_text') {
    if (raw.length > MAX_TEXT) return { value: null, empty: true, error: `"${label}" is too long` }
    return { value: raw === '' ? null : raw, empty: raw === '' }
  }

  if (type === 'number') {
    if (raw === '') return { value: null, empty: true }
    const n = Number(raw)
    if (!Number.isFinite(n)) return { value: null, empty: true, error: `"${label}" must be a number` }
    return { value: n, empty: false }
  }

  if (type === 'date') {
    if (raw === '') return { value: null, empty: true }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) {
      return { value: null, empty: true, error: `"${label}" must be a valid date` }
    }
    return { value: raw, empty: false }
  }

  if (type === 'single_select') {
    if (raw === '') return { value: null, empty: true }
    if (!choices.includes(raw)) return { value: null, empty: true, error: `Choose one of the listed options for "${label}"` }
    return { value: raw, empty: false }
  }

  if (type === 'multi_select') {
    const picked = formData.getAll(key).map((v) => String(v)).filter(Boolean)
    if (picked.some((p) => !choices.includes(p))) {
      return { value: null, empty: true, error: `Choose only the listed options for "${label}"` }
    }
    return { value: picked.length ? picked : null, empty: picked.length === 0 }
  }

  if (type === 'yes_no') {
    if (raw === '') return { value: null, empty: true }
    if (raw !== 'yes' && raw !== 'no') return { value: null, empty: true, error: `Answer yes or no for "${label}"` }
    return { value: raw, empty: false }
  }

  if (type === 'rating') {
    if (raw === '') return { value: null, empty: true }
    const n = Number(raw)
    if (!Number.isInteger(n) || n < 1 || n > 5) return { value: null, empty: true, error: `"${label}" must be rated 1 to 5` }
    return { value: n, empty: false }
  }

  if (type === 'rating_grid') {
    const rows: string[] = Array.isArray(field.options?.rows) ? field.options.rows : []
    const rated: Record<string, number> = {}
    for (let i = 0; i < rows.length; i++) {
      const cell = String(formData.get(`${key}__${i}`) ?? '').trim()
      if (cell === '') continue
      const n = Number(cell)
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return { value: null, empty: true, error: `Ratings in "${label}" must be 1 to 5` }
      }
      rated[rows[i]] = n
    }
    const count = Object.keys(rated).length
    return {
      value: count ? rated : null,
      empty: count === 0,
      incomplete: count > 0 && count < rows.length,
    }
  }

  if (type === 'employee_picker') {
    if (raw === '') return { value: null, empty: true }
    if (!UUID.test(raw)) return { value: null, empty: true, error: `Choose a person from the list for "${label}"` }
    return { value: raw, empty: false }
  }

  return { value: null, empty: true, error: `"${label}" has an unsupported type` }
}

export async function saveSubmission(formData: FormData): Promise<void> {
  const requestId = String(formData.get('requestId') ?? '').trim()
  const intent = String(formData.get('intent') ?? 'draft')
  const path = `/my-forms/${requestId}`

  const supabase = await createServerSupabaseClient()
  const { employee } = await getCurrentEmployee(supabase)
  if (!employee) fail('/my-forms', 'Your login is not linked to an employee record')

  const { data: request } = await supabase
    .from('form_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()
  if (!request || request.respondent_employee_id !== employee.id) {
    fail('/my-forms', 'This form is not assigned to you')
  }
  if (request.status === 'cancelled') fail(path, 'This request was cancelled')
  if (request.expires_at && new Date(request.expires_at) < new Date()) {
    fail(path, 'This request has expired')
  }

  const { data: fieldRows } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_version_id', request.form_version_id)
    .order('order_index', { ascending: true })
  const fields = (fieldRows ?? []) as any[]
  if (fields.length === 0) fail(path, 'This form has no fields')

  const parsed = fields.map((field) => ({ field, ...parseField(field, formData) }))

  const typeProblem = parsed.find((p) => p.error)
  if (typeProblem) fail(path, typeProblem.error as string)

  if (intent === 'submit') {
    for (const p of parsed) {
      if (!p.field.is_required) continue
      if (p.empty) fail(path, `"${p.field.label}" is required`)
      if (p.incomplete) fail(path, `Please rate every item in "${p.field.label}"`)
    }
  }

  const pickerIds = parsed
    .filter((p) => p.field.field_type === 'employee_picker' && typeof p.value === 'string')
    .map((p) => p.value as string)
  if (pickerIds.length > 0) {
    const { data: found } = await supabase.from('employees').select('id').in('id', pickerIds)
    if ((found ?? []).length !== new Set(pickerIds).size) {
      fail(path, 'Choose a person from the list')
    }
  }

  const { data: existing } = await supabase
    .from('form_submissions')
    .select('id, status')
    .eq('request_id', requestId)
    .maybeSingle()
  if (existing?.status === 'submitted') fail(path, 'You have already submitted this form')

  let submissionId = existing?.id as string | undefined
  if (!submissionId) {
    const { data: created, error } = await supabase
      .from('form_submissions')
      .insert({
        form_version_id: request.form_version_id,
        request_id: requestId,
        subject_employee_id: request.subject_employee_id,
        respondent_employee_id: employee.id,
      })
      .select('id')
      .single()
    if (error || !created) fail(path, error?.message ?? 'Could not start the form')
    submissionId = created.id as string
  }
  const sid = submissionId as string

  const rows = parsed.map((p) => ({ submission_id: sid, field_id: p.field.id, value: p.value }))
  const { error: answerError } = await supabase
    .from('form_answers')
    .upsert(rows, { onConflict: 'submission_id,field_id' })
  if (answerError) fail(path, answerError.message)

  if (intent === 'submit') {
    const { data: updated, error: submitError } = await supabase
      .from('form_submissions')
      .update({ status: 'submitted' })
      .eq('id', sid)
      .select('id')
    if (submitError) fail(path, submitError.message)
    if (!updated || updated.length === 0) fail(path, 'Could not submit the form. Please try again.')

    revalidatePath('/my-forms')
    revalidatePath(path)
    redirect(`${path}?submitted=1`)
  }

  revalidatePath(path)
  redirect(`${path}?saved=1`)
}
