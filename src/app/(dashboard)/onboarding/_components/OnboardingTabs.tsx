'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { ReactNode } from 'react'

type OnboardingTabsProps = {
  /** Candidate-to-employee hub: pipeline, offers, document review. */
  hub: ReactNode
  /** Post-joining automation: emails, calls, Slack and induction tasks. */
  pipeline: ReactNode
}

/**
 * Shell that puts the two halves of onboarding on one page.
 *
 * Both halves are rendered on the server and handed in as nodes, so this stays
 * a thin client boundary that owns nothing but the selected tab.
 */
export const OnboardingTabs = ({ hub, pipeline }: OnboardingTabsProps) => (
  <Tabs defaultValue="hub" className="w-full">
    <TabsList>
      <TabsTrigger value="hub">Hub</TabsTrigger>
      <TabsTrigger value="pipeline">Automation Pipeline</TabsTrigger>
    </TabsList>

    <TabsContent value="hub" className="mt-6">
      {hub}
    </TabsContent>

    <TabsContent value="pipeline" className="mt-6">
      {pipeline}
    </TabsContent>
  </Tabs>
)
