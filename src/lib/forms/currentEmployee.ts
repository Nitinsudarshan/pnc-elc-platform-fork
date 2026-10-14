import { createServerSupabaseClient } from '@/lib/supabase/server'

type Db = Awaited<ReturnType<typeof createServerSupabaseClient>>

// Finds the employee record that matches the signed-in Google account (by email)
export async function getCurrentEmployee(supabase: Db) {
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email ?? null
  if (!email) return { email: null, employee: null as { id: string; name: string } | null }

  const escaped = email.replace(/[\\%_]/g, '\\$&')
  const { data: rows } = await supabase
    .from('employees')
    .select('id, name')
    .ilike('email', escaped)
    .limit(1)

  const found = ((rows ?? []) as any[])[0]
  return {
    email,
    employee: found ? { id: found.id as string, name: found.name as string } : null,
  }
}
