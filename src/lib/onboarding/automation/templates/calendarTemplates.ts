/**
 * Calendar invite copy, ported from the Apps Script `calender_handling.gs`.
 *
 * Batched sessions (technical, warm, P&C check-in) title themselves with the
 * cohort date so a day's joiners share one invite, matching the original.
 */

import { formatDisplayDate } from '@/lib/onboarding/automation/dates'

export type CalendarTemplateContext = {
  /** For an individual call, the joiner's name; for a batch, "A & B". */
  attendeeNames: string
  scheduledFor: string
}

export type RenderedCalendarEvent = {
  title: string
  description: string
}

const managerConnect = (
  context: CalendarTemplateContext
): RenderedCalendarEvent => ({
  title: `Meet Your Manager | ${context.attendeeNames}`,
  description: `Hey ${context.attendeeNames},

Welcome to NavGurukul! 🌟

Your day-one check-in with your manager is a dedicated space to connect, discuss your role and team expectations, and address any questions as you settle in.

We are thrilled to have you join us and look forward to supporting your journey. Wishing you a wonderful start!

Warm regards,
People & Culture Team`,
})

const buddyConnect = (
  context: CalendarTemplateContext
): RenderedCalendarEvent => ({
  title: `Buddy Onboarding Call - ${context.attendeeNames}`,
  description: `Hello ${context.attendeeNames}

This is your first buddy connect at NavGurukul.
Your buddy will be your go-to person during the initial days as you settle in. This is an informal space where you can ask any questions you might have — about day-to-day work, communication channels, team practices, or anything else that might help you get comfortable in your team/organization.
The idea of this call is simply to help you navigate things more easily and feel supported as you begin your journey at NavGurukul.
Looking forward to this conversation and wishing you a smooth start ahead!`,
})

const technicalOnboarding = (
  context: CalendarTemplateContext
): RenderedCalendarEvent => ({
  title: `Getting Started at NavGurukul | Technical Onboarding call (${formatDisplayDate(
    context.scheduledFor
  )})`,
  description: `Hello ${context.attendeeNames},

Welcome to NavGurukul! 🎉

This session will introduce you to the key tools and processes you'll need—from trackers, attendance, leave and reimbursements to communication and day-to-day tools.

We'll also have time for a Q&A.

Looking forward to connecting! 😊

Warm regards,
People & Culture Team`,
})

const warmOnboarding = (
  context: CalendarTemplateContext
): RenderedCalendarEvent => ({
  title: `Welcome Aboard! 🎉 | Warm Onboarding Session (${formatDisplayDate(
    context.scheduledFor
  )})`,
  description: `Hello ${context.attendeeNames},

Congratulations on joining NavGurukul! We're excited to have you with us. 🌟

In this Warm Onboarding session, we'll cover:
• NavGurukul's culture and key principles
• Your onboarding journey
• Organisational structure

Warm regards,
People & Culture Team`,
})

const pncCheckin = (
  context: CalendarTemplateContext
): RenderedCalendarEvent => ({
  title: `{Optional} PnC Onboarding Reflection (${formatDisplayDate(
    context.scheduledFor
  )})`,
  description: `The PnC team is hosting an optional check-in call for our new joiners.

This would be a space to share how your onboarding experience has been so far, talk through any challenges you're facing, reflect on the tasks you've worked on, and let us know if there's any support you need as you settle into your role.

We'd love to have you join if you're available. Thank you! 😊`,
})

/** Calendar invite renderers, keyed by onboarding step. */
export const CALENDAR_TEMPLATES: Record<
  string,
  (context: CalendarTemplateContext) => RenderedCalendarEvent
> = {
  manager_connect: managerConnect,
  buddy_connect: buddyConnect,
  technical_onboarding: technicalOnboarding,
  warm_onboarding: warmOnboarding,
  pnc_checkin: pncCheckin,
}

/**
 * Internal attendees added to each batched session, configured per environment
 * so facilitator changes don't need a code change.
 */
export const getBatchAttendees = (stepKey: string): string[] => {
  const raw =
    {
      technical_onboarding: process.env.ONBOARDING_TECH_ATTENDEES,
      warm_onboarding: process.env.ONBOARDING_WARM_ATTENDEES,
      pnc_checkin: process.env.ONBOARDING_PNC_ATTENDEES,
    }[stepKey] ?? ''

  return raw
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}
