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
  FileText,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Mail,
  UserCheck,
  CheckCircle2,
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

  // Percentage calculations
  const candidateVerifiedPct =
    candidatePreJoiningTotal > 0
      ? Math.round(((candidatePreJoiningTotal - pendingDocumentReview) / candidatePreJoiningTotal) * 100)
      : 100;

  const employeeProvisionedPct =
    employeePostJoiningTotal > 0
      ? Math.round(((employeePostJoiningTotal - pendingProvisioning) / employeePostJoiningTotal) * 100)
      : 100;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Header Banner - Strictly Single Line Title and Description */}
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
            <Button asChild size="sm" className="gap-2 font-semibold rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
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
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{loading ? '...' : totalInPipeline}</div>
            <p className="text-[11px] text-muted-foreground truncate">Active across Candidate & Employee stages</p>
          </div>
        </Card>

        {/* Candidate Pre-Joining */}
        <Link href="/onboarding/candidate" className="group">
          <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-blue-500/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Pre-Joining Pipeline
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <UserPlus className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                <span>{loading ? '...' : candidatePreJoiningTotal}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {candidateInProgress} in progress • {candidateSubmitted} submitted
              </p>
            </div>
          </Card>
        </Link>

        {/* Pending Review & Verification */}
        <Link href="/onboarding/candidate?status=submitted" className="group">
          <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-purple-500/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Pending P&C Review
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                <span>{loading ? '...' : pendingDocumentReview}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">Dossiers awaiting KYC verification</p>
            </div>
          </Card>
        </Link>

        {/* Post-Joining & Active */}
        <Link href="/onboarding/employee" className="group">
          <Card className="rounded-lg border border-border shadow-xs p-4 flex flex-col justify-between gap-3 transition-all hover:border-emerald-500/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                Post-Joining & Active
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-700 group-hover:text-white transition-all">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-between">
                <span>{loading ? '...' : employeePostJoiningTotal}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-all" />
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                {pendingProvisioning} setup queue • {activePostJoining} active
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Two Segments: Candidate vs Employee Onboarding Command Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================================================================= */}
        {/* SEGMENT 1: CANDIDATE ONBOARDING (PRE-JOINING PIPELINE)            */}
        {/* ================================================================= */}
        <Card className="rounded-lg border border-border shadow-xs p-5 md:p-6 flex flex-col justify-between gap-5 bg-card relative overflow-hidden hover:border-blue-500/30 transition-all duration-300">
          <div className="space-y-5">
            {/* Header with Title, Phase Badge, and Live Status */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold tracking-tight text-foreground">
                        1. Candidate Onboarding
                      </h2>
                      <Badge
                        variant="outline"
                        className="rounded-lg text-[10px] font-semibold py-0.5 px-2 border-blue-200 dark:border-blue-900/60 bg-blue-500/10 text-blue-700 dark:text-blue-300 uppercase tracking-wider"
                      >
                        Phase 1 &bull; Pre-Joining
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Manage prospective candidate proposals, KYC document review, offer letter generation, and signed legal agreements.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-semibold font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                    {loading ? '...' : `${candidatePreJoiningTotal} In Funnel`}
                  </span>
                </div>
              </div>

              {/* Visual Funnel Progression Stepper */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Pre-Joining Lifecycle Stages</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Live Pipeline</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <Link
                    href="/onboarding/candidate?status=draft"
                    className="p-1.5 rounded-lg bg-card border border-border/60 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <div className="text-[10px] text-muted-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate">1. Draft</div>
                    <div className="text-xs font-bold font-mono text-foreground">{candidateDraft}</div>
                  </Link>
                  <Link
                    href="/onboarding/candidate?status=invited"
                    className="p-1.5 rounded-lg bg-card border border-border/60 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <div className="text-[10px] text-muted-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate">2. Invited</div>
                    <div className="text-xs font-bold font-mono text-foreground">{candidateInvited}</div>
                  </Link>
                  <Link
                    href="/onboarding/candidate?status=in_progress"
                    className="p-1.5 rounded-lg bg-card border border-border/60 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <div className="text-[10px] text-muted-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 truncate">3. In Progress</div>
                    <div className="text-xs font-bold font-mono text-foreground">{candidateInProgress}</div>
                  </Link>
                  <Link
                    href="/onboarding/candidate?status=submitted"
                    className={`p-1.5 rounded-lg border transition-all group ${
                      candidateSubmitted > 0
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300'
                        : 'bg-card border-border/60 hover:border-purple-500/50 hover:bg-purple-500/5'
                    }`}
                  >
                    <div className="text-[10px] truncate">4. Review</div>
                    <div className="text-xs font-bold font-mono">{candidateSubmitted}</div>
                  </Link>
                </div>
              </div>

              {/* Urgent Action Notice Strip */}
              {pendingDocumentReview > 0 ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                      <FileCheck2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground">Action Required: </span>
                      <span className="text-muted-foreground">
                        {pendingDocumentReview} dossier{pendingDocumentReview > 1 ? 's' : ''} awaiting P&C KYC verification.
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="xs"
                    variant="outline"
                    className="shrink-0 rounded-lg text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800 font-semibold hover:bg-purple-500/15"
                  >
                    <Link href="/onboarding/candidate?status=submitted">
                      Review &rarr;
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span>All candidate KYC dossiers are currently verified and clear.</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">KYC 100% Up to Date</span>
                </div>
              )}
            </div>

            {/* 6 Rich Workflow Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. Candidate Pipeline */}
              <Link
                href="/onboarding/candidate"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-blue-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Candidate Pipeline
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Interactive Kanban and table tracking of all candidate proposals and invitations.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Kanban</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Stage Tracker</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Tokens</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-blue-600 dark:text-blue-400 pt-0.5 border-t border-border/40">
                  <span>{candidatePreJoiningTotal} Candidates in Funnel</span>
                  <span className="text-muted-foreground">Open Pipeline &rarr;</span>
                </div>
              </Link>

              {/* 2. Document Verification Desk */}
              <Link
                href="/onboarding/candidate?status=submitted"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-purple-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <FileCheck2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Document Verification
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Verify Aadhaar/PAN, degree certificates, bank account proof, and prior experience.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Aadhaar / PAN</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Degree Proof</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Bank KYC</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-purple-600 dark:text-purple-400 pt-0.5 border-t border-border/40">
                  <span>{pendingDocumentReview} Awaiting P&C Review</span>
                  <span className="text-muted-foreground">Verify Dossiers &rarr;</span>
                </div>
              </Link>

              {/* 3. Create Candidate Invite */}
              <Link
                href="/onboarding/candidate/new"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-indigo-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <UserPlus className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Create Candidate Invite
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Fast-track new intake with proposed CTC, role designation, and 7-day token link.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Secure Token</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Auto-Expiry</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Direct Link</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-indigo-600 dark:text-indigo-400 pt-0.5 border-t border-border/40">
                  <span>Issue New Invite</span>
                  <span className="text-muted-foreground">+ New Hire Form</span>
                </div>
              </Link>

              {/* 4. Offer & Appointment Letters */}
              <Link
                href="/manage/letter-templates"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-sky-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 group-hover:bg-sky-700 group-hover:text-white transition-colors">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                      Offer & Letters
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dynamic contract generation with merge tags, digital e-signatures, and PDF export.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Merge Placeholders</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">E-Signatures</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">PDFs</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-sky-700 dark:text-sky-400 pt-0.5 border-t border-border/40">
                  <span>Contract Templates</span>
                  <span className="text-muted-foreground">Manage Templates &rarr;</span>
                </div>
              </Link>

              {/* 5. Pre-Joining Policies */}
              <Link
                href="/manage/settings?tab=general"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-teal-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      Pre-Joining Policies
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Mandatory handbook acknowledgement, POSH rules, and organizational code of conduct.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">POSH Policy</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">IT Security</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">NDA Guidelines</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-teal-700 dark:text-teal-400 pt-0.5 border-t border-border/40">
                  <span>Policy Compliance</span>
                  <span className="text-muted-foreground">Settings &rarr;</span>
                </div>
              </Link>

              {/* 6. Onboarding Audit Trail */}
              <Link
                href="/data-management/audit-logs?table=onboarding_records"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-amber-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                      <History className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Candidate Audit Trail
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Timestamped history of candidate submissions, document revisions, and P&C reviews.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Immutable Logs</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Review Stamps</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Token Events</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-amber-700 dark:text-amber-400 pt-0.5 border-t border-border/40">
                  <span>Inspect Audit Records</span>
                  <span className="text-muted-foreground">Audit Logs &rarr;</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Action Footer Area - VIBRANT INDIGO BUTTON (NO BLACK) */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Button
              asChild
              className="w-full justify-between rounded-lg shadow-sm text-xs font-semibold h-10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              <Link href="/onboarding/candidate">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Go to Candidate Onboarding Pipeline</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg text-xs font-medium h-8">
                <Link href="/onboarding/candidate/new">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                  <span>+ New Candidate</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg text-xs font-medium h-8">
                <Link href="/onboarding/candidate?status=submitted">
                  <FileCheck2 className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                  <span>Verify Dossiers</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* ================================================================= */}
        {/* SEGMENT 2: EMPLOYEE ONBOARDING (POST-JOINING & DAY-1+)            */}
        {/* ================================================================= */}
        <Card className="rounded-lg border border-border shadow-xs p-5 md:p-6 flex flex-col justify-between gap-5 bg-card relative overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-5">
            {/* Header with Title, Phase Badge, and Live Status */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold tracking-tight text-foreground">
                        2. Employee Onboarding
                      </h2>
                      <Badge
                        variant="outline"
                        className="rounded-lg text-[10px] font-semibold py-0.5 px-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider"
                      >
                        Phase 2 &bull; Post-Joining &amp; Day-1+
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Provision @navgurukul.org accounts, assign IT hardware, coordinate Day-1 induction, and track 30-60-90 milestones.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-semibold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {loading ? '...' : `${employeePostJoiningTotal} Active Post-Joining`}
                  </span>
                </div>
              </div>

              {/* Visual Funnel Progression Stepper */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Post-Joining Milestone Stages</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Day 1 &rarr; Day 90</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <Link
                    href="/onboarding/employee?tab=provisioning"
                    className={`p-1.5 rounded-lg border transition-all group ${
                      pendingProvisioning > 0
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                        : 'bg-card border-border/60 hover:border-cyan-500/50 hover:bg-cyan-500/5'
                    }`}
                  >
                    <div className="text-[10px] truncate">1. IT Setup</div>
                    <div className="text-xs font-bold font-mono">{pendingProvisioning}</div>
                  </Link>
                  <Link
                    href="/onboarding/employee?tab=orientation"
                    className="p-1.5 rounded-lg bg-card border border-border/60 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="text-[10px] text-muted-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 truncate">2. Day 1</div>
                    <div className="text-xs font-bold font-mono text-foreground">{employeeProvisioning}</div>
                  </Link>
                  <Link
                    href="/onboarding/employee?tab=compliance"
                    className="p-1.5 rounded-lg bg-card border border-border/60 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                  >
                    <div className="text-[10px] text-muted-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">3. POSH</div>
                    <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">100%</div>
                  </Link>
                  <Link
                    href="/onboarding/employee?tab=milestones"
                    className="p-1.5 rounded-lg bg-card border border-border/60 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                  >
                    <div className="text-[10px] text-muted-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300 truncate">4. 30-60-90</div>
                    <div className="text-xs font-bold font-mono text-foreground">{activePostJoining}</div>
                  </Link>
                </div>
              </div>

              {/* Urgent Action Notice Strip */}
              {pendingProvisioning > 0 ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 shrink-0">
                      <Laptop className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground">Action Required: </span>
                      <span className="text-muted-foreground">
                        {pendingProvisioning} employee{pendingProvisioning > 1 ? 's' : ''} ready for @navgurukul.org account &amp; IT setup.
                      </span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="xs"
                    variant="outline"
                    className="shrink-0 rounded-lg text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800 font-semibold hover:bg-cyan-500/15"
                  >
                    <Link href="/onboarding/employee?tab=provisioning">
                      Setup IT &rarr;
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span>All new employee IT accounts &amp; hardware are provisioned.</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">IT Systems Ready</span>
                </div>
              )}
            </div>

            {/* 6 Rich Workflow Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. Account & IT Setup */}
              <Link
                href="/onboarding/employee?tab=provisioning"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-cyan-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 group-hover:bg-cyan-700 group-hover:text-white transition-colors">
                      <Laptop className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                      Google Workspace &amp; IT
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Provision official @navgurukul.org Google account, Employee ID, and hardware serials.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">@navgurukul.org</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Slack Access</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Hardware Asset</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-cyan-700 dark:text-cyan-400 pt-0.5 border-t border-border/40">
                  <span>{pendingProvisioning} Ready for Provisioning</span>
                  <span className="text-muted-foreground">Setup Accounts &rarr;</span>
                </div>
              </Link>

              {/* 2. Day-1 & Orientation */}
              <Link
                href="/onboarding/employee?tab=orientation"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-amber-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                      <HeartHandshake className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      Day-1 &amp; Orientation
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Trigger welcome kits, assign peer onboarding buddies, and schedule manager 1-on-1s.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Welcome Kit</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Buddy Assigned</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Manager Intro</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-amber-700 dark:text-amber-400 pt-0.5 border-t border-border/40">
                  <span>Day-1 Checklist Tracker</span>
                  <span className="text-muted-foreground">Orientation &rarr;</span>
                </div>
              </Link>

              {/* 3. Training & Compliance */}
              <Link
                href="/onboarding/employee?tab=compliance"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-emerald-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      Training &amp; POSH
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Statutory POSH certification, IT data security quiz, and organizational handbook adherence.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">POSH Training</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">IT Security</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Handbook Sign</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-emerald-700 dark:text-emerald-400 pt-0.5 border-t border-border/40">
                  <span>Statutory Compliance</span>
                  <span className="text-muted-foreground">Compliance Desk &rarr;</span>
                </div>
              </Link>

              {/* 4. 30-60-90 Milestones */}
              <Link
                href="/onboarding/employee?tab=milestones"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-purple-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      30-60-90 Milestones
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Monitor probation check-ins, performance feedback, and permanent confirmations.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Day-30 Sync</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Day-60 Review</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Day-90 Confirmed</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-purple-600 dark:text-purple-400 pt-0.5 border-t border-border/40">
                  <span>{activePostJoining} Active Checkpoints</span>
                  <span className="text-muted-foreground">Milestones &rarr;</span>
                </div>
              </Link>

              {/* 5. Workforce Directory */}
              <Link
                href="/employees"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-blue-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Workforce Roster
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Inspect confirmed team profiles, departments, campus locations, and designations.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Active Roster</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Campus Map</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Profiles</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-blue-600 dark:text-blue-400 pt-0.5 border-t border-border/40">
                  <span>Institutional Directory</span>
                  <span className="text-muted-foreground">Team Roster &rarr;</span>
                </div>
              </Link>

              {/* 6. Lifecycle Email Notices */}
              <Link
                href="/manage/emails?tab=templates"
                className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 hover:border-indigo-500/40 transition-all group flex flex-col justify-between gap-2.5 relative overflow-hidden shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Lifecycle Notices
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-all" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Configure automated welcome templates, buddy introductions, and cadence rules.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Auto-Welcome</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Buddy Email</span>
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-lg text-muted-foreground font-medium">Review Nudges</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-indigo-600 dark:text-indigo-400 pt-0.5 border-t border-border/40">
                  <span>Cadence Automations</span>
                  <span className="text-muted-foreground">Email Hub &rarr;</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Action Footer Area - VIBRANT INDIGO BUTTON (NO BLACK) */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Button
              asChild
              className="w-full justify-between rounded-lg shadow-sm text-xs font-semibold h-10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
            >
              <Link href="/onboarding/employee">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Go to Employee Onboarding Dashboard</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg text-xs font-medium h-8">
                <Link href="/onboarding/employee?tab=provisioning">
                  <Laptop className="h-3.5 w-3.5 mr-1.5 text-cyan-700 dark:text-cyan-400" />
                  <span>IT Provisioning</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg text-xs font-medium h-8">
                <Link href="/onboarding/employee?tab=milestones">
                  <Award className="h-3.5 w-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                  <span>30-60-90 Milestones</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
