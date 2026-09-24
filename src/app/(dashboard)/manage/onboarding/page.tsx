'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  Calendar,
  Sparkles,
  FileCheck2,
  FileText,
  History,
  Briefcase,
  MoreVertical,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OnboardingRecord, OnboardingStatus } from '@/lib/onboarding/types';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<
  OnboardingStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    icon: Clock,
  },
  invited: {
    label: 'Invitation Sent',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900',
    icon: Send,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900',
    icon: Clock,
  },
  submitted: {
    label: 'Submitted',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900',
    icon: FileCheck2,
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900',
    icon: FileCheck2,
  },
  changes_requested: {
    label: 'Changes Requested',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900',
    icon: AlertCircle,
  },
  approved: {
    label: 'Approved by P&C',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
    icon: ShieldCheck,
  },
  account_provisioning: {
    label: 'Provisioning',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-900',
    icon: Sparkles,
  },
  completed: {
    label: 'Official Account Active',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
    icon: CheckCircle2,
  },
};

export default function OnboardingDashboardPage() {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/onboarding');
      const json = await res.json();
      if (json.success && json.data) {
        setRecords(json.data);
      } else {
        toast.error('Failed to load onboarding records');
      }
    } catch (err) {
      toast.error('Network error loading onboardings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, teamFilter]);

  const handleSendInvitation = async (id: string, email: string) => {
    try {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_invitation' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Onboarding invitation sent to ${email}`);
        fetchRecords();
      } else {
        toast.error(json.error || 'Failed to send invitation');
      }
    } catch (err) {
      toast.error('Network error sending invitation');
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      r.personal_email.toLowerCase().includes(search.toLowerCase()) ||
      r.designation.toLowerCase().includes(search.toLowerCase()) ||
      (r.team_name && r.team_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'in_progress'
        ? ['invited', 'in_progress'].includes(r.status)
        : statusFilter === 'submitted'
        ? ['submitted', 'under_review'].includes(r.status)
        : statusFilter === 'completed'
        ? ['approved', 'completed'].includes(r.status)
        : r.status === statusFilter;

    const matchesTeam =
      teamFilter === 'ALL' || (r.team_name || r.department || 'None') === teamFilter;

    return matchesSearch && matchesStatus && matchesTeam;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const counts = {
    total: records.length,
    inProgress: records.filter((r) => ['invited', 'in_progress'].includes(r.status)).length,
    submitted: records.filter((r) => ['submitted', 'under_review'].includes(r.status)).length,
    completed: records.filter((r) => ['approved', 'completed'].includes(r.status)).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <PageBanner
        title="Candidate Onboarding"
        description="Manage candidate onboarding, document verification, and provisioning."
        icon={<UserPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold rounded-lg text-xs">
              <Link href="/data-management/audit-logs?table=onboarding_records">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Onboarding Audits</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-2 shadow-sm font-semibold rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/manage/onboarding/new">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Onboarding</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Metrics Grid (4 cards, each 1/4 width on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Onboardings */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`rounded-xl bg-card border shadow-xs p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30'
              : 'border-border/80 hover:border-indigo-300 dark:hover:border-indigo-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Onboardings</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{counts.total}</div>
            <p className="text-[11px] text-muted-foreground">All candidate pipeline records</p>
          </div>
        </div>

        {/* 2. In Progress */}
        <div
          onClick={() => setStatusFilter('in_progress')}
          className={`rounded-xl bg-card border shadow-xs p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
            statusFilter === 'in_progress'
              ? 'border-amber-600 dark:border-amber-500 ring-1 ring-amber-500 bg-amber-50/30 dark:bg-amber-950/30'
              : 'border-border/80 hover:border-amber-300 dark:hover:border-amber-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In Progress</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{counts.inProgress}</div>
            <p className="text-[11px] text-muted-foreground">Candidate filling info & docs</p>
          </div>
        </div>

        {/* 3. Submitted for Review */}
        <div
          onClick={() => setStatusFilter('submitted')}
          className={`rounded-xl bg-card border shadow-xs p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
            statusFilter === 'submitted'
              ? 'border-purple-600 dark:border-purple-500 ring-1 ring-purple-500 bg-purple-50/30 dark:bg-purple-950/30'
              : 'border-border/80 hover:border-purple-300 dark:hover:border-purple-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Submitted for Review</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{counts.submitted}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting P&C doc verification</p>
          </div>
        </div>

        {/* 4. Completed & Active */}
        <div
          onClick={() => setStatusFilter('completed')}
          className={`rounded-xl bg-card border shadow-xs p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
            statusFilter === 'completed'
              ? 'border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
              : 'border-border/80 hover:border-emerald-300 dark:hover:border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Completed & Active</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{counts.completed}</div>
            <p className="text-[11px] text-muted-foreground">Official accounts provisioned</p>
          </div>
        </div>
      </div>

      {/* Search and Action Filter Bar (Matching Users Page Style) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-card/60 backdrop-blur-md p-3 rounded-lg border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by candidate, role, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
              <SelectItem value="draft" className="rounded-lg">Draft</SelectItem>
              <SelectItem value="invited" className="rounded-lg">Invited</SelectItem>
              <SelectItem value="in_progress" className="rounded-lg">In Progress</SelectItem>
              <SelectItem value="submitted" className="rounded-lg">Submitted / Review</SelectItem>
              <SelectItem value="approved" className="rounded-lg">Approved</SelectItem>
              <SelectItem value="completed" className="rounded-lg">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={teamFilter}
            onValueChange={(val) => {
              setTeamFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs rounded-lg">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="ALL" className="rounded-lg">All Teams</SelectItem>
              <SelectItem value="Engineering" className="rounded-lg">Engineering</SelectItem>
              <SelectItem value="Operations" className="rounded-lg">Operations</SelectItem>
              <SelectItem value="Programs" className="rounded-lg">Programs</SelectItem>
              <SelectItem value="Design" className="rounded-lg">Design</SelectItem>
              <SelectItem value="Finance" className="rounded-lg">Finance</SelectItem>
              <SelectItem value="PnC" className="rounded-lg">PnC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Onboarding Table (Matching Users Page Style) */}
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-md shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-muted-foreground">Candidate</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-muted-foreground">Role</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-muted-foreground">Team</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-muted-foreground">Joining Date</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-muted-foreground">Progress</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider py-2.5 px-3 text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs font-medium">
                  Loading onboarding records...
                </TableCell>
              </TableRow>
            ) : paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs font-medium">
                  No onboarding candidates found matching your filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((item) => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                const Icon = cfg.icon;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Candidate Column with Avatar */}
                    <TableCell className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 rounded-lg border border-border shadow-xs">
                          <AvatarFallback className="text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg">
                            {item.candidate_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-foreground leading-tight flex items-center gap-1.5">
                            {item.candidate_name}
                            {item.is_alumni && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-lg"
                              >
                                Alumni
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">{item.personal_email}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell className="py-2.5 px-3 text-xs font-semibold text-foreground">
                      {item.designation}
                    </TableCell>

                    {/* Team */}
                    <TableCell className="py-2.5 px-3">
                      <Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5 rounded-lg">
                        {item.team_name || item.department || 'NavGurukul'}
                      </Badge>
                    </TableCell>

                    {/* Joining Date */}
                    <TableCell className="py-2.5 px-3 text-xs text-muted-foreground font-mono">
                      {item.joining_date}
                    </TableCell>

                    {/* Progress */}
                    <TableCell className="py-2.5 px-3">
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-semibold">{item.progress_percentage}%</span>
                        </div>
                        <Progress value={item.progress_percentage} className="h-1.5 rounded-lg" />
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className={`gap-1 text-[11px] font-semibold py-0.5 px-2 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <Icon className="size-3" />
                        <span>{cfg.label}</span>
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2.5 px-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg inline-flex items-center justify-center"
                            title="Actions"
                          >
                            <span className="sr-only">Open actions menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/onboarding/review/${item.invitation_token || item.id}`}
                              className="flex items-center gap-2 cursor-pointer font-medium py-2 text-xs"
                            >
                              <FileCheck2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Review Dossier</span>
                            </Link>
                          </DropdownMenuItem>
                          
                          {item.invitation_token && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/onboarding/${item.invitation_token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 cursor-pointer py-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="size-3.5 text-blue-500" />
                                <span>Candidate Form ↗</span>
                              </Link>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleSendInvitation(item.id, item.personal_email)}
                            className="flex items-center gap-2 cursor-pointer py-2 text-xs"
                          >
                            <Send className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{item.status === 'draft' ? 'Send Invitation' : 'Resend Invitation'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <DataTablePagination
          pageIndex={currentPage}
          pageSize={pageSize}
          totalItems={filteredRecords.length}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="candidates"
        />
      </div>
    </div>
  );
}
