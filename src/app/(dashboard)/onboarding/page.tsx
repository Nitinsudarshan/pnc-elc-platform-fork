import { Compass } from 'lucide-react'

import { OnboardingBoard } from '@/app/(dashboard)/onboarding/_components/OnboardingBoard'
import { OnboardingStats } from '@/app/(dashboard)/onboarding/_components/OnboardingStats'
import { PageBanner } from '@/components/shared/page-banner'
import { getOnboardingDashboard } from '@/lib/onboarding/getOnboardingDashboard'

export default async function OnboardingPage() {
  const { rows, totals } = await getOnboardingDashboard()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-20 md:p-6 lg:p-8">
      <PageBanner
        title="Onboarding"
        description="Every joiner's first three weeks — emails, calls, Slack and induction tasks, from two days before joining through to completion."
        icon={<Compass className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
      />

      <OnboardingStats totals={totals} />
      <OnboardingBoard rows={rows} />
    </div>
  )
}
