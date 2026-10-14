import type { ConfirmationRule } from '@/lib/settings/types'

export function calculateConfirmationTriggerDate(
  rule: ConfirmationRule,
  baseDateStr: string
): Date | null {
  if (!rule.enabled) return null
  const base = new Date(baseDateStr)
  if (isNaN(base.getTime())) return null

  const trigger = new Date(base)
  if (rule.offset_unit === 'days') {
    trigger.setDate(trigger.getDate() + rule.offset_value)
  } else if (rule.offset_unit === 'weeks') {
    trigger.setDate(trigger.getDate() + rule.offset_value * 7)
  } else {
    // default: months
    trigger.setMonth(trigger.getMonth() + rule.offset_value)
  }
  return trigger
}

export function getConfirmationTriggerDate(
  employeeType: string,
  joiningDate: string,
  ruleOverride?: ConfirmationRule | null
): Date | null {
  if (ruleOverride) {
    return calculateConfirmationTriggerDate(ruleOverride, joiningDate)
  }

  const joining = new Date(joiningDate)
  if (isNaN(joining.getTime())) return null

  // Defaults aligned with approved ELC requirements
  const offsets: Record<string, number> = {
    apprentice_nontech: 1,
    apprentice_tech: 2, // Approved ELC requirement: 2 months
    intern: 3,
    fte: 3,             // Approved ELC requirement: 3 months
    ftc: 3,
  }

  const months = offsets[employeeType]
  if (months === undefined) return null // contractor or unknown type — needs manual entry

  const trigger = new Date(joining)
  trigger.setMonth(trigger.getMonth() + months)
  return trigger
}