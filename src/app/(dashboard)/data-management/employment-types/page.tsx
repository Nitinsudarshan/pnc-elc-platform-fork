'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Archive,
  RotateCcw,
  MoreVertical,
  ArrowLeft,
  FileBadge,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import {
  EmploymentType,
  EmploymentTypeStatus,
  formatEmploymentTypeName,
} from '@/lib/employment-types/types';

export default function EmploymentTypesManagementPage() {
  const [types, setTypes] = useState<EmploymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employment-types?includeArchived=true');
      const json = await res.json();
      if (json.success && json.data) {
        setTypes(json.data);
      }
    } catch (err) {
      toast.error('Failed to load employment types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // Filtered types
  const filteredTypes = useMemo(() => {
    return types.filter((type) => {
      const displayName = formatEmploymentTypeName(type.name);
      const matchesSearch =
        displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (type.description && type.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const isActive = type.status !== 'archived';
      if (statusFilter === 'active') return isActive;
      if (statusFilter === 'archived') return !isActive;
      return true;
    });
  }, [types, searchQuery, statusFilter]);

  // Paginated list
  const paginatedTypes = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredTypes.slice(start, start + pageSize);
  }, [filteredTypes, pageIndex, pageSize]);

  // Stats
  const totalCount = types.length;
  const activeCount = types.filter((t) => t.status !== 'archived').length;
  const archivedCount = types.filter((t) => t.status === 'archived').length;

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Classification Title is required');
      return;
    }

    try {
      setSubmitting(true);
      const formattedTitle = formatEmploymentTypeName(newName.trim());
      const res = await fetch('/api/employment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formattedTitle,
          description: newDesc.trim() || undefined,
          status: 'active',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Employment type "${formattedTitle}" created successfully`);
        setIsAddOpen(false);
        setNewName('');
        setNewDesc('');
        fetchTypes();
      } else {
        toast.error(json.error || 'Failed to create employment type');
      }
    } catch (err) {
      toast.error('Error creating employment type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeAllActive = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'make_all_active' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('All employment types are now active');
        fetchTypes();
      } else {
        toast.error('Failed to activate all types');
      }
    } catch (err) {
      toast.error('Error making all active');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: EmploymentType) => {
    const isCurrentlyActive = item.status !== 'archived';
    const targetStatus: EmploymentTypeStatus = isCurrentlyActive ? 'archived' : 'active';
    try {
      const res = await fetch('/api/employment-types', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: targetStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          targetStatus === 'active'
            ? `Employment type "${formatEmploymentTypeName(item.name)}" restored to Active`
            : `Employment type "${formatEmploymentTypeName(item.name)}" archived`
        );
        fetchTypes();
      } else {
        toast.error(json.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Error modifying employment type');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Banner */}
      <PageBanner
        title="Employment Types"
        description="Configure workforce engagement classifications, contract models, and employment eligibility."
        icon={<Briefcase className="h-8 w-8 text-amber-700 dark:text-amber-300" />}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/data-management">
              <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-9">
                <ArrowLeft className="h-4 w-4" />
                Data Hub
              </Button>
            </Link>
            {archivedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5 h-9 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                onClick={handleMakeAllActive}
              >
                <Sparkles className="h-4 w-4" />
                Make All Active
              </Button>
            )}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-lg gap-1.5 h-9 shadow-sm bg-amber-700 hover:bg-amber-800 text-white">
                  <Plus className="h-4 w-4" />
                  Add Employment Type
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-lg sm:max-w-[460px]">
                <form onSubmit={handleCreateType}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                      <Briefcase className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                      Add Employment Type
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Define a new contract or employment categorization.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">
                        Classification Title <span className="text-rose-700 dark:text-rose-300">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Full-Time Employee (FTE)"
                        className="rounded-lg text-sm"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="desc" className="text-xs font-semibold">
                        Description & Terms Scope
                      </Label>
                      <Textarea
                        id="desc"
                        placeholder="Details on contract terms, PF applicability, or stipend..."
                        className="rounded-lg text-sm min-h-[70px]"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
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
                    <Button type="submit" className="rounded-lg bg-amber-700 hover:bg-amber-800 text-white" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Add Type'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Metric Cards - 3 Column Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Total Classifications */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Types</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Contractual engagement models</p>
          </div>
        </div>

        {/* 2. Active Engagement Models */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Models</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{activeCount}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Active
              </span>
              <span>available in onboarding dossiers</span>
            </div>
          </div>
        </div>

        {/* 3. Archived */}
        <div className="rounded-lg bg-card border border-border/80 shadow-xs p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Archived</span>
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">{archivedCount}</div>
            <p className="text-xs text-muted-foreground">Deprecated contract types</p>
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
              placeholder="Search by classification title or description..."
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

      {/* Employment Types Data Table */}
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-md shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="py-2.5 px-3 w-[320px] text-xs font-semibold">Classification Title</TableHead>
              <TableHead className="py-2.5 px-3 hidden md:table-cell text-xs font-semibold">Description & Terms</TableHead>
              <TableHead className="py-2.5 px-3 w-[120px] text-xs font-semibold text-center">Status</TableHead>
              <TableHead className="py-2.5 px-3 w-[80px] text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-xs text-muted-foreground">
                  Loading employment types...
                </TableCell>
              </TableRow>
            ) : paginatedTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-xs text-muted-foreground">
                  No employment types found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTypes.map((item) => {
                const formattedTitle = formatEmploymentTypeName(item.name);
                const isActive = item.status !== 'archived';
                return (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    {/* Classification Title */}
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0">
                          <FileBadge className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground text-xs">{formattedTitle}</span>
                      </div>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {item.description || '—'}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-xs text-center">
                      {isActive ? (
                        <Badge variant="secondary" className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-lg text-[10px] bg-muted text-muted-foreground border border-border">
                          <Archive className="h-3 w-3 mr-1" /> Archived
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
                        <DropdownMenuContent align="end" className="rounded-lg text-xs w-44">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            className={`rounded-lg gap-2 cursor-pointer ${
                              isActive ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                            onClick={() => handleToggleStatus(item)}
                          >
                            {isActive ? (
                              <>
                                <Archive className="h-4 w-4" />
                                Archive Type
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4" />
                                Restore Type
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
          totalItems={filteredTypes.length}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          itemLabel="types"
        />
      </div>
    </div>
  );
}
