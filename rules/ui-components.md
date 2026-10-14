---
trigger: always_on
description: shadcn/ui and styling conventions — mandatory for all UI, including charts
globs: "**/*.tsx"
---

# UI Component Rules

**Always use shadcn/ui for components.** This applies to everything — buttons,
inputs, forms, dialogs, sheets, tables, cards, dropdowns, tabs, tooltips, badges,
navigation, AND charts/graphs. Do not hand-build a custom component if a
shadcn/ui equivalent exists.

## Rules

- Use shadcn primitives before creating anything custom. Check
  `src/components/ui` first; if the primitive doesn't exist yet, generate it via
  the shadcn CLI (`npx shadcn add <component>`) — do not hand-roll a replacement.
- **Charts and graphs must use shadcn's chart component** (`npx shadcn add chart`),
  which wraps Recharts with themeable styling — not raw `recharts` components
  used directly, and not any other charting library. The wrapper is not yet
  installed in this project; the first chart added should generate it with the
  shadcn CLI (which brings `recharts` in as its dependency) and reach it only
  through `ChartContainer` / `ChartTooltip`, never importing `recharts`
  standalone. See `charts.md` for colour rules.
- Do not write raw CSS (`.module.css`, inline `style={{}}`) or Tailwind-only
  custom components for things shadcn already provides — forms, modals, toasts,
  tables, dropdowns, etc. all have a shadcn primitive; use it.
- Components must support both light mode and dark mode — use theme-aware
  classes (`bg-background`, `text-foreground`, `border-border`) rather than
  explicit `bg-white` / `bg-black` / ad hoc `dark:` overrides.
- Use shadcn blocks as the starting point for common layouts (cards, forms,
  tables, dashboards) rather than building the same layouts from scratch.
- When a shadcn primitive needs project-specific behavior (e.g. a `DataTable`
  wrapper with sorting, or a chart with custom tooltips), wrap it in
  `src/components/shared` rather than editing the generated file in
  `src/components/ui` directly — keeps future shadcn updates from being
  overwritten or conflicting.
- The only acceptable exception is when genuinely no shadcn equivalent exists
  (e.g. a bespoke illustration, a marketing hero section, a third-party embed
  with its own required markup) — and even then it must still use design tokens
  from `design-system.md`, not raw hardcoded styling.

## Known gaps

- `src/components/ui/chart.tsx` does not exist yet, and no charting library is
  installed. The first feature that needs a chart generates the wrapper via
  `npx shadcn add chart` rather than hand-rolling one or adding a different
  library.
- `src/components/ui/form.tsx` does not exist either, and neither do
  `react-hook-form`, `zod` or `@hookform/resolvers`. The first non-trivial form
  adds them together, as `forms-and-validation.md` describes — existing forms
  predate that rule and are not the pattern to copy.
- `src/components/shared/` currently contains both `page-banner.tsx` and
  `page_banner.tsx` (the former re-exports the latter). Import from
  `@/components/shared/page-banner`.
