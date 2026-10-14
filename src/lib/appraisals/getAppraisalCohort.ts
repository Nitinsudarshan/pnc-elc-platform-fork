import type { AppraisalCycle } from '@/lib/settings/types'

export function getAppraisalCohortFromCycles(
  referenceDate: Date,
  cycles: AppraisalCycle[]
): string | null {
  const month = referenceDate.getMonth() + 1
  for (const cycle of cycles) {
    if (!cycle.is_active) continue
    if (cycle.cohort_start_month <= cycle.cohort_end_month) {
      if (month >= cycle.cohort_start_month && month <= cycle.cohort_end_month) {
        return cycle.name
      }
    } else {
      // Wraps around calendar year end (e.g. October [10] through March [3])
      if (month >= cycle.cohort_start_month || month <= cycle.cohort_end_month) {
        return cycle.name
      }
    }
  }
  return null
}

export function getAppraisalCohort(referenceDate: Date): 'july' | 'december'
export function getAppraisalCohort(referenceDate: Date, cyclesOverride: AppraisalCycle[]): string
export function getAppraisalCohort(
  referenceDate: Date,
  cyclesOverride?: AppraisalCycle[] | null
): 'july' | 'december' | string {
  if (cyclesOverride && cyclesOverride.length > 0) {
    const matched = getAppraisalCohortFromCycles(referenceDate, cyclesOverride)
    if (matched) return matched
  }

  const month = referenceDate.getMonth() + 1 // JS months are 0-indexed; convert to 1-12

  // Default fallback cycles:
  // April (4) through September (9) inclusive → July cycle
  // October (10) through March (3) → December cycle
  if (month >= 4 && month <= 9) {
    return 'july'
  }
  return 'december'
}