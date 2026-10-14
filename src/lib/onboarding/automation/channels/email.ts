import { sendEmail } from '@/lib/email/sendEmail'
import { EMAIL_TEMPLATES } from '@/lib/onboarding/templates/emailTemplates'

import type { DispatchInput, DispatchOutcome } from '@/lib/onboarding/channels/types'

/**
 * Email adapter. Renders the ported template and sends it through the existing
 * Gmail integration.
 */

const resolveRecipient = (
  input: DispatchInput
): { email: string | null; missing: string } => {
  const { definition, context } = input

  // Pre-joining mail goes to the personal address — the official mailbox may not
  // exist yet. Everything from day 0 onwards goes to the official address.
  const wantsPersonal = definition.requiresContact === 'personalEmail'
  const email = wantsPersonal
    ? context.personalEmail ?? context.officialEmail
    : context.officialEmail

  return {
    email,
    missing: wantsPersonal ? 'personal email' : 'official email',
  }
}

export const dispatchEmailStep = async (
  input: DispatchInput
): Promise<DispatchOutcome> => {
  const { definition, context } = input

  // Credential mail carries account access, so a human sends it. The legacy
  // script created a Gmail draft for the same reason; here the step is surfaced
  // on the dashboard instead, and no password is ever stored by this app.
  if (definition.requiresManualReview) {
    return {
      status: 'deferred',
      reason: 'Awaiting manual send by People & Culture',
    }
  }

  const template = EMAIL_TEMPLATES[definition.key]
  if (!template) {
    return { status: 'skipped', reason: 'No email template for this step' }
  }

  const { email, missing } = resolveRecipient(input)
  if (!email) {
    return { status: 'deferred', reason: `Missing ${missing}` }
  }

  const rendered = template({
    employeeName: context.employeeName,
    officialEmail: context.officialEmail,
    personalEmail: context.personalEmail,
    employeeType: context.employeeType,
  })

  const result = await sendEmail(
    definition.key,
    { subject: rendered.subject, body: rendered.html },
    email
  )

  if (!result.success) {
    return { status: 'failed', error: result.error ?? 'Unknown email error' }
  }

  return { status: 'sent', externalRef: result.messageId ?? null }
}
