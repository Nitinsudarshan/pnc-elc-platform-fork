import { AlertTriangle, CheckCircle2, Hourglass, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import type { OnboardingDashboardData } from '@/lib/onboarding/automation/getOnboardingDashboard'

type OnboardingStatsProps = {
  totals: OnboardingDashboardData['totals']
}

/** Headline counters for the onboarding pipeline. */
export const OnboardingStats = ({ totals }: OnboardingStatsProps) => {
  const cards = [
    {
      label: 'Total Employees',
      value: totals.total,
      icon: Users,
      accent: 'text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Onboarding In Progress',
      value: totals.inProgress,
      icon: Hourglass,
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Onboarded',
      value: totals.onboarded,
      icon: CheckCircle2,
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Needs Attention',
      value: totals.needsAttention,
      icon: AlertTriangle,
      accent: 'text-destructive',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-6">
            <card.icon className={`h-8 w-8 shrink-0 ${card.accent}`} />
            <div className="min-w-0">
              <div className="text-2xl font-semibold tabular-nums">
                {card.value}
              </div>
              <p className="text-muted-foreground truncate text-sm">
                {card.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
