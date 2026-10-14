'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  History,
  Search,
  UserPlus,
  Users,
  TrendingUp,
  BadgeCheck,
  MessageSquare,
  UserMinus,
  FileText,
  FileCheck2,
  KeyRound,
  SlidersHorizontal,
  DatabaseBackup,
  ArrowRight,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { AUDIT_ACTOR_LABELS, AUDIT_MODULE_LABELS } from '@/lib/audit/types';
import type { AuditEvent, AuditModule, AuditSeverity } from '@/lib/audit/types';
import { TONES, type Tone } from '@/lib/ui/tone';

const MODULE_META: Record<AuditModule, { icon: React.ElementType; tone: Tone }> = {
  onboarding: { icon: UserPlus, tone: 'accent' },
  employee: { icon: Users, tone: 'info' },
  appraisal: { icon: TrendingUp, tone: 'success' },
  confirmation: { icon: BadgeCheck, tone: 'accent' },
  peer_feedback: { icon: MessageSquare, tone: 'info' },
  offboarding: { icon: UserMinus, tone: 'danger' },
  letters: { icon: FileText, tone: 'warning' },
  documents: { icon: FileCheck2, tone: 'info' },
  access: { icon: KeyRound, tone: 'warning' },
  settings: { icon: SlidersHorizontal, tone: 'pending' },
  data_management: { icon: DatabaseBackup, tone: 'pending' },
};

const SEVERITY_TONE: Record<AuditSeverity, Tone> = {
  info: 'neutral',
  notice: 'info',
  warning: 'warning',
  critical: 'danger',
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function toCsv(events: AuditEvent[]): string {
  const headers = [
    'Timestamp',
    'Employee Name',
    'Employee ID',
    'Employee Email',
    'Module',
    'Action',
    'Description',
    'Severity',
    'Actor',
    'Actor Email',
    'Actor Type',
    'Entity Type',
    'Entity ID',
  ];

  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const rows = events.map((e) =>
    [
      e.occurred_at,
      e.employee_name,
      e.employee_id,
      e.employee_email,
      AUDIT_MODULE_LABELS[e.module] || e.module,
      e.action,
      e.description,
      e.severity,
      e.actor_name,
      e.actor_email,
      e.actor_type,
      e.entity_type,
      e.entity_id,
    ]
      .map(escape)
      .join(',')
  );

  return [headers.map(escape).join(','), ...rows].join('\n');
}

export interface AuditTrailProps {
  /** Scope the trail to one person. Pass both keys when known — together they
   *  stitch candidate-stage and post-exit events into one continuous history. */
  employeeId?: string | null;
  employeeEmail?: string | null;
  employeeName?: string | null;
  /** Narrow to a single record (one onboarding case, one offboarding case…). */
  entityId?: string | null;
  title?: string;
  description?: string;
  /** Compact embedded mode: no card chrome, no export, shorter page size. */
  embedded?: boolean;
  defaultPageSize?: number;
  className?: string;
}

export function AuditTrail({
  employeeId,
  employeeEmail,
  employeeName,
  entityId,
  title,
  description,
  embedded = false,
  defaultPageSize = 15,
  className = '',
}: AuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const isScoped = Boolean(employeeId || employeeEmail);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (employeeId) params.set('employee_id', employeeId);
      if (employeeEmail) params.set('employee_email', employeeEmail);
      if (entityId) params.set('entity_id', entityId);
      params.set('limit', '500');

      const res = await fetch(`/api/audit?${params.toString()}`);
      const json = await res.json();
      setEvents(json.success && json.data ? json.data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, employeeEmail, entityId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filtering runs client-side so switching filters never re-hits the network.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (moduleFilter !== 'all' && e.module !== moduleFilter) return false;
      if (actorFilter !== 'all' && e.actor_type !== actorFilter) return false;
      if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
      if (!q) return true;
      return [e.description, e.action, e.employee_name, e.employee_email, e.actor_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [events, search, moduleFilter, actorFilter, severityFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, moduleFilter, actorFilter, severityFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const modulesPresent = useMemo(
    () => Array.from(new Set(events.map((e) => e.module))).sort(),
    [events]
  );

  const handleExport = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${employeeName ? employeeName.replace(/\s+/g, '-').toLowerCase() : 'all'}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const body = (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions, people, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="h-9 text-xs rounded-lg w-[160px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {(modulesPresent.length > 0
                ? modulesPresent
                : (Object.keys(AUDIT_MODULE_LABELS) as AuditModule[])
              ).map((m) => (
                <SelectItem key={m} value={m}>
                  {AUDIT_MODULE_LABELS[m as AuditModule] || m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={actorFilter} onValueChange={setActorFilter}>
            <SelectTrigger className="h-9 text-xs rounded-lg w-[150px]">
              <SelectValue placeholder="Actor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actors</SelectItem>
              {Object.entries(AUDIT_ACTOR_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-9 text-xs rounded-lg w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="notice">Notice</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            className="h-9 rounded-lg text-xs gap-1.5 font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {!embedded && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="h-9 rounded-lg text-xs gap-1.5 font-medium"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">Loading audit trail...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl">
          <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">
            {events.length === 0 ? 'No audit events recorded yet' : 'No events match these filters'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {events.length === 0
              ? isScoped
                ? 'Actions taken on this person across onboarding, appraisals, confirmation and offboarding will appear here.'
                : 'Every employee-affecting action across the platform is recorded here as it happens.'
              : 'Try widening the module, actor or severity filter.'}
          </p>
        </div>
      ) : (
        <>
          <ol className="relative border-l border-border/80 ml-3 space-y-0">
            {paginated.map((event) => {
              const meta = MODULE_META[event.module] || { icon: History, tone: 'neutral' as Tone };
              const Icon = meta.icon;
              const severityTone = SEVERITY_TONE[event.severity];

              return (
                <li key={event.id} className="relative pl-7 pb-5 last:pb-0">
                  {/* Timeline node */}
                  <span
                    className={`absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
                      TONES[meta.tone].chip
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                  </span>

                  <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-1.5 py-0 ${TONES[meta.tone].soft}`}
                          >
                            {AUDIT_MODULE_LABELS[event.module] || event.module}
                          </Badge>

                          {event.severity !== 'info' && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase font-semibold px-1.5 py-0 ${TONES[severityTone].soft}`}
                            >
                              {event.severity}
                            </Badge>
                          )}

                          <code className="text-[10px] text-muted-foreground font-mono">{event.action}</code>
                        </div>

                        <p className="text-xs font-medium text-foreground leading-relaxed">
                          {event.description}
                        </p>

                        {/* Subject line, shown only in the global (unscoped) view */}
                        {!isScoped && (event.employee_name || event.employee_email) && (
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground/80">
                              {event.employee_name || 'Unnamed'}
                            </span>
                            {event.employee_email && <span> · {event.employee_email}</span>}
                            {event.employee_id && (
                              <span className="font-mono"> · {event.employee_id}</span>
                            )}
                          </p>
                        )}

                        {/* Field-level diffs */}
                        {event.changes && event.changes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {event.changes.map((c, i) => (
                              <span
                                key={`${c.field}-${i}`}
                                className="inline-flex items-center gap-1.5 text-[10px] rounded-md border border-border/80 bg-muted/40 px-1.5 py-0.5"
                              >
                                <span className="text-muted-foreground font-medium">
                                  {c.label || c.field}
                                </span>
                                <span className="font-mono text-muted-foreground line-through">
                                  {formatValue(c.from)}
                                </span>
                                <ArrowRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                <span className="font-mono font-semibold text-foreground">
                                  {formatValue(c.to)}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <p className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(event.occurred_at)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {event.actor_name || AUDIT_ACTOR_LABELS[event.actor_type]}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {filtered.length > pageSize && (
            <DataTablePagination
              pageIndex={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              itemLabel="events"
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );

  if (embedded) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Card className={`rounded-xl border border-border/80 bg-card shadow-xs ${className}`}>
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border border-indigo-500/20 ${TONES.accent.chip}`}>
              <History className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{title || 'Audit Trail'}</CardTitle>
              <CardDescription className="text-xs">
                {description ||
                  (isScoped
                    ? `Every recorded action for ${employeeName || 'this employee'} across all lifecycle modules.`
                    : 'Every employee-affecting action across onboarding, appraisals, confirmation, feedback and offboarding.')}
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="text-xs font-mono px-2.5 py-1 rounded-lg">
            {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">{body}</CardContent>
    </Card>
  );
}

export default AuditTrail;
