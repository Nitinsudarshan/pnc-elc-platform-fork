'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Laptop,
  HeartHandshake,
  Award,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building,
  Calendar,
  MoreVertical,
  ArrowLeft,
  Mail,
  UserCheck,
  Edit,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileCheck2,
  FileText,
  Send,
  User,
  Check,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FullOnboardingData,
  EmployeeAccountProvisioning,
  EmployeeOrientationChecklist,
  ProbationMilestone,
} from '@/lib/onboarding/types';
import { toast } from 'sonner';

function EmployeeOnboardingContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  const [dataList, setDataList] = useState<FullOnboardingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog States
  const [selectedRecord, setSelectedRecord] = useState<FullOnboardingData | null>(null);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [orientationModalOpen, setOrientationModalOpen] = useState(false);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [activeMilestoneKey, setActiveMilestoneKey] = useState<'day_30' | 'day_60' | 'day_90'>('day_30');

  // Form states for dialogs
  const [provisionForm, setProvisionForm] = useState({
    official_email: '',
    employee_id_code: '',
    it_assets_notes: '',
  });

  const [orientationForm, setOrientationForm] = useState<EmployeeOrientationChecklist>({
    welcome_email_sent: false,
    it_assets_assigned: false,
    slack_access_granted: false,
    buddy_introduced: false,
    manager_1on1_done: false,
    pnc_induction_done: false,
    posh_training_completed: false,
  });

  const [milestoneForm, setMilestoneForm] = useState<ProbationMilestone>({
    status: 'pending',
    notes: '',
    due_date: '',
    reviewer_name: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/onboarding?details=full');
      const json = await res.json();
      if (json.success && json.data) {
        setDataList(json.data);
      } else {
        toast.error('Failed to load employee onboarding records');
      }
    } catch (err) {
      toast.error('Network error loading onboarding records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') || 'all');
    }
  }, [searchParams]);

  // Filter only post-joining records (Approved, Account Provisioning, Completed)
  // or records that are ready for onboarding
  const postJoiningRecords = dataList.filter((d) =>
    ['approved', 'account_provisioning', 'completed'].includes(d.record.status)
  );

  const filteredRecords = postJoiningRecords.filter((d) => {
    const r = d.record;
    const matchesSearch =
      r.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.provisioning?.official_email &&
        d.provisioning.official_email.toLowerCase().includes(search.toLowerCase())) ||
      (d.provisioning?.employee_id_code &&
        d.provisioning.employee_id_code.toLowerCase().includes(search.toLowerCase())) ||
      r.designation.toLowerCase().includes(search.toLowerCase()) ||
      (r.team_name && r.team_name.toLowerCase().includes(search.toLowerCase()));

    const matchesTeam =
      teamFilter === 'ALL' || (r.team_name || r.department || 'None') === teamFilter;

    return matchesSearch && matchesTeam;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const totalEmployees = postJoiningRecords.length;
  const pendingProvisioning = postJoiningRecords.filter((d) => !d.provisioning || d.record.status === 'approved').length;
  const activeOrientation = postJoiningRecords.filter((d) => {
    const chk = d.provisioning?.orientation_checklist;
    if (!chk) return true;
    return !chk.posh_training_completed || !chk.pnc_induction_done || !chk.manager_1on1_done;
  }).length;
  const upcomingMilestones = postJoiningRecords.filter((d) => {
    const m = d.provisioning?.probation_milestones;
    return (
      m?.day_30?.status === 'scheduled' ||
      m?.day_60?.status === 'scheduled' ||
      m?.day_90?.status === 'scheduled' ||
      m?.day_30?.status === 'pending'
    );
  }).length;

  // Open Provisioning Modal
  const openProvisionModal = (item: FullOnboardingData) => {
    setSelectedRecord(item);
    const names = item.record.candidate_name.trim().toLowerCase().split(/\s+/);
    const defaultEmail = `${names[0] || 'employee'}.${names.slice(1).join('') || 'ng'}@navgurukul.org`;
    const defaultCode = `NG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    setProvisionForm({
      official_email: item.provisioning?.official_email || defaultEmail,
      employee_id_code: item.provisioning?.employee_id_code || defaultCode,
      it_assets_notes: item.provisioning?.orientation_checklist?.it_assets_notes || '',
    });
    setProvisionModalOpen(true);
  };

  const handleSaveProvisioning = async () => {
    if (!selectedRecord) return;
    try {
      const res = await fetch(`/api/onboarding/${selectedRecord.record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_provisioning',
          details: provisionForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Account and IT details provisioned for ${selectedRecord.record.candidate_name}`);
        setProvisionModalOpen(false);
        fetchData();
      } else {
        toast.error(json.error || 'Failed to save provisioning details');
      }
    } catch (e) {
      toast.error('Network error saving provisioning');
    }
  };

  // Open Orientation Modal
  const openOrientationModal = (item: FullOnboardingData) => {
    setSelectedRecord(item);
    const chk = item.provisioning?.orientation_checklist || {
      welcome_email_sent: false,
      it_assets_assigned: false,
      slack_access_granted: false,
      buddy_introduced: false,
      manager_1on1_done: false,
      pnc_induction_done: false,
      posh_training_completed: false,
    };
    setOrientationForm(chk);
    setOrientationModalOpen(true);
  };

  const handleSaveOrientation = async () => {
    if (!selectedRecord) return;
    try {
      const res = await fetch(`/api/onboarding/${selectedRecord.record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_orientation_checklist',
          checklist: orientationForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Orientation checklist updated for ${selectedRecord.record.candidate_name}`);
        setOrientationModalOpen(false);
        fetchData();
      } else {
        toast.error(json.error || 'Failed to update orientation checklist');
      }
    } catch (e) {
      toast.error('Network error saving checklist');
    }
  };

  // Open Milestone Modal
  const openMilestoneModal = (
    item: FullOnboardingData,
    milestoneKey: 'day_30' | 'day_60' | 'day_90'
  ) => {
    setSelectedRecord(item);
    setActiveMilestoneKey(milestoneKey);
    const existing = item.provisioning?.probation_milestones?.[milestoneKey] || {
      status: 'pending',
      notes: '',
      due_date: '',
      reviewer_name: item.record.manager_name || '',
    };
    setMilestoneForm(existing);
    setMilestoneModalOpen(true);
  };

  const handleSaveMilestone = async () => {
    if (!selectedRecord) return;
    try {
      const res = await fetch(`/api/onboarding/${selectedRecord.record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_probation_milestone',
          milestone_key: activeMilestoneKey,
          milestone_data: milestoneForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Probation milestone updated for ${selectedRecord.record.candidate_name}`);
        setMilestoneModalOpen(false);
        fetchData();
      } else {
        toast.error(json.error || 'Failed to update probation milestone');
      }
    } catch (e) {
      toast.error('Network error saving milestone');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Onboarding Hub</span>
        </Link>
      </div>

      {/* Header Banner */}
      <PageBanner
        title="Employee Onboarding"
        description="Post-joining pipeline: Official email & ID provisioning, IT hardware allocation, Day 1 orientation, training compliance, and 30-60-90 probation milestone tracking."
        icon={<Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold rounded-lg text-xs">
              <Link href="/employees">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Workforce Directory</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Post-Joining */}
        <div className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Post-Joining Total</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalEmployees}</div>
            <p className="text-[11px] text-muted-foreground">Approved candidates in Day 1-90 cycle</p>
          </div>
        </div>

        {/* 2. Needs IT / Email Provisioning */}
        <div className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Account Setup</span>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <Laptop className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{pendingProvisioning}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting @navgurukul.org email or Employee ID</p>
          </div>
        </div>

        {/* 3. In Day-1 & Orientation */}
        <div className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active In Orientation</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{activeOrientation}</div>
            <p className="text-[11px] text-muted-foreground">Induction, buddy intro, or POSH pending</p>
          </div>
        </div>

        {/* 4. Upcoming Probation Reviews */}
        <div className="rounded-xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Probation Check-ins Due</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{upcomingMilestones}</div>
            <p className="text-[11px] text-muted-foreground">30-60-90 Day milestones scheduled</p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="bg-muted/40 p-1 rounded-xl h-auto">
            <TabsTrigger value="all" className="rounded-lg text-xs font-semibold py-1.5 px-3">
              All Post-Joining ({postJoiningRecords.length})
            </TabsTrigger>
            <TabsTrigger value="provisioning" className="rounded-lg text-xs font-semibold py-1.5 px-3">
              Account & IT Setup
            </TabsTrigger>
            <TabsTrigger value="orientation" className="rounded-lg text-xs font-semibold py-1.5 px-3">
              Day 1 & Orientation
            </TabsTrigger>
            <TabsTrigger value="compliance" className="rounded-lg text-xs font-semibold py-1.5 px-3">
              Training & POSH
            </TabsTrigger>
            <TabsTrigger value="milestones" className="rounded-lg text-xs font-semibold py-1.5 px-3">
              30-60-90 Milestones
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employee, email, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-lg"
              />
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="h-9 text-xs rounded-lg w-[140px]">
                <SelectValue placeholder="Team / Dept" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Teams</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="PnC">PnC</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Academia">Academia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab 1: All Post-Joining Table */}
        <TabsContent value="all" className="m-0">
          <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-xs text-muted-foreground">Loading employee onboardings...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No post-joining employee onboarding records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/10 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <TableHead className="w-[260px]">Employee Details</TableHead>
                      <TableHead>Official Credentials</TableHead>
                      <TableHead>Role & Team</TableHead>
                      <TableHead>Orientation Status</TableHead>
                      <TableHead>Probation Checkpoints</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((item) => {
                      const r = item.record;
                      const prov = item.provisioning;
                      const chk = prov?.orientation_checklist;
                      const miles = prov?.probation_milestones;

                      const orientationCount = chk
                        ? [
                            chk.welcome_email_sent,
                            chk.it_assets_assigned,
                            chk.slack_access_granted,
                            chk.buddy_introduced,
                            chk.manager_1on1_done,
                            chk.pnc_induction_done,
                            chk.posh_training_completed,
                          ].filter(Boolean).length
                        : 0;
                      const orientationPct = Math.round((orientationCount / 7) * 100);

                      return (
                        <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-border shrink-0">
                                <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                                  {r.candidate_name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-xs text-foreground truncate">{r.candidate_name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{r.personal_email}</p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {prov?.official_email ? (
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-emerald-600" />
                                  <span>{prov.official_email}</span>
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground">ID: {prov.employee_id_code}</p>
                              </div>
                            ) : (
                              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-[10px]">
                                Provisioning Pending
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="space-y-0.5">
                              <p className="font-medium text-xs text-foreground">{r.designation}</p>
                              <p className="text-[11px] text-muted-foreground">{r.team_name || r.department || 'General'}</p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1.5 w-36">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">{orientationCount}/7 Done</span>
                                <span className="font-bold text-foreground">{orientationPct}%</span>
                              </div>
                              <Progress value={orientationPct} className="h-1.5" />
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 ${
                                  miles?.day_30?.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : miles?.day_30?.status === 'scheduled'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                30d
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 ${
                                  miles?.day_60?.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : miles?.day_60?.status === 'scheduled'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                60d
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1.5 py-0 ${
                                  miles?.day_90?.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : miles?.day_90?.status === 'scheduled'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                90d
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProvisionModal(item)}
                                className="h-7 text-xs font-semibold rounded-lg px-2.5 gap-1"
                              >
                                <Laptop className="h-3 w-3" />
                                <span>Setup</span>
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                                    <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuItem onClick={() => openProvisionModal(item)} className="text-xs cursor-pointer gap-2">
                                    <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Edit IT & Email Account</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => openOrientationModal(item)} className="text-xs cursor-pointer gap-2">
                                    <HeartHandshake className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Orientation Checklist</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => openMilestoneModal(item, 'day_30')} className="text-xs cursor-pointer gap-2">
                                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>30-Day Check-in</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => openMilestoneModal(item, 'day_60')} className="text-xs cursor-pointer gap-2">
                                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>60-Day Review</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => openMilestoneModal(item, 'day_90')} className="text-xs cursor-pointer gap-2">
                                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>90-Day Confirmation</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem asChild className="text-xs cursor-pointer">
                                    <Link href={`/onboarding/review/${item.record.invitation_token || item.record.id}`}>
                                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                      <span>View Complete Dossier</span>
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Account & IT Provisioning */}
        <TabsContent value="provisioning" className="m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRecords.map((item) => {
              const r = item.record;
              const prov = item.provisioning;
              const chk = prov?.orientation_checklist;

              return (
                <Card key={r.id} className="rounded-xl border border-border/80 shadow-xs flex flex-col justify-between">
                  <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-foreground">{r.candidate_name}</CardTitle>
                      {prov?.official_email ? (
                        <Badge className="bg-emerald-600 text-white text-[10px]">Active Account</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-[10px]">
                          Setup Required
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{r.designation} • {r.team_name || 'General'}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs flex-1">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium text-[11px]">Official Email:</span>
                      <p className="font-semibold text-foreground">{prov?.official_email || 'Not configured yet'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium text-[11px]">Employee ID Code:</span>
                      <p className="font-mono font-bold text-foreground">{prov?.employee_id_code || 'Pending'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium text-[11px]">Hardware / Laptop Asset:</span>
                      <p className="text-muted-foreground">{chk?.it_assets_notes || 'No laptop/asset recorded'}</p>
                    </div>
                  </CardContent>
                  <div className="p-3 border-t border-border/60 bg-muted/10 flex items-center justify-end">
                    <Button size="sm" onClick={() => openProvisionModal(item)} className="h-7 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                      <Edit className="h-3 w-3" />
                      <span>Configure IT & Email</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Day-1 & Orientation Checklist */}
        <TabsContent value="orientation" className="m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedRecords.map((item) => {
              const r = item.record;
              const chk = item.provisioning?.orientation_checklist;

              return (
                <Card key={r.id} className="rounded-xl border border-border/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">{r.candidate_name}</CardTitle>
                        <CardDescription className="text-xs">{r.designation} (Buddy: {r.buddy_name || 'Unassigned'})</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openOrientationModal(item)} className="h-7 text-xs rounded-lg font-semibold">
                        Edit Checklist
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span>Welcome Email Dispatched</span>
                      {chk?.welcome_email_sent ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span>IT Laptop & Hardware Handed Over</span>
                      {chk?.it_assets_assigned ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span>Slack & Google Workspace Access</span>
                      {chk?.slack_access_granted ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span>Buddy Introduction Call Completed</span>
                      {chk?.buddy_introduced ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span>Manager 1-on-1 Kickoff</span>
                      {chk?.manager_1on1_done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>P&C Cultural Induction Session</span>
                      {chk?.pnc_induction_done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 4: Compliance & Training */}
        <TabsContent value="compliance" className="m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedRecords.map((item) => {
              const r = item.record;
              const chk = item.provisioning?.orientation_checklist;

              return (
                <Card key={r.id} className="rounded-xl border border-border/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">{r.candidate_name}</CardTitle>
                      <Badge className={chk?.posh_training_completed ? 'bg-emerald-600' : 'bg-amber-600'}>
                        {chk?.posh_training_completed ? 'Compliant' : 'Training Pending'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{r.designation}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">Mandatory POSH Training</p>
                        <p className="text-[11px] text-muted-foreground">Prevention of Sexual Harassment awareness session</p>
                      </div>
                      {chk?.posh_training_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => openOrientationModal(item)} className="h-7 text-xs">
                          Mark Done
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">Org IT Security & Code of Conduct</p>
                        <p className="text-[11px] text-muted-foreground">Security protocols & device usage guidelines</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 5: 30-60-90 Milestones */}
        <TabsContent value="milestones" className="m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRecords.map((item) => {
              const r = item.record;
              const miles = item.provisioning?.probation_milestones;

              return (
                <Card key={r.id} className="rounded-xl border border-border/80 shadow-xs">
                  <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
                    <CardTitle className="text-sm font-bold">{r.candidate_name}</CardTitle>
                    <CardDescription className="text-xs">
                      Joining Date: {r.joining_date} • Manager: {r.manager_name || 'P&C'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    {/* 30 Day */}
                    <div className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">30-Day Check-in</p>
                        <p className="text-[10px] text-muted-foreground">Status: {miles?.day_30?.status || 'pending'}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openMilestoneModal(item, 'day_30')} className="h-7 text-xs">
                        Update
                      </Button>
                    </div>

                    {/* 60 Day */}
                    <div className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">60-Day Mid-Probation</p>
                        <p className="text-[10px] text-muted-foreground">Status: {miles?.day_60?.status || 'pending'}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openMilestoneModal(item, 'day_60')} className="h-7 text-xs">
                        Update
                      </Button>
                    </div>

                    {/* 90 Day */}
                    <div className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">90-Day Confirmation</p>
                        <p className="text-[10px] text-muted-foreground">Status: {miles?.day_90?.status || 'pending'}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openMilestoneModal(item, 'day_90')} className="h-7 text-xs">
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: Account & IT Provisioning */}
      <Dialog open={provisionModalOpen} onOpenChange={setProvisionModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Laptop className="h-4 w-4 text-emerald-600" />
              <span>Provision Employee Account & IT Assets</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure official Google Workspace credentials and hardware assignment for {selectedRecord?.record.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Official NavGurukul Email</Label>
              <Input
                value={provisionForm.official_email}
                onChange={(e) => setProvisionForm({ ...provisionForm, official_email: e.target.value })}
                className="h-9 text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Permanent Employee ID Code</Label>
              <Input
                value={provisionForm.employee_id_code}
                onChange={(e) => setProvisionForm({ ...provisionForm, employee_id_code: e.target.value })}
                className="h-9 text-xs rounded-lg font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">IT Assets / Laptop Details</Label>
              <Textarea
                rows={2}
                placeholder="e.g., MacBook Air M2 (Serial: C02G... Asset ID: NG-LAP-2026-088)"
                value={provisionForm.it_assets_notes}
                onChange={(e) => setProvisionForm({ ...provisionForm, it_assets_notes: e.target.value })}
                className="text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setProvisionModalOpen(false)} className="rounded-lg text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveProvisioning} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
              Save Provisioning Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Orientation Checklist */}
      <Dialog open={orientationModalOpen} onOpenChange={setOrientationModalOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-emerald-600" />
              <span>Update Orientation Checklist</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Track onboarding milestones for {selectedRecord?.record.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>Welcome Kit & Email Dispatched</span>
              <Switch
                checked={orientationForm.welcome_email_sent}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, welcome_email_sent: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>IT Assets / Laptop Assigned</span>
              <Switch
                checked={orientationForm.it_assets_assigned}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, it_assets_assigned: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>Slack & Internal Systems Access</span>
              <Switch
                checked={orientationForm.slack_access_granted}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, slack_access_granted: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>Buddy Introduction Completed</span>
              <Switch
                checked={orientationForm.buddy_introduced}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, buddy_introduced: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>Manager 1-on-1 Alignment Meeting</span>
              <Switch
                checked={orientationForm.manager_1on1_done}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, manager_1on1_done: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>P&C Cultural Induction Session</span>
              <Switch
                checked={orientationForm.pnc_induction_done}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, pnc_induction_done: c })}
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
              <span>Mandatory POSH Training Completed</span>
              <Switch
                checked={orientationForm.posh_training_completed}
                onCheckedChange={(c) => setOrientationForm({ ...orientationForm, posh_training_completed: c })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOrientationModalOpen(false)} className="rounded-lg text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveOrientation} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
              Save Checklist Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Probation Milestone Update */}
      <Dialog open={milestoneModalOpen} onOpenChange={setMilestoneModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>Update Probation Milestone ({activeMilestoneKey.replace('_', ' ').toUpperCase()})</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record review progress and notes for {selectedRecord?.record.candidate_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Milestone Status</Label>
              <Select
                value={milestoneForm.status}
                onValueChange={(val: any) => setMilestoneForm({ ...milestoneForm, status: val })}
              >
                <SelectTrigger className="h-9 text-xs rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed / Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reviewer Name</Label>
              <Input
                placeholder="Manager or P&C Reviewer"
                value={milestoneForm.reviewer_name || ''}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, reviewer_name: e.target.value })}
                className="h-9 text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Feedback & Review Notes</Label>
              <Textarea
                rows={3}
                placeholder="Add milestone feedback, goals achieved, and performance notes..."
                value={milestoneForm.notes || ''}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, notes: e.target.value })}
                className="text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setMilestoneModalOpen(false)} className="rounded-lg text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveMilestone} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
              Save Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EmployeeOnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Employee Onboarding...</div>}>
      <EmployeeOnboardingContent />
    </Suspense>
  );
}
