import { dispatchCalendarStep } from '@/lib/onboarding/channels/calendar'
import { dispatchEmailStep } from '@/lib/onboarding/channels/email'
import { dispatchSlackStep } from '@/lib/onboarding/channels/slack'

import type { DispatchInput, DispatchOutcome } from '@/lib/onboarding/channels/types'

export type { DispatchInput, DispatchOutcome } from '@/lib/onboarding/channels/types'

/** Routes a due step to the adapter that owns its channel. */
export const dispatchStep = async (
  input: DispatchInput
): Promise<DispatchOutcome> => {
  switch (input.definition.channel) {
    case 'email':
      return dispatchEmailStep(input)
    case 'slack':
      return dispatchSlackStep(input)
    case 'calendar':
      return dispatchCalendarStep(input)
    case 'task':
      // Induction tasks are completed by the employee through the induction
      // form, never dispatched by the automation.
      return { status: 'deferred', reason: 'Completed by the employee' }
  }
}
