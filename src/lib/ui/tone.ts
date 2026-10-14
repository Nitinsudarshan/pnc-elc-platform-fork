// ============================================================================
// SEMANTIC TONE TOKENS
// ----------------------------------------------------------------------------
// One place to resolve a semantic status into Tailwind classes that clear
// WCAG AA in BOTH light and dark mode.
//
// The rule these follow: never paint a surface with a fixed light tint
// (`bg-emerald-500/10`) — in dark mode that stays near-white while the page around
// it is near-black, and any foreground on it collapses. Instead:
//
//   surface  -> alpha tint of the 500 step (`bg-emerald-500/10`), which
//               composites over whatever background is behind it, so it reads
//               as a soft tint in light mode and a soft glow in dark mode.
//   text     -> 700 in light, 300 in dark (>= 4.5:1 against both surfaces).
//   border   -> alpha of the 500 step, visible on both.
//   solid    -> the 700 step with white text, in BOTH themes. Measured against
//               white: emerald-600 is 3.65:1 and amber-600 is 3.20:1, so the
//               600 step fails AA for small text; the 700 step clears it for
//               every family here (emerald 5.36, amber 5.03, blue 6.83,
//               rose 6.03, indigo 8.09, slate 10.36). A lighter fill in dark
//               mode is worse, not better -- emerald-500 on white is 2.47:1.
// ============================================================================

export type Tone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'pending'
  | 'accent';

export interface ToneClasses {
  /** Soft tinted surface + readable foreground + border. For badges and cards. */
  soft: string;
  /** Filled surface with white foreground. For primary/solid badges and buttons. */
  solid: string;
  /** Foreground only — for icons and inline emphasis on a plain surface. */
  text: string;
  /** Border only. */
  border: string;
  /** Tinted surface only, no foreground. */
  surface: string;
  /** Icon chip: tinted square behind a small icon. */
  chip: string;
}

/**
 * `soft` deliberately sets text and border together: a tinted surface without a
 * matched foreground is the exact combination that fails in one of the two
 * themes, so the token never hands out one without the other.
 */
export const TONES: Record<Tone, ToneClasses> = {
  neutral: {
    soft: 'bg-muted text-muted-foreground border-border',
    solid: 'bg-foreground text-background',
    text: 'text-muted-foreground',
    border: 'border-border',
    surface: 'bg-muted',
    chip: 'bg-muted text-muted-foreground',
  },
  info: {
    soft: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
    solid: 'bg-blue-700 hover:bg-blue-800 text-white',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
    surface: 'bg-blue-500/10',
    chip: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  success: {
    soft: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    solid: 'bg-emerald-800 hover:bg-emerald-800 text-white',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    surface: 'bg-emerald-500/10',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    soft: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    solid: 'bg-amber-800 hover:bg-amber-800 text-white',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
    surface: 'bg-amber-500/10',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  danger: {
    soft: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    solid: 'bg-rose-700 hover:bg-rose-800 text-white',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/30',
    surface: 'bg-rose-500/10',
    chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
  pending: {
    soft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
    solid: 'bg-slate-700 hover:bg-slate-800 text-white',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/30',
    surface: 'bg-slate-500/10',
    chip: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  },
  accent: {
    soft: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    solid: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-500/30',
    surface: 'bg-indigo-500/10',
    chip: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  },
};

export function tone(name: Tone, variant: keyof ToneClasses = 'soft'): string {
  return TONES[name][variant];
}

/** Map a lifecycle status string onto a tone. Unknown values fall back to neutral. */
export function statusTone(status?: string | null): Tone {
  if (!status) return 'neutral';
  const s = status.toLowerCase();

  if (/(completed|verified|approved|confirmed|active|signed|granted|settled|returned|cleared|compliant|success|done)/.test(s)) {
    return 'success';
  }
  if (/(rejected|failed|missing|damaged|overdue|critical|revoked|terminated|blocked|error)/.test(s)) {
    return 'danger';
  }
  if (/(pending|awaiting|not_started|draft|changes_requested|warning|extended|at_risk|due)/.test(s)) {
    return 'warning';
  }
  if (/(scheduled|in_progress|invited|submitted|under_review|uploaded|processing|sent|generating)/.test(s)) {
    return 'info';
  }
  return 'neutral';
}
