---
trigger: always_on
description: Supabase client usage, RLS assumptions, and data-fetching conventions
globs: "src/app/**, src/lib/**"
---

# Data Access Rules (Supabase)

## Rules

- Never call `createClient` (browser or server) directly inside a component or
  route handler — always import the pre-configured client from `src/lib/supabase`
  (server client for Server Components/route handlers, browser client for
  Client Components).
- Never use the Supabase service-role key in any code that ships to the browser.
  Service-role access is server-only (route handlers, server actions, scripts) —
  if a task seems to need it in a Client Component, that's a sign the query
  should move server-side.
- Assume Row Level Security (RLS) is the primary authorization layer, not an
  optional add-on. Don't write queries that assume "the UI won't show this
  anyway" as a substitute for an RLS policy — a query without a matching policy
  should fail closed, not silently return everything.
- Keep query logic in `src/lib/<domain>/` (e.g. `src/lib/employees`,
  `src/lib/confirmations`, `src/lib/onboarding`) — don't inline
  `.from('table').select(...)` chains deep inside component JSX. Components call
  a named function (`getEmployees()`), not the Supabase client directly.
- Handle Supabase errors explicitly — check `error` on every call and surface a
  user-facing message (via `sonner`) rather than letting a failed query silently
  render an empty state.
- Schema changes ship as a new timestamped migration in `supabase/migrations/`
  (e.g. `202610140900_create_onboarding_tables.sql`) — never by editing an
  existing migration that has already been applied, and never as an
  out-of-band change made directly in the Supabase dashboard.
- Every new table enables RLS and declares its policies in the same migration
  that creates it, following the `to authenticated` pattern the existing tables
  use. A table without policies is unreadable, not open.
