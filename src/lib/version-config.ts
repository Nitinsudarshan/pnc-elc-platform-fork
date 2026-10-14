/**
 * Centralised version and changelog registry for the PnC ELC Platform.
 *
 * `rules/version-and-changelog.md` requires this file to be updated as part of
 * every task, before the work is pushed. Each entry's descriptions must match
 * the actual diff of the change it describes.
 */

export type VersionChangeCategory =
  | 'Features'
  | 'Improvements'
  | 'Fixes'
  | 'Security'

export type VersionChange = {
  category: VersionChangeCategory
  description: string
}

export type VersionEntry = {
  version: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  title: string
  type: 'patch' | 'minor' | 'major'
  changes: VersionChange[]
}

export const CURRENT_VERSION = '1.02.00'

/** Newest first. Prepend new entries; never rewrite a released one. */
export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '1.02.00',
    date: '2026-10-15',
    title: 'Onboarding automation safety rails',
    type: 'minor',
    changes: [
      {
        category: 'Security',
        description:
          'ONBOARDING_MODE (off | dry_run | sandbox | live), defaulting to off and enforced inside the channel adapters so no code path can dispatch without it. Sandbox redirects every recipient and defers rather than falling through to a real joiner when unconfigured.',
      },
      {
        category: 'Fixes',
        description:
          'Due-step triage now caps lateness at 5 days and attempts at 3. Previously a step had no upper bound, so a first live run would have dispatched every historical step for every journey at once.',
      },
      {
        category: 'Security',
        description:
          'Steps are claimed atomically before dispatch, with stale-claim recovery, and runs are recorded in onboarding_runs, so an overlapping or retried cron cannot send the same message twice.',
      },
      {
        category: 'Improvements',
        description:
          'ONBOARDING_TODAY_OVERRIDE lets staging time-travel through a joiner timeline; ignored in live mode. Run mode is shown as a badge in the onboarding header.',
      },
      {
        category: 'Improvements',
        description:
          'Vitest added with 53 tests covering the late window, mode matrix, date handling, eligibility carve-outs and stage boundaries. Decisions log and .env.example added.',
      },
    ],
  },
  {
    version: '1.01.00',
    date: '2026-10-14',
    title: 'Onboarding automation module',
    type: 'minor',
    changes: [
      {
        category: 'Features',
        description:
          'Onboarding journeys, steps, tasks and logs schema, replacing the external spreadsheet trackers.',
      },
      {
        category: 'Features',
        description:
          'DOJ-relative scheduling engine covering the email, Slack, calendar and induction-task pipeline, with the eligibility carve-outs and stage machine ported from the previous automation.',
      },
      {
        category: 'Features',
        description:
          'Email, Slack and Google Calendar channel adapters; Slack and Calendar defer cleanly until credentials are configured.',
      },
      {
        category: 'Features',
        description:
          'Daily onboarding run at /api/cron/onboarding, and the /onboarding dashboard with progress, filters and a per-employee drawer.',
      },
      {
        category: 'Security',
        description:
          'Onboarding moved behind the RBAC matrix, and credential emails are surfaced for manual sending rather than storing any account password.',
      },
    ],
  },
  {
    version: '1.00.00',
    date: '2026-10-12',
    title: 'Employee lifecycle platform baseline',
    type: 'major',
    changes: [
      {
        category: 'Features',
        description:
          'Employee directory and profiles, probation confirmations with peer feedback, appraisal cohorts and reports, and data management with import history and rollback.',
      },
      {
        category: 'Security',
        description:
          'Role-based access control backed by Supabase app_metadata.',
      },
    ],
  },
]
