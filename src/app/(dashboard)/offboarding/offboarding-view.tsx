'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Laptop,
  AlertCircle,
  FileCheck2,
  FileText,
  Send,
  User,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Banknote,
  RotateCcw,
  Sparkles,
  UserMinus,
  Calendar,
  Building,
  Check,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  OffboardingCase,
  ExitType,
  InitiateOffboardingInput,
} from '@/lib/offboarding/types';
import { Employee } from '@/lib/employees/getEmployees';
import {
  initiateOffboardingCase,
  sendOffboardingReminders,
} from '@/lib/offboarding/service';
import { formatDate } from '@/lib/employees/tenure';
import { toast } from 'sonner';

interface OffboardingViewProps {
  initialCases: OffboardingCase[];
  employees: Employee[];
}

export function OffboardingView({
  initialCases,
  employees,
}: OffboardingViewProps) {
  const [cases, setCases] = useState<OffboardingCase[]>(initialCases);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [exitTypeFilter, setExitTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Initiate Modal State
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [initForm, setInitForm] = useState<{
    employee_id: string;
    exit_type: ExitType;
    initiated_date: string;
    notice_period_days: number;
    notice_period_waived: boolean;
    proposed_lwd: string;
    reason: string;
    reason_details: string;
    immediate_relieving: boolean;
    exception_notes: string;
  }>({
    employee_id: '',
    exit_type: 'resignation',
    initiated_date: new Date().toISOString().split('T')[0],
    notice_period_days: 30,
    notice_period_waived: false,
    proposed_lwd: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    reason: 'Personal Reasons / Career Transition',
    reason_details: '',
    immediate_relieving: false,
    exception_notes: '',
  });

  // Selected employee metadata
  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === initForm.employee_id) || null;
  }, [employees, initForm.employee_id]);

  // Recalculate proposed LWD when notice period or initiated date changes
  const handleNoticePeriodChange = (days: number, waived: boolean = false) => {
    const initDate = new Date(initForm.initiated_date || Date.now());
    const effectiveDays = waived ? 0 : days;
    initDate.setDate(initDate.getDate() + effectiveDays);
    setInitForm((prev) => ({
      ...prev,
      notice_period_days: days,
      notice_period_waived: waived,
      proposed_lwd: initDate.toISOString().split('T')[0],
    }));
  };

  const handleImmediateRelievingToggle = (checked: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    setInitForm((prev) => ({
      ...prev,
      immediate_relieving: checked,
      exit_type: checked ? 'immediate_relieving' : 'resignation',
      notice_period_days: checked ? 0 : 30,
      notice_period_waived: checked,
      proposed_lwd: checked ? today : new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      reason: checked ? 'Immediate Separation / Medical or Special Grounds' : prev.reason,
    }));
  };

  // Submit Initiation
  const handleSubmitInitiation = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    startTransition(async () => {
      const input: InitiateOffboardingInput = {
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.name,
        employee_email: selectedEmployee.email || `${selectedEmployee.name.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`,
        employee_designation: selectedEmployee.employee_type || 'Team Member',
        employee_department: selectedEmployee.team || 'General Operations',
        employee_type: selectedEmployee.employee_type || 'Full-Time',
        manager_name: 'Reporting Manager',
        exit_type: initForm.exit_type,
        initiated_date: initForm.initiated_date,
        initiated_by: 'People & Culture Operations',
        proposed_lwd: initForm.proposed_lwd,
        notice_period_days: initForm.notice_period_days,
        notice_period_waived: initForm.notice_period_waived,
        reason: initForm.reason,
        reason_details: initForm.reason_details,
        immediate_relieving: initForm.immediate_relieving,
        exception_notes: initForm.exception_notes,
      };

      const res = await initiateOffboardingCase(input);
      if (res.success && res.caseId) {
        toast.success(`Exit initiated successfully for ${selectedEmployee.name}`);
        setInitiateModalOpen(false);
        // Refresh local cases list
        const newRecord: OffboardingCase = {
          id: res.caseId,
          ...input,
          status: input.immediate_relieving ? 'settlement_pending' : 'notice_period',
          notice_period_days: input.notice_period_days || 30,
          notice_period_waived: Boolean(input.notice_period_waived),
          immediate_relieving: Boolean(input.immediate_relieving),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCases((prev) => [newRecord, ...prev]);
      } else {
        toast.error(res.error || 'Failed to initiate exit');
      }
    });
  };

  // Automated Reminders Trigger
  const handleTriggerReminders = () => {
    startTransition(async () => {
      toast.loading('Checking pending clearance items and dispatching reminders...', { id: 'reminders-toast' });
      const res = await sendOffboardingReminders();
      if (res.success) {
        toast.success(
          res.remindersSent > 0
            ? `Dispatched ${res.remindersSent} automated clearance reminders to departing employees and department owners.`
            : 'All active exit cases are currently on track. No pending reminder dispatches required.',
          { id: 'reminders-toast' }
        );
      } else {
        toast.error('Failed to trigger reminders', { id: 'reminders-toast' });
      }
    });
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const today = new Date();
    const activeCases = cases.filter((c) => c.status !== 'completed' && c.status !== 'cancelled');
    const approachingLwd = activeCases.filter((c) => {
      const lwd = new Date(c.proposed_lwd);
      const diffDays = Math.ceil((lwd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    const pendingClearance = activeCases.filter(
      (c) => c.status === 'clearance_in_progress' || c.status === 'notice_period'
    );
    const pendingSettlement = activeCases.filter((c) => c.status === 'settlement_pending');
    const completedExits = cases.filter((c) => c.status === 'completed');

    return {
      activeCount: activeCases.length,
      approachingCount: approachingLwd.length,
      clearanceCount: pendingClearance.length,
      settlementCount: pendingSettlement.length,
      completedCount: completedExits.length,
    };
  }, [cases]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.employee_department) set.add(c.employee_department);
    });
    return Array.from(set).sort();
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    const q = search.toLowerCase().trim();
    const today = new Date();

    return cases.filter((c) => {
      // Tab filter
      if (activeTab === 'notice_period' && c.status !== 'notice_period') return false;
      if (activeTab === 'clearance' && c.status !== 'clearance_in_progress') return false;
      if (activeTab === 'settlement' && c.status !== 'settlement_pending') return false;
      if (activeTab === 'completed' && c.status !== 'completed') return false;
      if (activeTab === 'exceptions') {
        const isDamagedOrException =
          c.immediate_relieving ||
          Boolean(c.exception_notes) ||
          c.id === 'off-case-002-siddharth-sharma' ||
          c.id === 'off-case-003-priya-shukla';
        if (!isDamagedOrException) return false;
      }

      // Exit type filter
      if (exitTypeFilter !== 'all' && c.exit_type !== exitTypeFilter) return false;

      // Department filter
      if (departmentFilter !== 'all' && c.employee_department !== departmentFilter) return false;

      // Search
      if (q) {
        const nameMatch = c.employee_name?.toLowerCase().includes(q);
        const emailMatch = c.employee_email?.toLowerCase().includes(q);
        const deptMatch = c.employee_department?.toLowerCase().includes(q);
        const roleMatch = c.employee_designation?.toLowerCase().includes(q);
        const reasonMatch = c.reason?.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !deptMatch && !roleMatch && !reasonMatch) return false;
      }

      return true;
    });
  }, [cases, activeTab, exitTypeFilter, departmentFilter, search]);

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  // Helper for status badge
  const renderStatusBadge = (status: OffboardingCase['status']) => {
    switch (status) {
      case 'initiated':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200">
            Exit Initiated
          </Badge>
        );
      case 'notice_period':
        return (
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200">
            In Notice Period
          </Badge>
        );
      case 'clearance_in_progress':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200">
            Clearance & NDC
          </Badge>
        );
      case 'settlement_pending':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200">
            F&F Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200">
            Officially Exited
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-200">
            Withdrawn / Retained
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderExitTypeBadge = (type: ExitType) => {
    switch (type) {
      case 'resignation':
        return <span className="text-xs font-medium text-foreground">Resignation</span>;
      case 'immediate_relieving':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="size-3" /> Immediate Exit
          </span>
        );
      case 'contract_completion':
        return <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Contract End</span>;
      case 'termination':
        return <span className="text-xs font-medium text-rose-700 dark:text-rose-300">Termination</span>;
      case 'mutual_separation':
        return <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Mutual Separation</span>;
      default:
        return <span className="text-xs capitalize">{type.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <PageBanner
        title="Offboarding & Exit Lifecycle Management"
        description="Oversee employee resignations, notice periods, structured departmental clearances, No Dues Certificates, and Full & Final settlements."
        icon={<UserMinus className="h-6 w-6 text-rose-600 dark:text-rose-400" />}
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-3 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Cases</span>
            <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="size-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{metrics.activeCount}</span>
            <span className="block text-[11px] text-muted-foreground">Departures underway</span>
          </div>
        </Card>

        <Card className="p-3 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Approaching LWD</span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{metrics.approachingCount}</span>
            <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-medium">Next 7 days</span>
          </div>
        </Card>

        <Card className="p-3 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Clearances</span>
            <div className="size-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Laptop className="size-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{metrics.clearanceCount}</span>
            <span className="block text-[11px] text-muted-foreground">KT & Hardware return</span>
          </div>
        </Card>

        <Card className="p-3 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">F&F Processing</span>
            <div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Banknote className="size-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{metrics.settlementCount}</span>
            <span className="block text-[11px] text-muted-foreground">Finance computation</span>
          </div>
        </Card>

        <Card className="p-3 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Exited & Closed</span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground">{metrics.completedCount}</span>
            <span className="block text-[11px] text-muted-foreground">All dues & letters issued</span>
          </div>
        </Card>
      </div>

      {/* 3. Action Toolbar & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Select
            value={exitTypeFilter}
            onValueChange={(val) => {
              setExitTypeFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[150px]">
              <SelectValue placeholder="All Exit Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exit Types</SelectItem>
              <SelectItem value="resignation">Resignation</SelectItem>
              <SelectItem value="immediate_relieving">Immediate Relieving</SelectItem>
              <SelectItem value="contract_completion">Contract End</SelectItem>
              <SelectItem value="termination">Termination</SelectItem>
              <SelectItem value="mutual_separation">Mutual Separation</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={departmentFilter}
            onValueChange={(val) => {
              setDepartmentFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[150px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerReminders}
            disabled={isPending}
            className="h-9 text-xs gap-1.5 border-dashed"
            title="Scan active cases and dispatch reminder emails for pending checkpoints"
          >
            <Send className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Send Reminders</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setInitiateModalOpen(true)}
            className="h-9 text-xs font-semibold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Initiate Exit</span>
          </Button>
        </div>
      </div>

      {/* 4. Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setCurrentPage(1); }}>
        <TabsList className="bg-muted/60 p-1 rounded-xl w-full justify-start overflow-x-auto flex-nowrap border border-border">
          <TabsTrigger value="all" className="text-xs rounded-lg py-1.5 px-3">
            All Cases ({cases.length})
          </TabsTrigger>
          <TabsTrigger value="notice_period" className="text-xs rounded-lg py-1.5 px-3">
            Notice Period ({cases.filter((c) => c.status === 'notice_period').length})
          </TabsTrigger>
          <TabsTrigger value="clearance" className="text-xs rounded-lg py-1.5 px-3">
            Clearances & NDC ({cases.filter((c) => c.status === 'clearance_in_progress').length})
          </TabsTrigger>
          <TabsTrigger value="settlement" className="text-xs rounded-lg py-1.5 px-3">
            F&F Settlement ({cases.filter((c) => c.status === 'settlement_pending').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs rounded-lg py-1.5 px-3">
            Officially Exited ({cases.filter((c) => c.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="text-xs rounded-lg py-1.5 px-3">
            Exceptions & Blockers
          </TabsTrigger>
        </TabsList>

        {/* 5. Cases Table View */}
        <div className="mt-4 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Employee</TableHead>
                  <TableHead className="text-xs font-semibold">Exit Type</TableHead>
                  <TableHead className="text-xs font-semibold">Timeline & Notice</TableHead>
                  <TableHead className="text-xs font-semibold">Proposed LWD</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Case Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {paginatedCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                      No offboarding cases found matching current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCases.map((c) => {
                    const today = new Date();
                    const proposed = new Date(c.proposed_lwd);
                    const diffDays = Math.ceil((proposed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = diffDays < 0 && c.status !== 'completed';

                    return (
                      <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-8 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-bold text-xs ring-1 ring-rose-500/20">
                              <AvatarFallback className="rounded-lg">
                                {c.employee_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="block font-semibold text-sm text-foreground truncate">
                                {c.employee_name}
                              </span>
                              <span className="block text-[11px] text-muted-foreground truncate">
                                {c.employee_designation} • {c.employee_department}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          {renderExitTypeBadge(c.exit_type)}
                          <span className="block text-[11px] text-muted-foreground truncate max-w-[180px]" title={c.reason}>
                            {c.reason}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-medium text-foreground block">
                              Initiated {formatDate(c.initiated_date)}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {c.notice_period_waived ? (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">Notice Waived</span>
                              ) : (
                                `${c.notice_period_days} Days Notice`
                              )}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div>
                            <span className="text-xs font-semibold text-foreground block">
                              {formatDate(c.proposed_lwd)}
                            </span>
                            {c.status === 'completed' ? (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Closed on {formatDate(c.actual_lwd || c.proposed_lwd)}
                              </span>
                            ) : isOverdue ? (
                              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                                <AlertCircle className="size-3" /> LWD Passed ({Math.abs(diffDays)}d ago)
                              </span>
                            ) : diffDays <= 7 ? (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                <Clock className="size-3" /> {diffDays} days remaining
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                {diffDays} days remaining
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          {renderStatusBadge(c.status)}
                        </TableCell>

                        <TableCell className="py-3 text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 rounded-lg"
                          >
                            <Link href={`/offboarding/${c.id}`}>
                              <span>Manage Case</span>
                              <ChevronRight className="size-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination
            pageIndex={currentPage}
            pageSize={pageSize}
            totalItems={filteredCases.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </Tabs>

      {/* 6. Initiate Exit Modal Dialog */}
      <Dialog open={initiateModalOpen} onOpenChange={setInitiateModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <UserMinus className="size-4 text-rose-600" />
              Initiate Employee Exit Workflow
            </DialogTitle>
            <DialogDescription className="text-xs">
              Establish formal separation record, calculate Last Working Day based on notice terms, and initiate departmental clearances.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Employee Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Employee *</Label>
              <Select
                value={initForm.employee_id}
                onValueChange={(val) => {
                  setInitForm((prev) => ({ ...prev, employee_id: val }));
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select active employee from directory..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees
                    .filter((e) => e.status?.toLowerCase() !== 'exited')
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.team || 'No Team'} • {emp.employee_type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department / Team:</span>
                  <span className="font-semibold text-foreground">{selectedEmployee.team || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement Model:</span>
                  <span className="font-semibold text-foreground">{selectedEmployee.employee_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium text-foreground">{formatDate(selectedEmployee.joining_date)}</span>
                </div>
              </div>
            )}

            {/* Exit Type & Immediate Relieving Switch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Exit Classification *</Label>
                <Select
                  value={initForm.exit_type}
                  onValueChange={(val: ExitType) =>
                    setInitForm((prev) => ({ ...prev, exit_type: val }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resignation">Resignation (Standard)</SelectItem>
                    <SelectItem value="immediate_relieving">Immediate Relieving (Exception)</SelectItem>
                    <SelectItem value="contract_completion">Contract Completion</SelectItem>
                    <SelectItem value="mutual_separation">Mutual Agreement</SelectItem>
                    <SelectItem value="termination">Organizational Separation / Termination</SelectItem>
                    <SelectItem value="other">Other Approved Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initiation Date *</Label>
                <Input
                  type="date"
                  value={initForm.initiated_date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setInitForm((prev) => ({ ...prev, initiated_date: newDate }));
                    handleNoticePeriodChange(initForm.notice_period_days, initForm.notice_period_waived);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Immediate Relieving Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-rose-600" />
                  Immediate Relieving (Waive Notice Period)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Fast-tracks last working day to today and sets notice period to 0 days under approved policy exceptions.
                </p>
              </div>
              <Switch
                checked={initForm.immediate_relieving}
                onCheckedChange={handleImmediateRelievingToggle}
              />
            </div>

            {/* Notice Period and Proposed LWD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Notice Period (Days)</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  disabled={initForm.immediate_relieving}
                  value={initForm.notice_period_days}
                  onChange={(e) => handleNoticePeriodChange(parseInt(e.target.value) || 0, false)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Proposed Last Working Day *</Label>
                <Input
                  type="date"
                  value={initForm.proposed_lwd}
                  onChange={(e) => setInitForm((prev) => ({ ...prev, proposed_lwd: e.target.value }))}
                  className="h-9 text-xs font-semibold text-rose-600 dark:text-rose-400"
                />
              </div>
            </div>

            {/* Reason for Departure */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Primary Reason *</Label>
              <Input
                placeholder="e.g. Higher studies, Career progression, Medical relocation..."
                value={initForm.reason}
                onChange={(e) => setInitForm((prev) => ({ ...prev, reason: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>

            {/* Remarks / Details */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks & Handover Instructions</Label>
              <Textarea
                placeholder="Enter context, designated handover peer, or special notes for IT/Finance..."
                rows={3}
                value={initForm.reason_details}
                onChange={(e) => setInitForm((prev) => ({ ...prev, reason_details: e.target.value }))}
                className="text-xs resize-none"
              />
            </div>

            {initForm.immediate_relieving && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-rose-600">
                  Exception & Waiver Approver Authority *
                </Label>
                <Input
                  placeholder="e.g. Approved by Leadership / Executive Director on medical grounds"
                  value={initForm.exception_notes}
                  onChange={(e) => setInitForm((prev) => ({ ...prev, exception_notes: e.target.value }))}
                  className="h-9 text-xs border-rose-500/40"
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInitiateModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitInitiation}
              disabled={isPending || !initForm.employee_id || !initForm.proposed_lwd}
              className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white min-w-[130px]"
            >
              {isPending ? 'Initiating...' : 'Confirm Exit Initiation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
