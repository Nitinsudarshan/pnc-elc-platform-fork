---
trigger: always_on
description: RBAC system architecture and how to register a new feature
---

# Role-Based Access Control (RBAC) Settings

This project uses a **role-based, feature-scoped** access control system. A user
holds exactly one role; each feature declares which roles may reach it.

## CRITICAL RULE: Registering new features

**Every time a new feature, page, or module is built, it MUST be added to the
RBAC matrix.** A route that isn't registered is reachable by every signed-in
user, including `Employee`.

To register one:

1. Open `src/lib/role-constants.ts`.
2. Add the feature to the `Feature` union — e.g. `"onboarding"`.
3. Add its entry to `FEATURE_ACCESS` listing every role allowed in:
   `onboarding: ["Super Admin", "Admin", "PnC", "Manager"],`
4. Map its route prefix in `ROUTE_FEATURE`: `["/onboarding", "onboarding"],`
5. Gate the route group with a `layout.tsx` that awaits `requireFeature`:

   ```tsx
   import { requireFeature } from '@/lib/rbac/requireFeature'

   export default async function Layout({ children }: { children: React.ReactNode }) {
     await requireFeature('onboarding')
     return <>{children}</>
   }
   ```

Adding the feature to `Feature` without adding it to `FEATURE_ACCESS` is a type
error, which is deliberate — the matrix cannot silently fall out of date.

## How the engine works

- A user's role lives in their Supabase auth `app_metadata.role`, read on the
  server by `getCurrentUserRole()` (`src/lib/rbac/getCurrentUserRole.ts`).
- `requireFeature(feature)` (`src/lib/rbac/requireFeature.ts`) is the single
  enforcement point: it redirects to `/login` when there is no session, and to
  `/` when the role is not in that feature's list.
- `canAccessRoute(role, url)` in `src/lib/role-constants.ts` answers the same
  question for navigation, so the sidebar hides what the user cannot open.
- **Fail-safe default:** a user with no role is treated as `DEFAULT_ROLE`
  (`Employee`), which appears in no feature list by default.
- `ROLE_HIERARCHY` ranks roles numerically. It governs impersonation
  (`canImpersonate`) only — it is **not** a privilege ladder: a higher rank does
  not implicitly grant a lower-ranked role's features. Feature access is decided
  solely by membership in `FEATURE_ACCESS`.

## Assigning roles

- Roles are assigned at `/manage/roles` and `/manage/users`, which are
  themselves gated behind the `manageUsers` feature.
- `setUserRole()` (`src/lib/rbac/setUserRole.ts`) enforces the rules that the UI
  must not be trusted to enforce: only `Admin`/`Super Admin` may assign at all,
  only a `Super Admin` may grant or modify an admin role, a user may never
  change their own role, and the role must appear in `ASSIGNABLE_ROLES`.
- Writing a role uses the service-role client, so it is server-only — never
  call it from a Client Component (see `security.md`).

## Enforcement boundary

RBAC decides which *routes and features* a user reaches. It is not row-level
security: Supabase RLS policies remain the authorization layer for data (see
`data-access.md`). A page passing `requireFeature` does not entitle its queries
to bypass RLS.
