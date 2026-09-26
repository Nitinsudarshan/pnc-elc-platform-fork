'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/sendEmail'
import { getNotificationSettings } from '@/lib/settings/service'

export async function sendPeerReminders() {
  const notificationSettings = await getNotificationSettings().catch(() => null)
  if (notificationSettings && !notificationSettings.peer_reminder_enabled) {
    return { success: true, remindersSent: 0, message: 'Peer reminders are disabled in settings' }
  }

  const supabase = await createServerSupabaseClient()

  const { data: pendingFeedback, error } = await supabase
    .from('peer_feedback')
    .select('*')
    .eq('response_status', 'pending')

  if (error) {
    console.error('Error fetching pending feedback:', error.message)
    return { success: false, error: error.message }
  }

  if (!pendingFeedback || pendingFeedback.length === 0) {
    return { success: true, remindersSent: 0 }
  }

  let remindersSent = 0
  const subject = notificationSettings?.peer_reminder_subject || 'Reminder: Peer Feedback Requested'

  for (const feedback of pendingFeedback) {
    if (!feedback.peer_email) continue

    const feedbackLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feedback/${feedback.id}`

    const result = await sendEmail(
      'peer_feedback_reminder',
      {
        subject,
        body: `<p>Hi ${feedback.peer_name},</p><p>This is a friendly reminder to share your feedback:</p><p><a href="${feedbackLink}">${feedbackLink}</a></p><p>Thank you!</p>`,
      },
      feedback.peer_email
    )

    if (result.success) {
      remindersSent++
      await supabase
        .from('peer_feedback')
        .update({ response_status: 'reminded' })
        .eq('id', feedback.id)
    }
  }

  return { success: true, remindersSent }
}