import { NextResponse } from 'next/server'

import { runOnboardingAutomation } from '@/lib/onboarding/runOnboardingAutomation'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

/**
 * Daily onboarding run.
 *
 * Uses the service-role client because a cron request carries no user session,
 * and the onboarding tables are restricted to authenticated roles.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const summary = await runOnboardingAutomation(supabase)

    return NextResponse.json({ success: true, data: summary })
  } catch (error) {
    console.error('Onboarding cron failed:', error)
    return NextResponse.json(
      { success: false, error: 'Onboarding run failed' },
      { status: 500 }
    )
  }
}
