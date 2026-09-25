'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  UserPlus,
  Users,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Laptop,
  HeartHandshake,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
  History,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FullOnboardingData, OnboardingRecord } from '@/lib/onboarding/types';
import { toast } from 'sonner';

export default function OnboardingHubPage() {
  const [dataList, setDataList] = useState<FullOnboardingData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFullData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/onboarding?details=full');
      const json = await res.json();
      if (json.success && json.data) {
        setDataList(json.data);
      } else {
        toast.error('Failed to load onboarding hub statistics');
      }
    } catch (err) {
      toast.error('Network error loading onboarding data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullData();
  }, []);

  const records = dataList.map((d) => d.record);

  // Candidate Metrics (Pre-joining)
  const candidateDraft = records.filter((r) => r.status === 'draft').length;
  const candidateInvited = records.filter((r) => r.status === 'invited').length;
  const candidateInProgress = records.filter((r) => r.status === 'in_progress').length;
  const candidateSubmitted = records.filter((r) => ['submitted', 'under_review'].includes(r.status)).length;
  const candidatePreJoiningTotal = candidateDraft + candidateInvited + candidateInProgress + candidateSubmitted;

  // Employee Metrics (Post-joining)
  const employeeApproved = records.filter((r) => r.status === 'approved').length; // ready for provisioning
  const employeeProvisioning = records.filter((r) => r.status === 'account_provisioning').length;
  const employeeCompleted = records.filter((r) => r.status === 'completed').length;
  const employeePostJoiningTotal = employeeApproved + employeeProvisioning + employeeCompleted;

  // Additional counts
  const totalInPipeline = records.length;
  const pendingDocumentReview = candidateSubmitted;
  const pendingProvisioning = employeeApproved;
  const activePostJoining = employeeCompleted;

  // Collect recent activity logs across all records
  const recentLogs = dataList
    .flatMap((d) =>
      (d.activityLogs || []).map((log) => ({
        ...log,
        candidate_name: d.record.candidate_name,
        designation: d.record.designation,
        invitation_token: d.record.invitation_token,
        id_record: d.record.id,
      }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <PageBanner
        title="Onboarding Hub"
        description="Unified command center for pre-joining candidate pipelines and post-joining employee onboarding & lifecycle."
        icon={<Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold rounded-lg text-xs">
              <Link href="/data-management/audit-logs?table=onboarding_records">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Audit Logs</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2 shadow-sm font-semibold rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/onboarding/candidate/new">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Candidate</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total In Pipeline */}
        <div className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total In Pipeline</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalInPipeline}</div>
            <p className="text-[11px] text-muted-foreground">Across Candidate & Employee stages</p>
          </div>
        </div>

        {/* Candidate Pre-Joining */}
        <Link
          href="/onboarding/candidate"
          className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Pre-Joining Pipeline
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
              <span>{candidatePreJoiningTotal}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {candidateInProgress} filling info • {candidateSubmitted} in review
            </p>
          </div>
        </Link>

        {/* Pending Review & Verification */}
        <Link
          href="/onboarding/candidate?status=submitted"
          className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Pending P&C Review
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
              <span>{pendingDocumentReview}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
            </div>
            <p className="text-[11px] text-muted-foreground">Submitted dossiers awaiting KYC approval</p>
          </div>
        </Link>

        {/* Post-Joining & Active */}
        <Link
          href="/onboarding/employee"
          className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Post-Joining & Active
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
              <span>{employeePostJoiningTotal}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {pendingProvisioning} ready for setup • {activePostJoining} active
            </p>
          </div>
        </Link>
      </div>

      {/* Main Two Segments: Candidate vs Employee Onboarding Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment 1: Candidate Onboarding (Pre-Joining) */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/40 via-card to-card p-5 md:p-6 flex flex-col justify-between gap-5 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span>1. Candidate Onboarding</span>
                    <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 text-[10px] font-semibold py-0.5">
                      Pre-Joining
                    </Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage offer proposals, candidate document uploads, verification, and appointment contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Segment Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/onboarding/candidate"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-blue-300 dark:hover:border-blue-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Candidate Pipeline
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  View all active candidates, draft offers, token invites, and form progress.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 pt-1">
                  <span>{candidatePreJoiningTotal} Candidates in Queue</span>
                </div>
              </Link>

              <Link
                href="/onboarding/candidate?status=submitted"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-purple-300 dark:hover:border-purple-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    Document Verification
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Verify Aadhaar/PAN, highest degree, bank cheque, and pre-joining policies.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-purple-600 dark:text-purple-400 pt-1">
                  <span>{pendingDocumentReview} Awaiting Review</span>
                </div>
              </Link>

              <Link
                href="/onboarding/candidate/new"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-blue-300 dark:hover:border-blue-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Create Candidate
                  </span>
                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Initiate new candidate onboarding with role compensation and invite token.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground pt-1">
                  <span>Issue invite link</span>
                </div>
              </Link>

              <Link
                href="/onboarding/candidate?stage=letters"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Offer & Appointment Letters
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Track dynamic legal contract generation and candidate e-signatures.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 pt-1">
                  <span>Digital signoff status</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs text-xs font-semibold">
              <Link href="/onboarding/candidate">
                <span>Go to Candidate Onboarding Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Segment 2: Employee Onboarding (Post-Joining) */}
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/40 via-card to-card p-5 md:p-6 flex flex-col justify-between gap-5 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span>2. Employee Onboarding</span>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 text-[10px] font-semibold py-0.5">
                      Post-Joining & Day-1+
                    </Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Provision @navgurukul.org accounts, assign IT hardware, coordinate Day-1 orientation, and track 30-60-90 probation.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Segment Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/onboarding/employee?tab=provisioning"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Account & IT Setup
                  </span>
                  <Laptop className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Provision official email (@navgurukul.org), Employee ID, and allocate laptops.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                  <span>{pendingProvisioning} Ready for Provisioning</span>
                </div>
              </Link>

              <Link
                href="/onboarding/employee?tab=orientation"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Day-1 & Orientation
                  </span>
                  <HeartHandshake className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Trigger welcome kits, buddy introduction, and manager alignment meetings.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                  <span>Day-1 checklist tracker</span>
                </div>
              </Link>

              <Link
                href="/onboarding/employee?tab=compliance"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Training & Compliance
                  </span>
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Track mandatory POSH training completion, IT security, and handbook sign-offs.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground pt-1">
                  <span>Policy adherence</span>
                </div>
              </Link>

              <Link
                href="/onboarding/employee?tab=milestones"
                className="p-3 rounded-xl border border-border/80 bg-card/90 hover:bg-card hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    30-60-90 Milestones
                  </span>
                  <Award className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Monitor probation check-ins, performance feedback, and permanent confirmations.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 pt-1">
                  <span>Probation checkpoints</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full justify-between bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs text-xs font-semibold">
              <Link href="/onboarding/employee">
                <span>Go to Employee Onboarding Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Lifecycle Flow Architecture Diagram */}
      <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>NavGurukul End-to-End Onboarding Lifecycle Flow</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                From offer dispatch through candidate self-service, P&C verification, official provisioning, and 90-day probation confirmation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex flex-col justify-between items-center gap-2">
              <div className="size-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                1
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Draft & Invite</span>
                <p className="text-[10px] text-muted-foreground">P&C issues secure token invitation</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-blue-300 text-blue-700 dark:text-blue-300">Candidate Stage</Badge>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 flex flex-col justify-between items-center gap-2">
              <div className="size-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                2
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Candidate Portal</span>
                <p className="text-[10px] text-muted-foreground">Candidate uploads docs & signs offer</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700 dark:text-amber-300">Candidate Stage</Badge>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 flex flex-col justify-between items-center gap-2">
              <div className="size-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                3
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">P&C Verification</span>
                <p className="text-[10px] text-muted-foreground">Dossier review & KYC approval</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-700 dark:text-purple-300">Candidate Stage</Badge>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/30 flex flex-col justify-between items-center gap-2">
              <div className="size-7 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                4
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Account Provision</span>
                <p className="text-[10px] text-muted-foreground">@navgurukul.org & Employee ID</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-cyan-300 text-cyan-700 dark:text-cyan-300">Employee Stage</Badge>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col justify-between items-center gap-2">
              <div className="size-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                5
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">Day 1 & Welcome</span>
                <p className="text-[10px] text-muted-foreground">Buddy intro, IT assets & orientation</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700 dark:text-emerald-300">Employee Stage</Badge>
            </div>

            {/* Step 6 */}
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 flex flex-col justify-between items-center gap-2">
              <div className="size-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                6
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">30-60-90 Confirmation</span>
                <p className="text-[10px] text-muted-foreground">Probation reviews & confirmation</p>
              </div>
              <Badge variant="outline" className="text-[9px] border-indigo-300 text-indigo-700 dark:text-indigo-300">Employee Stage</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Recent Activity Stream */}
      <Card className="rounded-2xl border border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span>Recent Onboarding Activity Stream</span>
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold h-7 px-2">
              <Link href="/onboarding/candidate">View All Candidates</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No recent onboarding activities recorded.</div>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-3.5 text-xs pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                  <div className="size-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    {log.actor_type === 'candidate' ? 'C' : log.actor_type === 'pnc' ? 'HR' : 'SYS'}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground truncate">
                        {log.action}{' '}
                        <span className="text-muted-foreground font-normal">
                          for <span className="font-medium text-foreground">{log.candidate_name}</span> ({log.designation})
                        </span>
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">{log.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-7 text-[10px] rounded-lg px-2 shrink-0">
                    <Link href={`/onboarding/review/${log.invitation_token || log.id_record}`}>
                      Review
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
