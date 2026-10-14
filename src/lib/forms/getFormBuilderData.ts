import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function getFormBuilderData(formId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .maybeSingle()
  if (!form) return null

  const { data: versionRows } = await supabase
    .from('form_versions')
    .select('*')
    .eq('form_id', formId)
    .order('version_number', { ascending: false })

  const versions = (versionRows ?? []) as any[]
  const draft = versions.find((v) => v.status === 'draft') ?? null
  const published = versions.find((v) => v.status === 'published') ?? null
  const current = draft ?? published ?? versions[0] ?? null

  let sections: any[] = []
  let fields: any[] = []
  if (current) {
    const { data: sectionRows } = await supabase
      .from('form_sections')
      .select('*')
      .eq('form_version_id', current.id)
      .order('order_index', { ascending: true })
    const { data: fieldRows } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_version_id', current.id)
      .order('order_index', { ascending: true })
    sections = (sectionRows ?? []) as any[]
    fields = (fieldRows ?? []) as any[]
  }

  let submissionCount = 0
  const versionIds = versions.map((v) => v.id as string)
  if (versionIds.length > 0) {
    const { count } = await supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true })
      .in('form_version_id', versionIds)
      .eq('status', 'submitted')
    submissionCount = count ?? 0
  }

  return { form: form as any, versions, draft, published, current, sections, fields, submissionCount }
}
