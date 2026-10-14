import {
  DROPPED_EMPLOYEE_STATUSES,
  EMPLOYEE_TYPE_LABELS,
} from '@/lib/onboarding/automation/constants'

import type { EmployeeType } from '@/types/onboarding'

/**
 * Eligibility carve-outs, ported verbatim from the Apps Script `utils.gs`.
 *
 * The original matched keywords against a free-text "employee type + department"
 * string. That is preserved here — `employee_type` is an enum in this schema, so
 * it is expanded to its label first, which keeps department-driven rules (notably
 * "Residential Intern") working exactly as before.
 */

const toKeywordText = (
  employeeType: EmployeeType | null | undefined,
  department: string | null | undefined
): string => {
  const type = employeeType ? EMPLOYEE_TYPE_LABELS[employeeType] : ''
  return `${type} ${department ?? ''}`.toLowerCase().trim()
}

const INDUCTION_EXCLUDED_KEYWORDS = [
  'apprentice',
  'apprenticeship',
  'part-time',
  'part time',
  'hourly',
  'contract',
  'short-term',
  'short term',
  'volunteer',
]

const CONTRACT_KEYWORDS = [
  'apprentice',
  'apprenticeship',
  'contract',
  'short-term',
  'short term',
]

/**
 * Whether the employee goes through the full induction (Slack sequence and the
 * induction task emails).
 *
 * Residential interns are excluded; remote and regular interns are not.
 */
export const isInductionEligible = (
  employeeType: EmployeeType | null | undefined,
  department: string | null | undefined
): boolean => {
  const text = toKeywordText(employeeType, department)
  if (!text) return true

  if (INDUCTION_EXCLUDED_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return false
  }

  if (text.includes('intern')) {
    return !text.includes('residential')
  }

  return true
}

/**
 * Apprentice and contract workers skip the four onboarding calls (manager,
 * buddy, technical, warm) and the P&C check-in.
 */
export const isContractOrApprentice = (
  employeeType: EmployeeType | null | undefined,
  department: string | null | undefined
): boolean => {
  const text = toKeywordText(employeeType, department)
  if (!text) return false

  return CONTRACT_KEYWORDS.some((keyword) => text.includes(keyword))
}

/** Sama staff run their own warm onboarding, so ours is skipped for them. */
export const isSamaEmployee = (
  officialEmail: string | null | undefined,
  personalEmail: string | null | undefined
): boolean =>
  [officialEmail, personalEmail].some((email) =>
    String(email ?? '')
      .toLowerCase()
      .trim()
      .endsWith('@thesama.in')
  )

/** A resigned/terminated/dropped employee halts every automation. */
export const isDroppedStatus = (status: string | null | undefined): boolean =>
  DROPPED_EMPLOYEE_STATUSES.includes(String(status ?? '').toLowerCase().trim())

export const normalizeEmail = (email: string | null | undefined): string =>
  String(email ?? '')
    .toLowerCase()
    .trim()
