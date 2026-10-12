'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FIELD_TYPES, WORKFLOWS } from '@/lib/forms/types'

type Db = Awaited<ReturnType<typeof createServerSupabaseClient>>

const BASE = '/data-management/forms'

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

async function currentUserId(supabase: Db): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

// Copies sections and fields from one version to another (used for new drafts and duplicates)
async function cloneStructure(
  supabase: Db,
  sourceVersionId: string,
  targetVersionId: string
): Promise<string | null> {
  const { data: sectionRows, error: sectionError } = await supabase
    .from('form_sections')
    .select('*')
    .eq('form_version_id', sourceVersionId)
    .order('order_index', { ascending: true })
  if (sectionError) return sectionError.message

  const { data: fieldRows, error: fieldError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_version_id', sourceVersionId)
    .order('order_index', { ascending: true })
  if (fieldError) return fieldError.message

  const sections = (sectionRows ?? []) as any[]
  const fields = (fieldRows ?? []) as any[]

  const sectionMap = new Map<string, string>()
  for (const s of sections) {
    const { data: created, error } = await supabase
      .from('form_sections')
      .insert({
        form_version_id: targetVersionId,
        title: s.title,
        description: s.description,
        order_index: s.order_index,
      })
      .select('id')
      .single()
    if (error || !created) return error?.message ?? 'Could not copy a section'
    sectionMap.set(s.id, created.id)
  }

  const fieldMap = new Map<string, string>()
  for (const f of fields) {
    const newSectionId = sectionMap.get(f.section_id)
    if (!newSectionId) continue
    const { data: created, error } = await supabase
      .from('form_fields')
      .insert({
        form_version_id: targetVersionId,
        section_id: newSectionId,
        field_type: f.field_type,
        label: f.label,
        help_text: f.help_text,
        is_required: f.is_required,
        order_index: f.order_index,
        options: f.options,
      })
      .select('id')
      .single()
    if (error || !created) return error?.message ?? 'Could not copy a field'
    fieldMap.set(f.id, created.id)
  }

  // Branching rules point at field ids, so they must be re-pointed at the copies
  const remap = (rule: any) => {
    if (!rule || typeof rule !== 'object') return null
    const mapped = fieldMap.get(rule.field_id)
    return mapped ? { ...rule, field_id: mapped } : null
  }
  for (const s of sections) {
    if (!s.show_when) continue
    await supabase
      .from('form_sections')
      .update({ show_when: remap(s.show_when) })
      .eq('id', sectionMap.get(s.id) as string)
  }
  for (const f of fields) {
    if (!f.show_when) continue
    await supabase
      .from('form_fields')
      .update({ show_when: remap(f.show_when) })
      .eq('id', fieldMap.get(f.id) as string)
  }

  return null
}

export async function createForm(formData: FormData): Promise<void> {
  const name = text(formData, 'name')
  const workflowInput = text(formData, 'workflow')
  const workflow = WORKFLOWS.some((w) => w === workflowInput) ? workflowInput : null
  if (!name) fail(BASE, 'Please enter a form name')

  const supabase = await createServerSupabaseClient()
  const userId = await currentUserId(supabase)

  const { data: form, error } = await supabase
    .from('forms')
    .insert({ name, workflow, created_by: userId })
    .select('id')
    .single()
  if (error || !form) fail(BASE, error?.message ?? 'Could not create the form')

  const { error: versionError } = await supabase
    .from('form_versions')
    .insert({ form_id: form.id, version_number: 1, status: 'draft', created_by: userId })
  if (versionError) {
    await supabase.from('forms').delete().eq('id', form.id)
    fail(BASE, versionError.message)
  }

  revalidatePath(BASE)
  redirect(`${BASE}/${form.id}`)
}

export async function addSection(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const versionId = text(formData, 'versionId')
  const title = text(formData, 'title')
  const description = text(formData, 'description')
  const path = `${BASE}/${formId}`
  if (!title) fail(path, 'Please enter a section title')

  const supabase = await createServerSupabaseClient()
  const { data: last } = await supabase
    .from('form_sections')
    .select('order_index')
    .eq('form_version_id', versionId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('form_sections').insert({
    form_version_id: versionId,
    title,
    description: description || null,
    order_index: (last?.order_index ?? 0) + 1,
  })
  if (error) fail(path, error.message)

  revalidatePath(path)
  redirect(path)
}

export async function deleteSection(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const sectionId = text(formData, 'sectionId')
  const path = `${BASE}/${formId}`

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('form_sections').delete().eq('id', sectionId)
  if (error) fail(path, error.message)

  revalidatePath(path)
  redirect(path)
}

export async function addField(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const versionId = text(formData, 'versionId')
  const sectionId = text(formData, 'sectionId')
  const fieldType = text(formData, 'fieldType')
  const label = text(formData, 'label')
  const helpText = text(formData, 'helpText')
  const isRequired = formData.get('isRequired') === 'on'
  const optionLines = text(formData, 'options')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const path = `${BASE}/${formId}`

  if (!label) fail(path, 'Please enter a field label')
  if (!FIELD_TYPES.some((t) => t.value === fieldType)) fail(path, 'Please choose a field type')

  let options: Record<string, unknown> | null = null
  if (fieldType === 'single_select' || fieldType === 'multi_select') {
    if (optionLines.length < 2) fail(path, 'Add at least two choices, one per line')
    options = { choices: optionLines }
  } else if (fieldType === 'rating_grid') {
    if (optionLines.length < 1) fail(path, 'Add at least one item to rate, one per line')
    options = { rows: optionLines, min: 1, max: 5 }
  } else if (fieldType === 'rating') {
    options = { min: 1, max: 5 }
  }

  const supabase = await createServerSupabaseClient()
  const { data: last } = await supabase
    .from('form_fields')
    .select('order_index')
    .eq('section_id', sectionId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('form_fields').insert({
    form_version_id: versionId,
    section_id: sectionId,
    field_type: fieldType,
    label,
    help_text: helpText || null,
    is_required: isRequired,
    order_index: (last?.order_index ?? 0) + 1,
    options,
  })
  if (error) fail(path, error.message)

  revalidatePath(path)
  redirect(path)
}

export async function deleteField(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const fieldId = text(formData, 'fieldId')
  const path = `${BASE}/${formId}`

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('form_fields').delete().eq('id', fieldId)
  if (error) fail(path, error.message)

  revalidatePath(path)
  redirect(path)
}

export async function publishVersion(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const versionId = text(formData, 'versionId')
  const path = `${BASE}/${formId}`

  const supabase = await createServerSupabaseClient()
  const { data: form } = await supabase
    .from('forms')
    .select('archived_at')
    .eq('id', formId)
    .maybeSingle()
  if (form?.archived_at) fail(path, 'Restore this form before publishing it')

  const { error } = await supabase.rpc('publish_form_version', { p_version_id: versionId })
  if (error) fail(path, error.message)

  revalidatePath(path)
  revalidatePath(BASE)
  redirect(path)
}

export async function archiveForm(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const returnTo = text(formData, 'returnTo') || BASE

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('forms')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', formId)
  if (error) fail(returnTo, error.message)

  revalidatePath(BASE)
  revalidatePath(`${BASE}/${formId}`)
  redirect(returnTo)
}

export async function restoreForm(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const returnTo = text(formData, 'returnTo') || BASE

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('forms').update({ archived_at: null }).eq('id', formId)
  if (error) fail(returnTo, error.message)

  revalidatePath(BASE)
  revalidatePath(`${BASE}/${formId}`)
  redirect(returnTo)
}

// Editing a published form creates a new draft version (the published one never changes)
export async function createDraftVersion(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const path = `${BASE}/${formId}`

  const supabase = await createServerSupabaseClient()
  const userId = await currentUserId(supabase)

  const { data: existingDraft } = await supabase
    .from('form_versions')
    .select('id')
    .eq('form_id', formId)
    .eq('status', 'draft')
    .maybeSingle()
  if (existingDraft) redirect(path)

  const { data: latest } = await supabase
    .from('form_versions')
    .select('id, version_number')
    .eq('form_id', formId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest) fail(path, 'This form has no version to copy')

  const { data: draft, error } = await supabase
    .from('form_versions')
    .insert({
      form_id: formId,
      version_number: latest.version_number + 1,
      status: 'draft',
      created_by: userId,
    })
    .select('id')
    .single()
  if (error || !draft) fail(path, error?.message ?? 'Could not create a new draft')

  const cloneError = await cloneStructure(supabase, latest.id, draft.id)
  if (cloneError) {
    await supabase.from('form_versions').delete().eq('id', draft.id)
    fail(path, cloneError)
  }

  revalidatePath(path)
  revalidatePath(BASE)
  redirect(path)
}

export async function duplicateForm(formData: FormData): Promise<void> {
  const formId = text(formData, 'formId')
  const returnTo = text(formData, 'returnTo') || BASE

  const supabase = await createServerSupabaseClient()
  const userId = await currentUserId(supabase)

  const { data: source } = await supabase
    .from('forms')
    .select('name, workflow')
    .eq('id', formId)
    .maybeSingle()
  if (!source) fail(returnTo, 'Form not found')

  const { data: latest } = await supabase
    .from('form_versions')
    .select('id')
    .eq('form_id', formId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!latest) fail(returnTo, 'This form has no version to copy')

  const { data: copy, error } = await supabase
    .from('forms')
    .insert({ name: `${source.name} (copy)`, workflow: source.workflow, created_by: userId })
    .select('id')
    .single()
  if (error || !copy) fail(returnTo, error?.message ?? 'Could not duplicate the form')

  const { data: version, error: versionError } = await supabase
    .from('form_versions')
    .insert({ form_id: copy.id, version_number: 1, status: 'draft', created_by: userId })
    .select('id')
    .single()
  if (versionError || !version) {
    await supabase.from('forms').delete().eq('id', copy.id)
    fail(returnTo, versionError?.message ?? 'Could not duplicate the form')
  }

  const cloneError = await cloneStructure(supabase, latest.id, version.id)
  if (cloneError) {
    await supabase.from('forms').delete().eq('id', copy.id)
    fail(returnTo, cloneError)
  }

  revalidatePath(BASE)
  redirect(`${BASE}/${copy.id}`)
}
