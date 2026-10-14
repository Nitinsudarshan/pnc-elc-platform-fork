import {
  INDUCTION_TASKS,
  INDUCTION_TASK_DUE_OFFSET_DAYS,
  ONBOARDING_COMPLETED_STEP,
  ONBOARDED_AFTER_DAYS,
  PIPELINE_ORDER,
  STEP_DEFINITIONS,
  type StepDefinition,
} from '@/lib/onboarding/automation/constants'
import { addDays, addMonths, diffInDays, nextOrSameFriday, parseDateOnly, toDateKey } from '@/lib/onboarding/automation/dates'
import {
  isContractOrApprentice,
  isDroppedStatus,
  isInductionEligible,
  isSamaEmployee,
} from '@/lib/onboarding/automation/eligibility'

import type {
  JourneyContext,
  OnboardingStage,
  OnboardingStepStatus,
  PlannedStep,
} from '@/types/onboarding'

/**
 * The scheduling engine: turns one employee into a dated list of onboarding
 * steps. Pure — it touches no database and no clock beyond the `today` it is
 * handed, so the whole pipeline can be reasoned about and tested directly.
 */

/** Resolves a step's calendar date from the employee's joining date. */
export const resolveStepDate = (
  definition: StepDefinition,
  joiningDate: Date
): Date => {
  if (definition.anchor === 'doj_plus_14_friday') {
    return nextOrSameFriday(addDays(joiningDate, definition.offsetDays))
  }

  if (definition.offsetMonths) {
    return addMonths(joiningDate, definition.offsetMonths)
  }

  return addDays(joiningDate, definition.offsetDays)
}

type Eligibility = { status: OnboardingStepStatus; skipReason?: string }

/**
 * Decides whether a step should ever run for this employee.
 *
 * A missing contact (no manager assigned yet, official email not issued) is
 * deliberately *not* a skip — the step stays pending and surfaces as an
 * attention flag, exactly as the spreadsheet version did, so P&C can fill the
 * gap and the step still goes out.
 */
export const evaluateStepEligibility = (
  definition: StepDefinition,
  context: JourneyContext
): Eligibility => {
  if (isDroppedStatus(context.employeeStatus)) {
    return { status: 'skipped', skipReason: 'Employee has exited' }
  }

  if (
    definition.skipForContractOrApprentice &&
    isContractOrApprentice(context.employeeType, context.department)
  ) {
    return { status: 'skipped', skipReason: 'Apprentice or contract worker' }
  }

  if (
    definition.requiresInductionEligible &&
    !isInductionEligible(context.employeeType, context.department)
  ) {
    return { status: 'skipped', skipReason: 'Not induction eligible' }
  }

  if (
    definition.skipForSama &&
    isSamaEmployee(context.officialEmail, context.personalEmail)
  ) {
    return { status: 'skipped', skipReason: 'Sama employee' }
  }

  if (
    definition.onlyForEmployeeTypes &&
    !definition.onlyForEmployeeTypes.includes(context.employeeType)
  ) {
    return { status: 'skipped', skipReason: 'Not applicable to employee type' }
  }

  return { status: 'pending' }
}

/**
 * Steps at or before the journey's `last_completed_step` were already handled
 * elsewhere (manually, or by the legacy script before migration), so they are
 * never re-sent.
 */
export const isHandledBeforeImport = (
  stepKey: string,
  lastCompletedStep: string | null
): boolean => {
  if (!lastCompletedStep) return false
  if (lastCompletedStep === ONBOARDING_COMPLETED_STEP) return true

  const completedIndex = PIPELINE_ORDER.indexOf(lastCompletedStep)
  const stepIndex = PIPELINE_ORDER.indexOf(stepKey)

  if (completedIndex < 0 || stepIndex < 0) return false
  return stepIndex <= completedIndex
}

/** Builds the full dated step plan for one employee. */
export const planSteps = (context: JourneyContext): PlannedStep[] => {
  const joiningDate = parseDateOnly(context.joiningDate)
  if (!joiningDate) return []

  return STEP_DEFINITIONS.map((definition) => {
    const scheduledFor = toDateKey(resolveStepDate(definition, joiningDate))

    if (isHandledBeforeImport(definition.key, context.lastCompletedStep)) {
      return {
        stepKey: definition.key,
        channel: definition.channel,
        scheduledFor,
        status: 'skipped' as const,
        skipReason: 'Completed before import',
      }
    }

    const { status, skipReason } = evaluateStepEligibility(definition, context)

    return {
      stepKey: definition.key,
      channel: definition.channel,
      scheduledFor,
      status,
      skipReason,
    }
  })
}

/** The six induction tasks, dated from the employee's joining date. */
export const planTasks = (context: JourneyContext) => {
  const joiningDate = parseDateOnly(context.joiningDate)
  if (!joiningDate) return []

  const dueDate = toDateKey(
    addDays(joiningDate, INDUCTION_TASK_DUE_OFFSET_DAYS)
  )

  return INDUCTION_TASKS.map((task) => ({
    taskKey: task.key,
    dueDate,
  }))
}

/**
 * The stage machine: Pre-boarding before the DOJ, Onboarding In Progress through
 * day 14, Onboarded from day 15 — or immediately, once the journey is flagged
 * complete.
 */
export const deriveStage = (
  context: Pick<JourneyContext, 'joiningDate' | 'lastCompletedStep' | 'isCompleted'>,
  today: Date
): OnboardingStage => {
  if (
    context.isCompleted ||
    context.lastCompletedStep === ONBOARDING_COMPLETED_STEP
  ) {
    return 'onboarded'
  }

  const joiningDate = parseDateOnly(context.joiningDate)
  if (!joiningDate) return 'pre_boarding'

  const daysSinceJoining = diffInDays(joiningDate, today)

  if (daysSinceJoining >= ONBOARDED_AFTER_DAYS) return 'onboarded'
  if (daysSinceJoining < 0) return 'pre_boarding'
  return 'onboarding_in_progress'
}
