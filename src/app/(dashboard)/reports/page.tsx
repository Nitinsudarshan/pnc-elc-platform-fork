import React, { Suspense } from 'react'
import { getUnifiedReportsData } from '@/lib/reports/getReportsData'
import { ReportsView } from './reports-view'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const data = await getUnifiedReportsData()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Main Tabbed View */}
      <Suspense fallback={<div className="text-xs text-muted-foreground py-10 text-center">Loading reports data...</div>}>
        <ReportsView data={data} />
      </Suspense>
    </div>
  )
}
