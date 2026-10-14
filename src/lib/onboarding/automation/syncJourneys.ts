import { getOrgToday, parseDateOnly, diffInDays, toDateKey } from '@/lib/onboarding/automation/dates'
import { planSteps, planTasks } from '@/lib/onboarding/automation/schedule'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { EmployeeType, JourneyContext } from '@/types/onboarding'

/**
 * Keeps `onboarding_journeys` in step with the `employees` table.
 *
 * Replaces the Apps Script's Notion-to-spreadsheet sync: employees are the
 * source of truth here, so a journey (plus its dated steps and induction tasks)
 * is created for every recent or upcoming joiner, and re-planned if their
 * joining date moves.
 */

/**
 * How far back to pick up joiners that have no journey yet. Without this, first
 * run would backfill a journey for every employee the org has ever had.
 */
const BACKFILL_WINDOW_DAYS = 45

type EmployeeRow = {
  id: string
  name: string
  employee_type: EmployeeType
  joining_date: string
  status: string
  team: string | null
  manager_id: string | null
  employee_profiles:
    | { official_email: string | null; personal_email: string | null }
    | { official_email: string | null; personal_email: string | null }[]
    | null
}

export type SyncSummary = {
  journeysCreated: number
  journeysRescheduled: number
  stepsCreated: number
}

const firstProfile = (row: EmployeeRow) =>
  Array.isArray(row.employee_profiles)
    ? row.employee_profiles[0]
    : row.employee_profiles

export const syncJourneys = async (
  supabase: SupabaseClient
): Promise<SyncSummary> => {
  const today = getOrgToday()
  const earliest = toDateKey(
    new Date(today.getTime() - BACKFILL_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  )

  const summary: SyncSummary = {
    journeysCreated: 0,
    journeysRescheduled: 0,
    stepsCreated: 0,
  }

  const { data: employeeRows, error: employeesError } = await supabase
    .from('employees')
    .select(
      'id, name, employee_type, joining_date, status, team, manager_id, employee_profiles ( official_email, personal_email )'
    )
    .gte('joining_date', earliest)

  if (employeesError) {
    console.error('Onboarding sync: failed to load employees', employeesError.message)
    return summary
  }

  const employees = (employeeRows ?? []) as unknown as EmployeeRow[]
  if (employees.length === 0) return summary

  const { data: journeyRows, error: journeysError } = await supabase
    .from('onboarding_journeys')
    .select('id, employee_id, joining_date, last_completed_step, is_completed')

  if (journeysError) {
    console.error('Onboarding sync: failed to load journeys', journeysError.message)
    return summary
  }

  const existingByEmployee = new Map(
    (journeyRows ?? []).map((row) => [row.employee_id as string, row])
  )

  // Manager addresses are denormalised onto the journey so the dispatcher never
  // has to walk the employee graph mid-send.
  const managerEmailById = new Map<string, string | null>(
    employees.map((row) => [row.id, firstProfile(row)?.official_email ?? null])
  )

  for (const employee of employees) {
    if (employee.status === 'exited') continue

    const profile = firstProfile(employee)
    const existing = existingByEmployee.get(employee.id)

    const managerEmail = employee.manager_id
      ? managerEmailById.get(employee.manager_id) ?? null
      : null

    if (existing) {
      // Re-plan only when the joining date actually moved.
      if (existing.joining_date === employee.joining_date) continue

      const { error } = await supabase
        .from('onboarding_journeys')
        .update({
          joining_date: employee.joining_date,
          manager_email: managerEmail,
          department: employee.team,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        console.error('Onboarding sync: failed to update journey', error.message)
        continue
      }

      await rescheduleSteps(supabase, {
        journeyId: existing.id as string,
        employee,
        profile,
        managerEmail,
        lastCompletedStep: existing.last_completed_step as string | null,
        isCompleted: existing.is_completed as boolean,
      })

      summary.journeysRescheduled += 1
      continue
    }

    const { data: inserted, error: insertError } = await supabase
      .from('onboarding_journeys')
      .insert({
        employee_id: employee.id,
        joining_date: employee.joining_date,
        department: employee.team,
        manager_email: managerEmail,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error(
        'Onboarding sync: failed to create journey',
        insertError?.message
      )
      continue
    }

    const created = await rescheduleSteps(supabase, {
      journeyId: inserted.id as string,
      employee,
      profile,
      managerEmail,
      lastCompletedStep: null,
      isCompleted: false,
    })

    summary.journeysCreated += 1
    summary.stepsCreated += created
  }

  return summary
}

type RescheduleArgs = {
  journeyId: string
  employee: EmployeeRow
  profile: { official_email: string | null; personal_email: string | null } | null | undefined
  managerEmail: string | null
  lastCompletedStep: string | null
  isCompleted: boolean
}

/**
 * Writes the planned steps and tasks for a journey.
 *
 * Only `pending` steps are re-dated: once something has been sent or skipped,
 * moving the joining date must not resurrect it.
 */
const rescheduleSteps = async (
  supabase: SupabaseClient,
  args: RescheduleArgs
): Promise<number> => {
  const context: JourneyContext = {
    journeyId: args.journeyId,
    employeeId: args.employee.id,
    employeeName: args.employee.name,
    employeeType: args.employee.employee_type,
    department: args.employee.team,
    joiningDate: args.employee.joining_date,
    stage: 'pre_boarding',
    officialEmail: args.profile?.official_email ?? null,
    personalEmail: args.profile?.personal_email ?? null,
    managerEmail: args.managerEmail,
    buddyEmail: null,
    slackChannelId: null,
    lastCompletedStep: args.lastCompletedStep,
    isCompleted: args.isCompleted,
    employeeStatus: args.employee.status,
  }

  const planned = planSteps(context)
  if (planned.length === 0) return 0

  const { data: existingSteps } = await supabase
    .from('onboarding_steps')
    .select('step_key, status')
    .eq('journey_id', args.journeyId)

  const lockedKeys = new Set(
    (existingSteps ?? [])
      .filter((row) => row.status !== 'pending')
      .map((row) => row.step_key as string)
  )

  const rows = planned
    .filter((step) => !lockedKeys.has(step.stepKey))
    .map((step) => ({
      journey_id: args.journeyId,
      step_key: step.stepKey,
      channel: step.channel,
      scheduled_for: step.scheduledFor,
      status: step.status,
      skip_reason: step.skipReason ?? null,
      updated_at: new Date().toISOString(),
    }))

  if (rows.length > 0) {
    const { error } = await supabase
      .from('onboarding_steps')
      .upsert(rows, { onConflict: 'journey_id,step_key' })

    if (error) {
      console.error('Onboarding sync: failed to upsert steps', error.message)
      return 0
    }
  }

  const taskRows = planTasks(context).map((task) => ({
    journey_id: args.journeyId,
    task_key: task.taskKey,
    due_date: task.dueDate,
  }))

  if (taskRows.length > 0) {
    const { error } = await supabase
      .from('onboarding_tasks')
      .upsert(taskRows, { onConflict: 'journey_id,task_key', ignoreDuplicates: true })

    if (error) {
      console.error('Onboarding sync: failed to upsert tasks', error.message)
    }
  }

  return rows.length
}

/** Days since joining, used by the stage refresh. */
export const daysSinceJoining = (joiningDate: string, today = getOrgToday()) => {
  const parsed = parseDateOnly(joiningDate)
  return parsed ? diffInDays(parsed, today) : 0
}
