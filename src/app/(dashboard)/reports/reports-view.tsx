'use client'

import React, { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp,
  UserCheck,
  Compass,
  Users,
  Mail,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Calendar,
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
} from 'lucide-react'
import { UnifiedReportsData } from '@/lib/reports/getReportsData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

interface ReportsViewProps {
  data: UnifiedReportsData
}

export function ReportsView({ data }: ReportsViewProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') || 'appraisals'
  const [activeTab, setActiveTab] = useState<string>(initialTab)

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', val)
    router.replace(`/reports?${params.toString()}`, { scroll: false })
  }

  // Search & pagination states
  const [appraisalQuery, setAppraisalQuery] = useState('')
  const [appraisalPage, setAppraisalPage] = useState(1)

  const [confQuery, setConfQuery] = useState('')
  const [confPage, setConfPage] = useState(1)

  const [onbQuery, setOnbQuery] = useState('')
  const [onbPage, setOnbPage] = useState(1)

  const [headcountQuery, setHeadcountQuery] = useState('')
  const [headcountPage, setHeadcountPage] = useState(1)

  const [emailQuery, setEmailQuery] = useState('')
  const [emailPage, setEmailPage] = useState(1)

  // 1. Appraisals calculations
  const totalEligible = data.appraisals.totalEligible
  const julyCycle = data.appraisals.cycleSplit.july
  const decemberCycle = data.appraisals.cycleSplit.december
  const julyPct = totalEligible > 0 ? Math.round((julyCycle / totalEligible) * 100) : 0
  const decPct = totalEligible > 0 ? Math.round((decemberCycle / totalEligible) * 100) : 0

  const filteredAppraisalTeams = useMemo(() => {
    return data.appraisals.teamBreakdown.filter((t) =>
      t.team.toLowerCase().includes(appraisalQuery.toLowerCase())
    )
  }, [data.appraisals.teamBreakdown, appraisalQuery])

  const paginatedAppraisalTeams = useMemo(() => {
    const start = (appraisalPage - 1) * PAGE_SIZE
    return filteredAppraisalTeams.slice(start, start + PAGE_SIZE)
  }, [filteredAppraisalTeams, appraisalPage])

  const totalAppraisalPages = Math.ceil(filteredAppraisalTeams.length / PAGE_SIZE) || 1

  // 2. Confirmations calculations
  const filteredConfirmations = useMemo(() => {
    return data.confirmations.items.filter(
      (c) =>
        c.employee_name.toLowerCase().includes(confQuery.toLowerCase()) ||
        (c.team_name && c.team_name.toLowerCase().includes(confQuery.toLowerCase())) ||
        c.status.toLowerCase().includes(confQuery.toLowerCase())
    )
  }, [data.confirmations.items, confQuery])

  const paginatedConfirmations = useMemo(() => {
    const start = (confPage - 1) * PAGE_SIZE
    return filteredConfirmations.slice(start, start + PAGE_SIZE)
  }, [filteredConfirmations, confPage])

  const totalConfPages = Math.ceil(filteredConfirmations.length / PAGE_SIZE) || 1

  // 3. Onboarding calculations
  const filteredOnboarding = useMemo(() => {
    return data.onboarding.items.filter(
      (o) =>
        o.candidate_name.toLowerCase().includes(onbQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(onbQuery.toLowerCase()) ||
        (o.department && o.department.toLowerCase().includes(onbQuery.toLowerCase())) ||
        o.status.toLowerCase().includes(onbQuery.toLowerCase())
    )
  }, [data.onboarding.items, onbQuery])

  const paginatedOnboarding = useMemo(() => {
    const start = (onbPage - 1) * PAGE_SIZE
    return filteredOnboarding.slice(start, start + PAGE_SIZE)
  }, [filteredOnboarding, onbPage])

  const totalOnbPages = Math.ceil(filteredOnboarding.length / PAGE_SIZE) || 1

  // 4. Headcount calculations
  const filteredHeadcount = useMemo(() => {
    return data.headcount.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(headcountQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(headcountQuery.toLowerCase()) ||
        e.team_name.toLowerCase().includes(headcountQuery.toLowerCase()) ||
        e.employee_type.toLowerCase().includes(headcountQuery.toLowerCase()) ||
        e.location_name.toLowerCase().includes(headcountQuery.toLowerCase())
    )
  }, [data.headcount.employees, headcountQuery])

  const paginatedHeadcount = useMemo(() => {
    const start = (headcountPage - 1) * PAGE_SIZE
    return filteredHeadcount.slice(start, start + PAGE_SIZE)
  }, [filteredHeadcount, headcountPage])

  const totalHeadcountPages = Math.ceil(filteredHeadcount.length / PAGE_SIZE) || 1

  // 5. Email calculations
  const filteredEmails = useMemo(() => {
    return data.emails.items.filter(
      (m) =>
        m.recipient_email.toLowerCase().includes(emailQuery.toLowerCase()) ||
        (m.recipient_name && m.recipient_name.toLowerCase().includes(emailQuery.toLowerCase())) ||
        m.template_key.toLowerCase().includes(emailQuery.toLowerCase()) ||
        m.status.toLowerCase().includes(emailQuery.toLowerCase())
    )
  }, [data.emails.items, emailQuery])

  const paginatedEmails = useMemo(() => {
    const start = (emailPage - 1) * PAGE_SIZE
    return filteredEmails.slice(start, start + PAGE_SIZE)
  }, [filteredEmails, emailPage])

  const totalEmailPages = Math.ceil(filteredEmails.length / PAGE_SIZE) || 1

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Navigation Tabs */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 p-1 rounded-lg border border-border h-10 w-fit inline-flex">
            <TabsTrigger value="appraisals" className="rounded-lg text-xs font-semibold px-3 py-1.5 gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Appraisals</span>
              <Badge variant="secondary" className="rounded-lg text-[10px] py-0 px-1 font-mono">
                {totalEligible}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmations" className="rounded-lg text-xs font-semibold px-3 py-1.5 gap-2">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Confirmations</span>
              <Badge variant="secondary" className="rounded-lg text-[10px] py-0 px-1 font-mono">
                {data.confirmations.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="rounded-lg text-xs font-semibold px-3 py-1.5 gap-2">
              <Compass className="h-3.5 w-3.5" />
              <span>Onboarding</span>
              <Badge variant="secondary" className="rounded-lg text-[10px] py-0 px-1 font-mono">
                {data.onboarding.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="headcount" className="rounded-lg text-xs font-semibold px-3 py-1.5 gap-2">
              <Users className="h-3.5 w-3.5" />
              <span>Headcount</span>
              <Badge variant="secondary" className="rounded-lg text-[10px] py-0 px-1 font-mono">
                {data.headcount.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="emails" className="rounded-lg text-xs font-semibold px-3 py-1.5 gap-2">
              <Mail className="h-3.5 w-3.5" />
              <span>Email Delivery</span>
              <Badge variant="secondary" className="rounded-lg text-[10px] py-0 px-1 font-mono">
                {data.emails.total}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* -------------------- 1. APPRAISALS TAB -------------------- */}
        <TabsContent value="appraisals" className="space-y-4 mt-2">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Eligible</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{totalEligible}</div>
                <p className="text-xs text-muted-foreground">Across all functional teams</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">July Mid-Year Cycle</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {julyCycle} <span className="text-muted-foreground text-sm font-normal">/ {totalEligible}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold py-0 px-1.5">
                    {julyPct}%
                  </Badge>
                  <span>mid-year appraisal cohort</span>
                </div>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">December Year-End Cycle</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {decemberCycle} <span className="text-muted-foreground text-sm font-normal">/ {totalEligible}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold py-0 px-1.5">
                    {decPct}%
                  </Badge>
                  <span>year-end appraisal cohort</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="rounded-lg border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Team-wise Breakdown</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Distribution of eligible employees across review cycles by functional team
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by team..."
                  value={appraisalQuery}
                  onChange={(e) => {
                    setAppraisalQuery(e.target.value)
                    setAppraisalPage(1)
                  }}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">July Cycle</th>
                    <th className="px-4 py-3">December Cycle</th>
                    <th className="px-4 py-3">Total Eligible</th>
                    <th className="px-4 py-3 text-right">Share of Cohort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedAppraisalTeams.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No teams match your search query.
                      </td>
                    </tr>
                  ) : (
                    paginatedAppraisalTeams.map((t) => {
                      const sharePct = totalEligible > 0 ? Math.round((t.total / totalEligible) * 100) : 0
                      return (
                        <tr key={t.team} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">{t.team}</td>
                          <td className="px-4 py-3 text-muted-foreground">{t.july}</td>
                          <td className="px-4 py-3 text-muted-foreground">{t.december}</td>
                          <td className="px-4 py-3 font-bold text-foreground">{t.total}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant="outline" className="rounded-lg text-[10px] font-mono">
                              {sharePct}%
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination at 10 */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredAppraisalTeams.length > 0 ? (appraisalPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
                {Math.min(appraisalPage * PAGE_SIZE, filteredAppraisalTeams.length)} of {filteredAppraisalTeams.length} teams
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={appraisalPage <= 1}
                  onClick={() => setAppraisalPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] px-2 font-mono">
                  {appraisalPage} / {totalAppraisalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={appraisalPage >= totalAppraisalPages}
                  onClick={() => setAppraisalPage((p) => Math.min(totalAppraisalPages, p + 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* -------------------- 2. CONFIRMATIONS TAB -------------------- */}
        <TabsContent value="confirmations" className="space-y-4 mt-2">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Confirmation Cycles</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.confirmations.total}</div>
                <p className="text-xs text-muted-foreground">Probation assessments initiated</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Confirmed & Approved</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.confirmations.completed}</div>
                <p className="text-xs text-muted-foreground">Successfully confirmed post-probation</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">In Review & Pending</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.confirmations.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting manager decision or peer feedback</p>
              </div>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="rounded-lg border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Confirmation Reviews Log</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  All probation milestones and decision records
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by employee or team..."
                  value={confQuery}
                  onChange={(e) => {
                    setConfQuery(e.target.value)
                    setConfPage(1)
                  }}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Team & Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Manager Decision</th>
                    <th className="px-4 py-3">Date Initiated</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedConfirmations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No confirmation records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedConfirmations.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{c.employee_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {c.team_name} {c.designation ? `• ${c.designation}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={c.status === 'confirmed' ? 'default' : 'secondary'}
                            className="rounded-lg text-[10px] capitalize"
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {c.manager_decision || c.recommendation || 'Pending'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 text-[10px] rounded-lg px-2">
                            <Link href={`/confirmations/${c.id}/report`}>View Details</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination at 10 */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredConfirmations.length > 0 ? (confPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
                {Math.min(confPage * PAGE_SIZE, filteredConfirmations.length)} of {filteredConfirmations.length} records
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={confPage <= 1}
                  onClick={() => setConfPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] px-2 font-mono">
                  {confPage} / {totalConfPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={confPage >= totalConfPages}
                  onClick={() => setConfPage((p) => Math.min(totalConfPages, p + 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* -------------------- 3. ONBOARDING TAB -------------------- */}
        <TabsContent value="onboarding" className="space-y-4 mt-2">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total In Onboarding</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Compass className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.onboarding.total}</div>
                <p className="text-xs text-muted-foreground">Across Pre-joining and Post-joining</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Pre-Joining Candidates</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.onboarding.preJoining}</div>
                <p className="text-xs text-muted-foreground">Draft offers, invited, doc reviews</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Post-Joining Employees</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.onboarding.postJoining}</div>
                <p className="text-xs text-muted-foreground">Account setup, orientation, active</p>
              </div>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="rounded-lg border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Onboarding Roster Report</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Candidate pipeline status and departmental assignments
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by candidate or role..."
                  value={onbQuery}
                  onChange={(e) => {
                    setOnbQuery(e.target.value)
                    setOnbPage(1)
                  }}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Designation & Department</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedOnboarding.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No onboarding candidates found.
                      </td>
                    </tr>
                  ) : (
                    paginatedOnboarding.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{o.candidate_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.designation} {o.department ? `• ${o.department}` : ''}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">{o.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="rounded-lg text-[10px] capitalize">
                            {o.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 text-[10px] rounded-lg px-2">
                            <Link href={`/onboarding/review/${o.invitation_token || o.id}`}>Review</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination at 10 */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredOnboarding.length > 0 ? (onbPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
                {Math.min(onbPage * PAGE_SIZE, filteredOnboarding.length)} of {filteredOnboarding.length} candidates
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={onbPage <= 1}
                  onClick={() => setOnbPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] px-2 font-mono">
                  {onbPage} / {totalOnbPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={onbPage >= totalOnbPages}
                  onClick={() => setOnbPage((p) => Math.min(totalOnbPages, p + 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* -------------------- 4. HEADCOUNT TAB -------------------- */}
        <TabsContent value="headcount" className="space-y-4 mt-2">
          {/* KPI Demographics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Headcount & Type Breakdown */}
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Active Headcount</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{data.headcount.total}</div>
              <div className="space-y-1.5 pt-1 border-t border-border">
                {Object.entries(data.headcount.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{type}</span>
                    <Badge variant="secondary" className="rounded-lg text-[10px] font-mono py-0 px-1.5">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Department Breakdown */}
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Functional Teams</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Building className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {Object.keys(data.headcount.byTeam).length}{' '}
                <span className="text-muted-foreground text-sm font-normal">teams</span>
              </div>
              <div className="space-y-1.5 pt-1 border-t border-border max-h-40 overflow-y-auto pr-1">
                {Object.entries(data.headcount.byTeam).map(([team, count]) => (
                  <div key={team} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{team}</span>
                    <Badge variant="outline" className="rounded-lg text-[10px] font-mono py-0 px-1.5">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Campus & Location Breakdown */}
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Locations & Campuses</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {Object.keys(data.headcount.byLocation).length}{' '}
                <span className="text-muted-foreground text-sm font-normal">locations</span>
              </div>
              <div className="space-y-1.5 pt-1 border-t border-border max-h-40 overflow-y-auto pr-1">
                {Object.entries(data.headcount.byLocation).map(([loc, count]) => (
                  <div key={loc} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{loc}</span>
                    <Badge variant="outline" className="rounded-lg text-[10px] font-mono py-0 px-1.5">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="rounded-lg border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Staff Directory & Roster</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Full organizational headcount registry
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by name, team, location..."
                  value={headcountQuery}
                  onChange={(e) => {
                    setHeadcountQuery(e.target.value)
                    setHeadcountPage(1)
                  }}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Team & Role</th>
                    <th className="px-4 py-3">Engagement Type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Joining Date</th>
                    <th className="px-4 py-3 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedHeadcount.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No employees found matching query.
                      </td>
                    </tr>
                  ) : (
                    paginatedHeadcount.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{emp.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{emp.email}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {emp.team_name} {emp.designation ? `• ${emp.designation}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="rounded-lg text-[10px]">
                            {emp.employee_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{emp.location_name}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 text-[10px] rounded-lg px-2">
                            <Link href={`/employees/${emp.id}/profile`}>View Profile</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination at 10 */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredHeadcount.length > 0 ? (headcountPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
                {Math.min(headcountPage * PAGE_SIZE, filteredHeadcount.length)} of {filteredHeadcount.length} employees
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={headcountPage <= 1}
                  onClick={() => setHeadcountPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] px-2 font-mono">
                  {headcountPage} / {totalHeadcountPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={headcountPage >= totalHeadcountPages}
                  onClick={() => setHeadcountPage((p) => Math.min(totalHeadcountPages, p + 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* -------------------- 5. EMAIL DELIVERY TAB -------------------- */}
        <TabsContent value="emails" className="space-y-4 mt-2">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Total Dispatches</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.emails.total}</div>
                <p className="text-xs text-muted-foreground">Recorded delivery logs</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Delivered Successfully</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.emails.delivered}</div>
                <p className="text-xs text-muted-foreground">Delivered to recipient mailbox</p>
              </div>
            </Card>

            <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Failed / Attention Needed</span>
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.emails.failed}</div>
                <p className="text-xs text-muted-foreground">
                  {data.emails.pending} queued / pending delivery
                </p>
              </div>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="rounded-lg border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Delivery Audit Log</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Outbound email dispatch status and delivery provider tracking
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by recipient or template..."
                  value={emailQuery}
                  onChange={(e) => {
                    setEmailQuery(e.target.value)
                    setEmailPage(1)
                  }}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Recipient</th>
                    <th className="px-4 py-3">Template / Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-right">Quota Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedEmails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No delivery logs found.
                      </td>
                    </tr>
                  ) : (
                    paginatedEmails.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{log.recipient_name || 'Recipient'}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{log.recipient_email}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="font-mono text-[11px]">{log.template_key}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={log.status === 'delivered' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}
                            className="rounded-lg text-[10px] capitalize"
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground uppercase text-[10px] font-mono">
                          {log.delivery_vendor || 'SMTP'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm" className="h-7 text-[10px] rounded-lg px-2">
                            <Link href="/manage/emails?tab=quota">Inspect</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination at 10 */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredEmails.length > 0 ? (emailPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
                {Math.min(emailPage * PAGE_SIZE, filteredEmails.length)} of {filteredEmails.length} logs
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={emailPage <= 1}
                  onClick={() => setEmailPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-[11px] px-2 font-mono">
                  {emailPage} / {totalEmailPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={emailPage >= totalEmailPages}
                  onClick={() => setEmailPage((p) => Math.min(totalEmailPages, p + 1))}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
