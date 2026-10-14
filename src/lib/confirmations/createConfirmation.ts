'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { auditConfirmation } from '@/lib/audit/events'
import { resolveEmployeeSubject } from '@/lib/audit/subject'

export async function createConfirmation(employeeId: string, timelineType: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('confirmations')
    .insert({
      employee_id: employeeId,
      timeline_type: timelineType,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating confirmation:', error.message, error.details, error.hint)
    return null
  }

  await auditConfirmation.initiated({
    subject: await resolveEmployeeSubject(employeeId),
    entityId: data.id,
    entityType: 'confirmation',
    metadata: { timeline_type: timelineType },
  })

  return data
}