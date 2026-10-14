---
globs: **/*.tsx
---

# Charts, Graphs, and Data Visualizations

CONTEXT: This applies specifically to CHARTS, GRAPHS, and DATA VISUALIZATIONS
in the PnC ELC Platform — not general UI colors, buttons, or badges.

Use this decision framework whenever you write or edit a chart:

## Color Tokens

`src/app/globals.css` defines the standard shadcn chart ramp, with a light and a
dark value for each:

- `--color-chart-1` — **primary**: the default series colour
- `--color-chart-2` — **accent-1**: the comparison series
- `--color-chart-3` — **accent-2**: the third series
- `--color-chart-4`, `--color-chart-5` — reserve; see "4+ Colors" below

Semantic colours are **not** chart tokens here. For trend and status marks use
the theme's own tokens — `text-emerald-600 dark:text-emerald-400` for positive,
`text-destructive` for negative, `text-amber-600 dark:text-amber-400` for
warning — and the muted/border tokens (`text-muted-foreground`,
`border-border`) for axes, gridlines and long-tail "Other" categories.

Below, "primary / accent-1 / accent-2" mean chart-1 / chart-2 / chart-3.

## How Many Colors to Use

Decide by what the chart is actually showing:

### 1 Color (`--color-chart-1` only)
Use when: a single metric, single series over time, or one hero number.
Examples: "Joiners per month" line chart, "Confirmations due this quarter" bar chart.
Everything else in the chart (axis, grid, labels) uses neutral/gray tokens — never invent a second data color just to fill space.

### 2 Colors (`--color-chart-1` + `--color-chart-2`)
Use when: comparing exactly two series or two time periods.
Examples: "This year vs last year," "Active vs exited employees," side-by-side bars.
Primary = the subject being emphasized; accent-1 = the comparison point. Reserve accent-2 for when a third series shows up — don't reach for it in a 2-series chart.

### 3 Colors (`--color-chart-1` + `--color-chart-2` + `--color-chart-3`)
Use when: comparing three genuinely distinct, equally-weighted series.
Examples: "Pre-boarding / In progress / Onboarded," "Engineering / Design / Operations."
All three are pre-harmonized to be distinguishable from each other, unlike bolting on an arbitrary third hue.

**Separate case — 2 meaningful series + a residual:** use primary + accent-1 + a muted token for the "long tail." Example: a donut/bar with "Engineering," "Design," and "Other" — the first two get primary/accent-1, everything long-tail gets muted (never accent-2 or a 4th bright hue for "Other").

For semantic delta charts, pair primary (current value) with the positive and negative theme tokens above, not with chart-2/chart-3.

### 4+ Colors
`--color-chart-4` and `--color-chart-5` exist, but reach for them last. AVOID for
standard charts. If a chart seems to need 4+ distinct data colors, that's a signal to change the CHART TYPE, not add more hues:
- Convert to a stacked/grouped bar with ONE hue at varying opacity, OR
- Break into small multiples (several 1-color charts side by side), OR
- Fold minor categories into "Other" (neutral gray) and keep only the top 2-3 (primary/accent-1/accent-2) as named colors, OR
- Use a table instead of a chart if there are more than ~5-7 categories that all matter individually.

## Semantic Colors

Success/danger/warning are reserved ONLY for:
- Trend indicators (up/down arrows, delta badges)
- Status/alert states (e.g. "at risk," "flagged")

Never use success/danger/warning as general categorical colors for unrelated data series — they carry meaning and must stay reserved for that.

## Hard Rules

- **Never** cycle through all tokens like a rainbow palette — accent-1 and accent-2 are a matched pair for 3-series cases, not two independent colors to combine with semantic colours in the same chart.
- **Every chart** must work in both light and dark mode via the CSS variables — never hardcode hex values in a chart component.
- **Gridlines, axis text, and chart background** always use the muted/border/background theme tokens, never a chart or semantic colour.
- **When in doubt, use fewer colors.** A chart that needs a legend to explain 6+ colors is a chart that should be redesigned.