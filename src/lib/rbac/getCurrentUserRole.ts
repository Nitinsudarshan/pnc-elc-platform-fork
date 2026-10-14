import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/role-constants'

export async function getCurrentUserRole() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const cookieStore = await cookies()
  const devOverride = cookieStore.get('dev-role-override')?.value as UserRole | undefined

  const originalRole = (user?.app_metadata?.role as UserRole | undefined) ?? null
  const effectiveRole = devOverride || originalRole

  return {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    role: effectiveRole,
    originalRole,
    isEmulating: Boolean(devOverride && devOverride !== originalRole),
  }
}
