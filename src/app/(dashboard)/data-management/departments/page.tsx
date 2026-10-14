'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Search,
  Users,
  Archive,
  RotateCcw,
  UserCheck,
  MoreVertical,
  Shield,
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Department } from '@/lib/departments/types';

export default function DepartmentsManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditHodOpen, setIsEditHodOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Form states
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptHodName, setNewDeptHodName] = useState('');

  const [hodInput, setHodInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departments?includeArchived=true');
      const json = await res.json();
      if (json.success && json.data) {
        setDepartments(json.data);
      }
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filtered list
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (dept.head_of_department_name &&
          dept.head_of_department_name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'active') return !dept.is_archived;
      if (statusFilter === 'archived') return dept.is_archived;
      return true;
    });
  }, [departments, searchQuery, statusFilter]);

  // Paginated records
  const paginatedDepartments = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredDepartments.slice(start, start + pageSize);
  }, [filteredDepartments, pageIndex, pageSize]);

  // Stats calculation
  const totalCount = departments.length;
  const activeCount = departments.filter((d) => !d.is_archived).length;
  const archivedCount = departments.filter((d) => d.is_archived).length;
  const totalHeadcount = departments.reduce((acc, d) => acc + (d.employee_count || 0), 0);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          description: newDeptDesc.trim() || undefined,
          head_of_department_name: newDeptHodName.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Department "${newDeptName.trim()}" created successfully`);
        setIsAddOpen(false);
        setNewDeptName('');
        setNewDeptDesc('');
        setNewDeptHodName('');
        fetchDepartments();
      } else {
        toast.error(json.error || 'Failed to create department');
      }
    } catch (err) {
      toast.error('Error creating department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async (dept: Department) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dept.id,
          action: 'toggle_archive',
          is_archived: !dept.is_archived,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          dept.is_archived
            ? `Department "${dept.name}" restored to Active`
            : `Department "${dept.name}" archived`
        );
        fetchDepartments();
      } else {
        toast.error(json.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Error modifying department');
    }
  };

  const handleSaveHod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDept.id,
          head_of_department_name: hodInput.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Updated Head of Department for ${selectedDept.name}`);
        setIsEditHodOpen(false);
        setSelectedDept(null);
        setHodInput('');
        fetchDepartments();
      } else {
        toast.error(json.error || 'Failed to update HOD');
      }
    } catch (err) {
      toast.error('Error updating HOD');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Banner */}
      <PageBanner
        title="Departments Management"
        description="Configure organizational departments, assign department heads, monitor headcount distribution, and archive inactive divisions."
        icon={<Building2 className="h-8 w-8 text-indigo-700 dark:text-indigo-300" />}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/data-management">
              <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-9">
                <ArrowLeft className="h-4 w-4" />
                Data Hub
              </Button>
            </Link>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-lg gap-1.5 h-9 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-lg sm:max-w-[480px]">
                <form onSubmit={handleCreateDepartment}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                      <Building2 className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                      Create New Department
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Define a new organizational team or operational department.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">
                        Department Name <span className="text-rose-700 dark:text-rose-300">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. AI LAB, Growth, SOSC..."
                        className="rounded-lg text-sm"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="desc" className="text-xs font-semibold">
                        Description & Scope
                      </Label>
                      <Textarea
                        id="desc"
                        placeholder="Key responsibilities and organizational role..."
                        className="rounded-lg text-sm min-h-[70px]"
                        value={newDeptDesc}
                        onChange={(e) => setNewDeptDesc(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="hod" className="text-xs font-semibold">
                        Head of Department (HOD) <span className="text-muted-foreground font-normal">(Leave empty if unassigned)</span>
                      </Label>
                      <Input
                        id="hod"
                        placeholder="Unassigned (empty)"
                        className="rounded-lg text-sm"
                        value={newDeptHodName}
                        onChange={(e) => setNewDeptHodName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => setIsAddOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Department'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Metric Cards - 4 Column Top Grid (Matching Users Stats Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Total Departments */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Departments</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Organizational functional units</p>
          </div>
        </div>

        {/* 2. Active Divisions */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Divisions</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{activeCount}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Operating
              </span>
              <span>active in role mapping</span>
            </div>
          </div>
        </div>

        {/* 3. Archived */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Archived</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{archivedCount}</div>
            <p className="text-xs text-muted-foreground">Decommissioned departments</p>
          </div>
        </div>

        {/* 4. Estimated Staff */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Estimated Headcount</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalHeadcount}</div>
            <p className="text-xs text-muted-foreground">Staff across all departments</p>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-card/60 backdrop-blur-md p-2.5 rounded-lg border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search departments, head of department, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageIndex(1);
              }}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val: 'all' | 'active' | 'archived') => {
              setStatusFilter(val);
              setPageIndex(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs rounded-lg bg-card">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-lg text-xs">
              <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
              <SelectItem value="active" className="rounded-lg">Active Only</SelectItem>
              <SelectItem value="archived" className="rounded-lg">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Departments Data Table */}
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-md shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="py-2.5 px-3 w-[240px] text-xs font-semibold">Department</TableHead>
              <TableHead className="py-2.5 px-3 w-[200px] text-xs font-semibold">Head of Department (HOD)</TableHead>
              <TableHead className="py-2.5 px-3 hidden md:table-cell text-xs font-semibold">Description</TableHead>
              <TableHead className="py-2.5 px-3 w-[100px] text-xs font-semibold text-center">Headcount</TableHead>
              <TableHead className="py-2.5 px-3 w-[110px] text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="py-2.5 px-3 w-[80px] text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-xs text-muted-foreground">
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : paginatedDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-xs text-muted-foreground">
                    No departments found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDepartments.map((dept) => {
                  const initials = dept.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <TableRow key={dept.id} className="hover:bg-muted/40 transition-colors">
                      {/* Department Name */}
                      <TableCell className="font-medium text-xs">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                            <AvatarFallback className="rounded-lg bg-transparent">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground text-xs">{dept.name}</span>
                        </div>
                      </TableCell>

                      {/* Head of Department */}
                      <TableCell className="text-xs">
                        {dept.head_of_department_name ? (
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                            <span>{dept.head_of_department_name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-muted-foreground px-2 py-0.5 rounded-lg bg-muted/60 border border-dashed border-border inline-block">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                        {dept.description || '—'}
                      </TableCell>

                      {/* Headcount */}
                      <TableCell className="text-xs text-center font-medium">
                        <Badge variant="outline" className="rounded-lg text-[11px] font-semibold">
                          {dept.employee_count || 0}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-xs text-center">
                        {dept.is_archived ? (
                          <Badge variant="secondary" className="rounded-lg text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Archived
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            Active
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-lg text-xs w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="rounded-lg gap-2 cursor-pointer"
                              onClick={() => {
                                setSelectedDept(dept);
                                setHodInput(dept.head_of_department_name || '');
                                setIsEditHodOpen(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
                              Assign / Edit HOD
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={`rounded-lg gap-2 cursor-pointer ${
                                dept.is_archived ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                              onClick={() => handleToggleArchive(dept)}
                            >
                              {dept.is_archived ? (
                                <>
                                  <RotateCcw className="h-4 w-4" />
                                  Restore Department
                                </>
                              ) : (
                                <>
                                  <Archive className="h-4 w-4" />
                                  Archive Department
                                </>
                              )}
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

          {/* Universal Pagination */}
          <DataTablePagination
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalItems={filteredDepartments.length}
            pageSizeOptions={[10, 25, 50, 100]}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            itemLabel="departments"
          />
        </div>

      {/* Edit HOD Dialog */}
      <Dialog open={isEditHodOpen} onOpenChange={setIsEditHodOpen}>
        <DialogContent className="rounded-lg sm:max-w-[440px]">
          <form onSubmit={handleSaveHod}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <UserCheck className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
                Assign Head of Department
              </DialogTitle>
              <DialogDescription className="text-xs">
                Set or update the designated leader for <strong>{selectedDept?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="hodName" className="text-xs font-semibold">
                Head of Department Name
              </Label>
              <Input
                id="hodName"
                placeholder="e.g. Sharmistha Mazumdar, Nitin Sudarshan..."
                className="rounded-lg text-sm"
                value={hodInput}
                onChange={(e) => setHodInput(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to keep this department unassigned.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => setIsEditHodOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
