'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { auditPeerFeedback } from '@/lib/audit/events'
import { resolveSubjectFromConfirmation } from '@/lib/audit/subject'

export async function submitPeerFeedback(peerFeedbackId: string, feedbackText: string) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('peer_feedback')
    .update({
      feedback_text: feedbackText,
      response_status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', peerFeedbackId)
    .select()
    .single()

  if (error) {
    console.error('Error submitting peer feedback:', error.message, error.details, error.hint)
    return null
  }

  // The subject is the employee under review, not the peer writing.
  await auditPeerFeedback.submitted({
    subject: await resolveSubjectFromConfirmation(data.confirmation_id),
    actorName: data.peer_name,
    actorEmail: data.peer_email,
    actorType: 'employee',
    entityId: peerFeedbackId,
    entityType: 'peer_feedback',
    reviewer: data.peer_name,
  })

  return data
}