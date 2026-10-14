'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Server actions backing the onboarding dashboard drawer.
 *
 * These are the manual escape hatches the automation deliberately leaves open:
 * recording a credential mail that a human sent, filling in a buddy the HR
 * record doesn't carry, and ticking off an induction task.
 */

export type ActionResult = { success: boolean; error?: string }

/**
 * Records a step as done by hand. Used for the credential email, which carries
 * account access and is therefore never auto-sent.
 */
export async function markStepSent(stepId: string): Promise<ActionResult> {
  if (!stepId) return { success: false, error: 'Missing step' }

  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('onboarding_steps')
    .update({
      status: 'sent',
      completed_at: now,
      skip_reason: 'Sent manually',
      updated_at: now,
    })
    .eq('id', stepId)

  if (error) {
    console.error('Failed to mark onboarding step sent:', error.message)
    return { success: false, error: 'Could not update this step' }
  }

  revalidatePath('/onboarding')
  return { success: true }
}

/** Fills in the contacts the automation needs but the HR record may not hold. */
export async function updateJourneyContacts(
  journeyId: string,
  contacts: { managerEmail?: string | null; buddyEmail?: string | null }
): Promise<ActionResult> {
  if (!journeyId) return { success: false, error: 'Missing journey' }

  const supabase = await createServerSupabaseClient()

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (contacts.managerEmail !== undefined) {
    patch.manager_email = contacts.managerEmail || null
  }
  if (contacts.buddyEmail !== undefined) {
    patch.buddy_email = contacts.buddyEmail || null
  }

  const { error } = await supabase
    .from('onboarding_journeys')
    .update(patch)
    .eq('id', journeyId)

  if (error) {
    console.error('Failed to update onboarding contacts:', error.message)
    return { success: false, error: 'Could not save these contacts' }
  }

  revalidatePath('/onboarding')
  return { success: true }
}

/** Marks an induction task complete or incomplete. */
export async function setTaskCompletion(
  taskId: string,
  isCompleted: boolean
): Promise<ActionResult> {
  if (!taskId) return { success: false, error: 'Missing task' }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('onboarding_tasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (error) {
    console.error('Failed to update induction task:', error.message)
    return { success: false, error: 'Could not update this task' }
  }

  revalidatePath('/onboarding')
  return { success: true }
}
