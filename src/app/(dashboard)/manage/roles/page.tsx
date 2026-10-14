import { requireFeature } from '@/lib/rbac/requireFeature'
import { listUsersWithRoles } from '@/lib/rbac/listUsersWithRoles'
import { RoleSelect } from './RoleSelect'
import { ShieldAlert } from 'lucide-react'

export default async function RolesPage() {
  await requireFeature('manageUsers')
  const isConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  const users = await listUsersWithRoles()

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1">Roles</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Assign a role to each user. A user appears here after their first Google sign-in.
      </p>

      {!isConfigured && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-sm">SUPABASE_SERVICE_ROLE_KEY is not configured</p>
            <p className="text-muted-foreground">
              Supabase Admin API requires the <code className="font-mono px-1 py-0.5 bg-muted rounded">SUPABASE_SERVICE_ROLE_KEY</code> in your environment variables (<code className="font-mono">.env</code>) to list and update user roles.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground uppercase font-semibold">
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-8 text-muted-foreground text-xs">
                  {isConfigured ? "No authenticated users found yet." : "Configure SUPABASE_SERVICE_ROLE_KEY to load users."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{u.email}</td>
                  <td className="p-3 text-muted-foreground">{u.name || '-'}</td>
                  <td className="p-3">
                    <RoleSelect userId={u.id} current={u.role} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
