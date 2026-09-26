'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  UserPlus,
  Users,
  FileCheck2,
  Laptop,
  HeartHandshake,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
  History,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page_banner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FullOnboardingData } from '@/lib/onboarding/types';
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
    } catch {
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
  const employeeApproved = records.filter((r) => r.status === 'approved').length;
  const employeeProvisioning = records.filter((r) => r.status === 'account_provisioning').length;
  const employeeCompleted = records.filter((r) => r.status === 'completed').length;
  const employeePostJoiningTotal = employeeApproved + employeeProvisioning + employeeCompleted;

  // Additional counts
  const totalInPipeline = records.length;
  const pendingDocumentReview = candidateSubmitted;
  const pendingProvisioning = employeeApproved;
  const activePostJoining = employeeCompleted;

  // Recent activity logs across all records
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
      {/* Header Banner - Single Line Title and Description */}
      <PageBanner
        title="Onboarding Hub"
        description="Unified command center for pre-joining candidate pipelines and post-joining onboarding."
        icon={<Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-medium rounded-lg text-xs">
              <Link href="/data-management/audit-logs?table=onboarding_records">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Audit Logs</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2 font-medium rounded-lg text-xs">
              <Link href="/onboarding/candidate/new">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Candidate</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Pipeline */}
        <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total In Pipeline</span>
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{loading ? '...' : totalInPipeline}</div>
            <p className="text-[11px] text-muted-foreground truncate">Across Candidate & Employee stages</p>
          </div>
        </Card>

        {/* Candidate Pre-Joining */}
        <Link href="/onboarding/candidate" className="group">
          <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Pre-Joining Pipeline
              </span>
              <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                <UserPlus className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                <span>{loading ? '...' : candidatePreJoiningTotal}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {candidateInProgress} in progress • {candidateSubmitted} submitted
              </p>
            </div>
          </Card>
        </Link>

        {/* Pending Review & Verification */}
        <Link href="/onboarding/candidate?status=submitted" className="group">
          <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Pending P&C Review
              </span>
              <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                <span>{loading ? '...' : pendingDocumentReview}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">Submitted dossiers awaiting review</p>
            </div>
          </Card>
        </Link>

        {/* Post-Joining & Active */}
        <Link href="/onboarding/employee" className="group">
          <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-primary/50 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Post-Joining & Active
              </span>
              <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                <span>{loading ? '...' : employeePostJoiningTotal}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {pendingProvisioning} for setup • {activePostJoining} active
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Two Segments: Candidate vs Employee Onboarding Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment 1: Candidate Onboarding (Pre-Joining) */}
        <Card className="rounded-lg border border-border shadow-xs p-5 md:p-6 flex flex-col justify-between gap-5 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      1. Candidate Onboarding
                    </h2>
                    <Badge variant="secondary" className="rounded-lg text-[10px] font-medium py-0.5 px-2">
                      Pre-Joining
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage offer proposals, document collection, identity checks, and signed contracts.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Segment Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Link
                href="/onboarding/candidate"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Candidate Pipeline
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  View all active candidates, draft offers, token invites, and form progress.
                </p>
                <div className="text-[10px] font-medium text-primary pt-0.5">
                  {candidatePreJoiningTotal} Candidates in Queue
                </div>
              </Link>

              <Link
                href="/onboarding/candidate?status=submitted"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Document Verification
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Verify Aadhaar/PAN, highest degree, bank details, and pre-joining policies.
                </p>
                <div className="text-[10px] font-medium text-primary pt-0.5">
                  {pendingDocumentReview} Awaiting Review
                </div>
              </Link>

              <Link
                href="/onboarding/candidate/new"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Create Candidate
                  </span>
                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Initiate new candidate onboarding with role compensation and invite token.
                </p>
                <div className="text-[10px] font-medium text-muted-foreground pt-0.5">
                  Issue invite link
                </div>
              </Link>

              <Link
                href="/onboarding/candidate?stage=letters"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Offer & Appointment Letters
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Track dynamic legal contract generation and candidate e-signatures.
                </p>
                <div className="text-[10px] font-medium text-primary pt-0.5">
                  Digital signoff status
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full justify-between rounded-lg shadow-xs text-xs font-medium">
              <Link href="/onboarding/candidate">
                <span>Go to Candidate Onboarding Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* Segment 2: Employee Onboarding (Post-Joining) */}
        <Card className="rounded-lg border border-border shadow-xs p-5 md:p-6 flex flex-col justify-between gap-5 bg-card">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">
                      2. Employee Onboarding
                    </h2>
                    <Badge variant="secondary" className="rounded-lg text-[10px] font-medium py-0.5 px-2">
                      Post-Joining & Day-1+
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Provision @navgurukul.org accounts, assign hardware, coordinate Day-1, and track milestones.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Segment Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Link
                href="/onboarding/employee?tab=provisioning"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Account & IT Setup
                  </span>
                  <Laptop className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Provision official email (@navgurukul.org), Employee ID, and allocate laptops.
                </p>
                <div className="text-[10px] font-medium text-primary pt-0.5">
                  {pendingProvisioning} Ready for Provisioning
                </div>
              </Link>

              <Link
                href="/onboarding/employee?tab=orientation"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Day-1 & Orientation
                  </span>
                  <HeartHandshake className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Trigger welcome kits, buddy introduction, and manager alignment meetings.
                </p>
                <div className="text-[10px] font-medium text-muted-foreground pt-0.5">
                  Day-1 checklist tracker
                </div>
              </Link>

              <Link
                href="/onboarding/employee?tab=compliance"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Training & Compliance
                  </span>
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Track mandatory POSH training completion, IT security, and handbook sign-offs.
                </p>
                <div className="text-[10px] font-medium text-muted-foreground pt-0.5">
                  Policy adherence
                </div>
              </Link>

              <Link
                href="/onboarding/employee?tab=milestones"
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-border transition-all group flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    30-60-90 Milestones
                  </span>
                  <Award className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  Monitor probation check-ins, performance feedback, and permanent confirmations.
                </p>
                <div className="text-[10px] font-medium text-muted-foreground pt-0.5">
                  Probation checkpoints
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Button asChild className="w-full justify-between rounded-lg shadow-xs text-xs font-medium">
              <Link href="/onboarding/employee">
                <span>Go to Employee Onboarding Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Lifecycle Flow Architecture Diagram - Clean & Uniform */}
      <Card className="rounded-lg border border-border shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>NavGurukul End-to-End Onboarding Lifecycle Flow</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                From offer dispatch through candidate self-service, P&C verification, official provisioning, and 90-day confirmation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { step: '1', title: 'Draft & Invite', desc: 'P&C issues secure token invitation', stage: 'Candidate Stage' },
              { step: '2', title: 'Candidate Portal', desc: 'Candidate uploads docs & signs offer', stage: 'Candidate Stage' },
              { step: '3', title: 'P&C Verification', desc: 'Dossier review & KYC approval', stage: 'Candidate Stage' },
              { step: '4', title: 'Account Provision', desc: '@navgurukul.org & Employee ID', stage: 'Employee Stage' },
              { step: '5', title: 'Day 1 & Welcome', desc: 'Buddy intro, IT assets & orientation', stage: 'Employee Stage' },
              { step: '6', title: '30-60-90 Review', desc: 'Probation reviews & confirmation', stage: 'Employee Stage' },
            ].map((item) => (
              <div
                key={item.step}
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 transition-colors flex flex-col justify-between items-center text-center gap-2"
              >
                <div className="size-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
                  {item.step}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">{item.title}</span>
                  <p className="text-[10px] text-muted-foreground leading-snug">{item.desc}</p>
                </div>
                <Badge variant="outline" className="text-[9px] rounded-lg border-border text-muted-foreground font-medium py-0 px-1.5">
                  {item.stage}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Recent Activity Stream */}
      <Card className="rounded-lg border border-border shadow-xs">
        <CardHeader className="border-b border-border/60 p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span>Recent Onboarding Activity Stream</span>
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs font-medium h-7 px-2">
              <Link href="/onboarding/candidate">View All Candidates</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">Loading recent activities...</div>
          ) : recentLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No recent onboarding activities recorded.</div>
          ) : (
            <div className="space-y-3.5">
              {recentLogs.map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-3.5 text-xs pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                  <div className="size-8 rounded-full bg-muted border border-border text-foreground flex items-center justify-center shrink-0 font-medium text-xs mt-0.5">
                    {log.actor_type === 'candidate' ? 'C' : log.actor_type === 'pnc' ? 'HR' : 'SYS'}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground truncate">
                        {log.action}{' '}
                        <span className="text-muted-foreground font-normal">
                          for <span className="font-medium text-foreground">{log.candidate_name}</span> ({log.designation})
                        </span>
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] truncate">{log.description}</p>
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
