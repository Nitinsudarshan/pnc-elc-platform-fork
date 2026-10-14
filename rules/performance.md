---
trigger: always_on
description: Bundle size and rendering performance basics
globs: "**/*.tsx"
---

# Performance Rules

## Rules

- Always use `next/image` for images, not a raw `<img>` tag — gives automatic
  sizing/optimization for free.
- Dynamically import heavy client-only libraries with `next/dynamic` and
  `ssr: false` where they're not needed on first paint — especially chart
  components (the shadcn chart wrapper) and any spreadsheet parsing done in the
  browser (e.g. client-side preview before upload).
- Don't put chart-heavy or import/export-heavy components on a page that
  doesn't need them on initial load — lazy-load them behind a tab, modal, or
  route split instead.
- Memoize expensive derived data (`useMemo`) when transforming larger datasets
  (employee lists, onboarding pipeline rows) in a Client Component — don't recompute
  on every render.
