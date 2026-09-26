import React, { Suspense } from 'react'
import { PageBanner } from '@/components/shared/page_banner'
import { BarChart3, TrendingUp, Download, RefreshCw } from 'lucide-react'
import { getUnifiedReportsData } from '@/lib/reports/getReportsData'
import { ReportsView } from './reports-view'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const data = await getUnifiedReportsData()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Page Banner - Strictly Single Line Title & Description */}
      <PageBanner
        title="Reports & Analytics"
        description="Centralized reporting hub for appraisals, probation confirmations, onboarding, and headcount."
        icon={<BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-medium rounded-lg text-xs">
              <Link href="/appraisals">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Appraisal Cohorts</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main Tabbed View */}
      <Suspense fallback={<div className="text-xs text-muted-foreground py-10 text-center">Loading reports data...</div>}>
        <ReportsView data={data} />
      </Suspense>
    </div>
  )
}
