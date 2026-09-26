import type { AppraisalRule } from '@/lib/settings/types'

export function calculateAppraisalReferenceDate(
  rule: AppraisalRule,
  employee: {
    joiningDate: string
    conversionDate?: string | null
  }
): Date | null {
  if (!rule.eligible) return null

  let baseDateStr = employee.joiningDate
  if (rule.reference_basis === 'conversion_date') {
    if (!employee.conversionDate) return null
    baseDateStr = employee.conversionDate
  }

  const base = new Date(baseDateStr)
  if (isNaN(base.getTime())) return null

  const reference = new Date(base)
  if (rule.offset_unit === 'days') {
    reference.setDate(reference.getDate() + rule.offset_value)
  } else if (rule.offset_unit === 'weeks') {
    reference.setDate(reference.getDate() + rule.offset_value * 7)
  } else {
    // default: months
    reference.setMonth(reference.getMonth() + rule.offset_value)
  }

  return reference
}

export function getAppraisalReferenceDate(
  employee: {
    employeeType: string
    joiningDate: string
    conversionDate: string | null
  },
  ruleOverride?: AppraisalRule | null
): Date | null {
  if (ruleOverride) {
    return calculateAppraisalReferenceDate(ruleOverride, employee)
  }

  if (employee.employeeType === 'intern') {
    return employee.conversionDate ? new Date(employee.conversionDate) : null
  }

  if (employee.employeeType === 'fte' || employee.employeeType === 'ftc') {
    const reference = new Date(employee.joiningDate)
    reference.setMonth(reference.getMonth() + 6)
    return reference
  }

  // apprentices, contractors — not eligible
  return null
}