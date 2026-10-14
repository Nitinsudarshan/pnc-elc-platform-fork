import { createServerSupabaseClient } from '@/lib/supabase/server'

export type FormListItem = {
  id: string
  name: string
  workflow: string | null
  status: 'Draft' | 'Published' | 'Archived'
  version: number
  hasPendingDraft: boolean
  createdAt: string
  updatedAt: string
  submissionCount: number
}

export async function getForms(): Promise<FormListItem[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('forms')
    .select('id, name, workflow, archived_at, created_at, updated_at, form_versions(id, version_number, status)')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching forms:', error.message)
    return []
  }

  const rows = (data ?? []) as any[]
  const versionIds = rows.flatMap((f) =>
    ((f.form_versions ?? []) as any[]).map((v) => v.id as string)
  )

  const counts = new Map<string, number>()
  if (versionIds.length > 0) {
    const { data: subs } = await supabase
      .from('form_submissions')
      .select('form_version_id')
      .in('form_version_id', versionIds)
      .eq('status', 'submitted')
    for (const s of (subs ?? []) as any[]) {
      counts.set(s.form_version_id, (counts.get(s.form_version_id) ?? 0) + 1)
    }
  }

  return rows.map((f) => {
    const versions = ((f.form_versions ?? []) as any[]).slice()
    const published = versions.find((v) => v.status === 'published')
    const draft = versions.find((v) => v.status === 'draft')
    const newest = versions.reduce(
      (max, v) => (v.version_number > max ? v.version_number : max),
      0
    )

    const status: FormListItem['status'] = f.archived_at
      ? 'Archived'
      : published
      ? 'Published'
      : 'Draft'

    return {
      id: f.id,
      name: f.name,
      workflow: f.workflow,
      status,
      version: published ? published.version_number : newest,
      hasPendingDraft: Boolean(published && draft),
      createdAt: f.created_at,
      updatedAt: f.updated_at,
      submissionCount: versions.reduce((sum, v) => sum + (counts.get(v.id) ?? 0), 0),
    }
  })
}
