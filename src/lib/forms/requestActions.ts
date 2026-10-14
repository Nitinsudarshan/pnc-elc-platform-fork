'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

// Sends a published form to one respondent (optionally about one person)
export async function createFormRequest(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const versionId = text(formData, 'versionId')
  const respondentId = text(formData, 'respondentId')
  const subjectId = text(formData, 'subjectId')
  const expiresInDays = Number(text(formData, 'expiresInDays'))
  const path = `/data-management/forms/${formId}`

  if (!respondentId) fail(path, 'Choose who should fill in the form')

  const supabase = await createServerSupabaseClient()
  const { data: authData } = await supabase.auth.getUser()

  const { data: version } = await supabase
    .from('form_versions')
    .select('id, status, form_id')
    .eq('id', versionId)
    .maybeSingle()
  if (!version || version.status !== 'published' || version.form_id !== formId) {
    fail(path, 'Only a published version can be sent')
  }

  const { data: form } = await supabase
    .from('forms')
    .select('archived_at')
    .eq('id', formId)
    .maybeSingle()
  if (form?.archived_at) fail(path, 'This form is archived. Restore it before sending it.')

  let duplicateQuery = supabase
    .from('form_requests')
    .select('id')
    .eq('form_version_id', versionId)
    .eq('respondent_employee_id', respondentId)
    .in('status', ['pending', 'opened', 'started', 'submitted'])
    .limit(1)
  duplicateQuery = subjectId
    ? duplicateQuery.eq('subject_employee_id', subjectId)
    : duplicateQuery.is('subject_employee_id', null)
  const { data: duplicate } = await duplicateQuery
  if ((duplicate ?? []).length > 0) {
    fail(path, 'This person already has this form for the same subject')
  }

  const expiresAt =
    Number.isFinite(expiresInDays) && expiresInDays >= 1 && expiresInDays <= 365
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null

  const { error } = await supabase.from('form_requests').insert({
    form_version_id: versionId,
    respondent_employee_id: respondentId,
    subject_employee_id: subjectId || null,
    created_by: authData.user?.id ?? null,
    expires_at: expiresAt,
  })
  if (error) fail(path, error.message)

  revalidatePath(path)
  redirect(`${path}?sent=1`)
}
