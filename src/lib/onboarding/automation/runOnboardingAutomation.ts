import { dispatchStep, type DispatchOutcome } from '@/lib/onboarding/automation/channels'
import { STEP_DEFINITION_BY_KEY } from '@/lib/onboarding/automation/constants'
import { getOrgToday } from '@/lib/onboarding/automation/dates'
import { loadJourneys, type LoadedJourney } from '@/lib/onboarding/automation/loadJourneys'
import { getDueSteps } from '@/lib/onboarding/automation/progress'
import { deriveStage } from '@/lib/onboarding/automation/schedule'
import { syncJourneys } from '@/lib/onboarding/automation/syncJourneys'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { OnboardingStepRecord } from '@/types/onboarding'

/**
 * The daily onboarding run — the equivalent of the Apps Script `masterCronJob`.
 *
 * Order matters: journeys are synced before stages are refreshed, and stages
 * before anything is dispatched, so a joiner added this morning still gets their
 * day-zero mail on the same run.
 *
 * Every stage is isolated: one employee's failure is logged and the run
 * continues, rather than taking the whole cohort down with it.
 */

export type RunSummary = {
  journeysCreated: number
  journeysRescheduled: number
  stepsSent: number
  stepsSkipped: number
  stepsDeferred: number
  stepsFailed: number
  errors: string[]
}

type LogEntry = {
  journeyId: string | null
  employeeName: string
  module: string
  action: string
  status: 'success' | 'error' | 'skipped'
  error?: string
}

const writeLogs = async (supabase: SupabaseClient, entries: LogEntry[]) => {
  if (entries.length === 0) return

  const { error } = await supabase.from('onboarding_logs').insert(
    entries.map((entry) => ({
      journey_id: entry.journeyId,
      employee_name: entry.employeeName,
      module: entry.module,
      action: entry.action,
      status: entry.status,
      error: entry.error ?? null,
    }))
  )

  if (error) console.error('Onboarding run: failed to write logs', error.message)
}

/** Applies a dispatch outcome back onto the step row. */
const persistOutcome = async (
  supabase: SupabaseClient,
  step: OnboardingStepRecord,
  outcome: DispatchOutcome
) => {
  const now = new Date().toISOString()

  const patch: Record<string, unknown> = { updated_at: now }

  switch (outcome.status) {
    case 'sent':
      patch.status = 'sent'
      patch.completed_at = now
      patch.external_ref = outcome.externalRef ?? null
      patch.last_error = null
      patch.skip_reason = null
      patch.attempts = step.attempts + 1
      break
    case 'skipped':
      patch.status = 'skipped'
      patch.completed_at = now
      patch.skip_reason = outcome.reason
      break
    case 'deferred':
      // Stays pending and is retried on the next run; the reason is kept so the
      // dashboard can explain what the step is waiting for.
      patch.status = 'pending'
      patch.skip_reason = outcome.reason
      break
    case 'failed':
      patch.status = 'failed'
      patch.last_error = outcome.error
      patch.attempts = step.attempts + 1
      break
  }

  const { error } = await supabase
    .from('onboarding_steps')
    .update(patch)
    .eq('id', step.id)

  if (error) {
    console.error('Onboarding run: failed to persist step outcome', error.message)
  }
}

/** Refreshes stage and the terminal completion flag for every journey. */
const refreshStages = async (
  supabase: SupabaseClient,
  journeys: LoadedJourney[]
) => {
  const today = getOrgToday()

  for (const journey of journeys) {
    const stage = deriveStage(journey.context, today)

    // Complete once every step that counts towards progress has resolved and
    // all induction tasks are done. Post-onboarding steps (the 3-month
    // milestone) are excluded, and still dispatch afterwards.
    const trackedSteps = journey.steps.filter(
      (step) => !STEP_DEFINITION_BY_KEY[step.stepKey]?.excludeFromProgress
    )

    const allStepsResolved =
      trackedSteps.length > 0 &&
      trackedSteps.every(
        (step) => step.status === 'sent' || step.status === 'skipped'
      )

    const allTasksDone =
      journey.tasks.length > 0 && journey.tasks.every((task) => task.isCompleted)

    const isCompleted =
      journey.context.isCompleted || (allStepsResolved && allTasksDone)

    // Skip the write when nothing changed — otherwise every employee costs a
    // row update on every run, for nothing.
    if (
      stage === journey.context.stage &&
      isCompleted === journey.context.isCompleted
    ) {
      continue
    }

    await supabase
      .from('onboarding_journeys')
      .update({
        stage,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', journey.context.journeyId)
  }
}

type DueItem = { journey: LoadedJourney; step: OnboardingStepRecord }

/**
 * Groups batched calendar sessions so every joiner on a given date shares one
 * invite, exactly as the spreadsheet version did.
 */
const groupBatches = (items: DueItem[]) => {
  const batched = new Map<string, DueItem[]>()
  const individual: DueItem[] = []

  for (const item of items) {
    const definition = STEP_DEFINITION_BY_KEY[item.step.stepKey]
    if (definition?.isBatched) {
      const key = `${item.step.stepKey}|${item.step.scheduledFor}`
      const group = batched.get(key) ?? []
      group.push(item)
      batched.set(key, group)
    } else {
      individual.push(item)
    }
  }

  return { batched, individual }
}

export const runOnboardingAutomation = async (
  supabase: SupabaseClient
): Promise<RunSummary> => {
  const summary: RunSummary = {
    journeysCreated: 0,
    journeysRescheduled: 0,
    stepsSent: 0,
    stepsSkipped: 0,
    stepsDeferred: 0,
    stepsFailed: 0,
    errors: [],
  }

  const logs: LogEntry[] = []

  try {
    const syncSummary = await syncJourneys(supabase)
    summary.journeysCreated = syncSummary.journeysCreated
    summary.journeysRescheduled = syncSummary.journeysRescheduled
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    summary.errors.push(`sync: ${message}`)
    logs.push({
      journeyId: null,
      employeeName: 'System',
      module: 'sync',
      action: 'Sync journeys',
      status: 'error',
      error: message,
    })
  }

  const journeys = await loadJourneys(supabase)
  const today = getOrgToday()

  try {
    await refreshStages(supabase, journeys)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    summary.errors.push(`stages: ${message}`)
  }

  // Collect everything due across all journeys, then dispatch.
  const due: DueItem[] = []

  for (const journey of journeys) {
    for (const step of getDueSteps(journey.steps, today)) {
      const definition = STEP_DEFINITION_BY_KEY[step.stepKey]
      if (!definition) continue

      // A finished journey only still runs its post-onboarding steps.
      if (journey.context.isCompleted && !definition.excludeFromProgress) {
        continue
      }

      due.push({ journey, step })
    }
  }

  const { batched, individual } = groupBatches(due)

  const applyOutcome = async (item: DueItem, outcome: DispatchOutcome) => {
    await persistOutcome(supabase, item.step, outcome)

    const definition = STEP_DEFINITION_BY_KEY[item.step.stepKey]
    const action = definition?.label ?? item.step.stepKey

    switch (outcome.status) {
      case 'sent':
        summary.stepsSent += 1
        logs.push({
          journeyId: item.journey.context.journeyId,
          employeeName: item.journey.context.employeeName,
          module: item.step.channel,
          action,
          status: 'success',
        })
        break
      case 'skipped':
        summary.stepsSkipped += 1
        logs.push({
          journeyId: item.journey.context.journeyId,
          employeeName: item.journey.context.employeeName,
          module: item.step.channel,
          action,
          status: 'skipped',
          error: outcome.reason,
        })
        break
      case 'deferred':
        summary.stepsDeferred += 1
        break
      case 'failed':
        summary.stepsFailed += 1
        summary.errors.push(
          `${item.journey.context.employeeName} — ${action}: ${outcome.error}`
        )
        logs.push({
          journeyId: item.journey.context.journeyId,
          employeeName: item.journey.context.employeeName,
          module: item.step.channel,
          action,
          status: 'error',
          error: outcome.error,
        })
        break
    }
  }

  for (const item of individual) {
    const definition = STEP_DEFINITION_BY_KEY[item.step.stepKey]
    if (!definition) continue

    try {
      const outcome = await dispatchStep({
        definition,
        context: item.journey.context,
        step: item.step,
        tasks: item.journey.tasks,
      })

      await applyOutcome(item, outcome)

      // A newly created Slack channel has to be remembered before the welcome
      // message can be posted to it.
      if (
        item.step.stepKey === 'slack_channel' &&
        outcome.status === 'sent' &&
        outcome.externalRef
      ) {
        await supabase
          .from('onboarding_journeys')
          .update({ slack_channel_id: outcome.externalRef })
          .eq('id', item.journey.context.journeyId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await applyOutcome(item, { status: 'failed', error: message })
    }
  }

  for (const group of batched.values()) {
    const [primary, ...mates] = group
    const definition = STEP_DEFINITION_BY_KEY[primary.step.stepKey]
    if (!definition) continue

    try {
      const outcome = await dispatchStep({
        definition,
        context: primary.journey.context,
        step: primary.step,
        tasks: primary.journey.tasks,
        batchMates: mates.map((item) => item.journey.context),
      })

      // One invite covers the cohort, so every member's step resolves together.
      for (const item of group) {
        await applyOutcome(item, outcome)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      for (const item of group) {
        await applyOutcome(item, { status: 'failed', error: message })
      }
    }
  }

  logs.push({
    journeyId: null,
    employeeName: 'System',
    module: 'runner',
    action: `Run complete — ${summary.stepsSent} sent, ${summary.stepsFailed} failed`,
    status: summary.stepsFailed > 0 ? 'error' : 'success',
  })

  await writeLogs(supabase, logs)

  return summary
}
