---
trigger: always_on
description: Folder structure — where new files should be created
---

# Project Folder Structure

This reflects the actual current layout of the PnC ELC Platform. Follow it —
don't introduce `/features` or `/components/blocks` unless a future restructure
is explicitly requested; this file will be updated first if that happens.

```
src/
  app/                Next.js App Router routes (pages, layouts, route handlers)
    (dashboard)/       Authenticated app routes:
                         employees/, onboarding/, confirmations/, appraisals/,
                         data-management/, manage/, feedback/, components/
    api/               Route handlers (server endpoints)
      cron/            Scheduled jobs, registered in vercel.json
    auth/              Auth callback routes
    login/             Login route
  components/
    ui/                shadcn/ui primitives (generated, treat as low-touch)
    shared/            Reusable, cross-route components (nothing shadcn already covers)
  contexts/            React context providers (e.g. user-context)
  hooks/               Custom hooks (`useXyz.ts`)
  lib/                 Shared utilities and non-UI logic
    supabase/          Supabase client setup (server, browser, admin)
    rbac/              Role lookup and route/feature gating
    employees/         Employee directory queries
    onboarding/        Onboarding automation (engine, channels, templates)
    confirmations/     Probation confirmation workflow
    appraisals/        Appraisal cohorts and reports
    profiles/          Employee profile reads/writes
    email/             Gmail sending
    calendar/          Calendar link helpers
  types/               Shared TypeScript types/interfaces

supabase/
  migrations/         Timestamped SQL migrations (the schema source of truth)
  seed/               Seed data
```

## Rules

- Reusable UI primitives (buttons, inputs, dialogs) go in `src/components/ui` —
  prefer generating these via the shadcn CLI over hand-writing them.
- Cross-route, non-primitive components (a table, a stat card, a nav bar) go in
  `src/components/shared`.
- Route-specific components used by only one page can be co-located next to that
  route (e.g. `src/app/(dashboard)/onboarding/_components/`) rather than forced
  into `shared`.
- Domain-specific logic (parsing, transforms, business rules) goes under
  `src/lib/<domain>/` (see `lib/onboarding` and `lib/confirmations` as the
  existing patterns) — not inline in components.
- Keep domain logic free of I/O where it can be: `lib/onboarding/schedule.ts`
  computes the whole pipeline as pure functions and the database is touched by
  separate loader/runner modules. Prefer that split for anything with rules
  worth testing.
- All Supabase client creation goes through `src/lib/supabase` — never call
  `createClient` directly from a component or route handler (see `data-access.md`).
- Shared types go in `src/types`; don't redefine the same shape in multiple files.
- Custom hooks go in `src/hooks`, one hook per file.
- Any root-level `.ts` maintenance script is not part of the deployed app —
  don't import from it into `src/`, and don't apply component/UI rules to it.
