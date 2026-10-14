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

export const CURRENT_VERSION = '1.01.00'

/** Newest first. Prepend new entries; never rewrite a released one. */
export const VERSION_HISTORY: VersionEntry[] = [
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
