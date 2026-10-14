'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileUp,
  History,
  FileSpreadsheet,
  UserRoundCog,
  RotateCcw,
  Database,
  ArrowRight,
  UserPlus,
  Building2,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DATA_MANAGEMENT_CATEGORIES = [
  {
    title: 'Organization & Master Data',
    subtitle: 'Core structural taxonomies and departmental hierarchy',
    links: [
      {
        href: '/data-management/departments',
        label: 'Departments',
        description: 'Configure teams, assign HODs, and manage department divisions.',
        icon: Building2,
        badge: 'P&C Admin',
        gradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white border-indigo-500/20',
        badgeStyle: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
        hoverBorder: 'hover:border-indigo-500/40',
        arrowHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
      },
      {
        href: '/data-management/locations',
        label: 'Locations',
        description: 'Manage campuses, bootcamps, and day centers.',
        icon: MapPin,
        badge: 'Operations',
        gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
        iconBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-700 group-hover:text-white border-emerald-500/20',
        badgeStyle: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
        hoverBorder: 'hover:border-emerald-500/40',
        arrowHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
      },
      {
        href: '/data-management/employment-types',
        label: 'Employment Types',
        description: 'Maintain engagement models (FTE, FTC, Interns, Contractors).',
        icon: Briefcase,
        badge: 'P&C Admin',
        gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
        iconBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:bg-amber-700 group-hover:text-white border-amber-500/20',
        badgeStyle: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        hoverBorder: 'hover:border-amber-500/40',
        arrowHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-400',
      },
    ],
  },
  {
    title: 'Employee Data & Lifecycle',
    subtitle: 'Bulk operations, CSV import workflows, and profile revisions',
    links: [
      {
        href: '/data-management/import',
        label: 'Import Employee Data',
        description: 'Upload CSV or XLSX files and configure schema mappings.',
        icon: FileUp,
        badge: 'Super Admin',
        gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
        iconBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 group-hover:bg-sky-700 group-hover:text-white border-sky-500/20',
        badgeStyle: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50',
        hoverBorder: 'hover:border-sky-500/40',
        arrowHover: 'group-hover:text-sky-700 dark:group-hover:text-sky-400',
      },
      {
        href: '/data-management/import-history',
        label: 'Import History',
        description: 'Review details and statistics of previous system imports.',
        icon: History,
        badge: 'Internal Users',
        gradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
        iconBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 group-hover:bg-teal-700 group-hover:text-white border-teal-500/20',
        badgeStyle: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/50',
        hoverBorder: 'hover:border-teal-500/40',
        arrowHover: 'group-hover:text-teal-700 dark:group-hover:text-teal-400',
      },
      {
        href: '/data-management/record-history',
        label: 'Record History',
        description: 'Track granular field-level updates and timeline changes for individuals.',
        icon: UserRoundCog,
        badge: 'Super Admin',
        gradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
        iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white border-violet-500/20',
        badgeStyle: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900/50',
        hoverBorder: 'hover:border-violet-500/40',
        arrowHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
      },
    ],
  },
  {
    title: 'Audits and Rollbacks',
    subtitle: 'System event audits, candidate logs, and batch restorations',
    links: [
      {
        href: '/data-management/audit-logs?table=onboarding_records',
        label: 'Onboarding Audit Logs',
        description: 'Track candidate submissions, documents, and account provisioning.',
        icon: UserPlus,
        badge: 'P&C Admin',
        gradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
        iconBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 group-hover:bg-cyan-700 group-hover:text-white border-cyan-500/20',
        badgeStyle: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/50',
        hoverBorder: 'hover:border-cyan-500/40',
        arrowHover: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-400',
      },
      {
        href: '/data-management/audit-logs',
        label: 'System Audit Logs',
        description: 'Full append-only change logs and activity audits across all profiles.',
        icon: FileSpreadsheet,
        badge: 'Internal Users',
        gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
        iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white border-blue-500/20',
        badgeStyle: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
        hoverBorder: 'hover:border-blue-500/40',
        arrowHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      },
      {
        href: '/data-management/rollback',
        label: 'Rollback Center',
        description: 'Perform safety restores on single accounts or undo entire import batches.',
        icon: RotateCcw,
        badge: 'Super Admin',
        gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
        iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white border-rose-500/20',
        badgeStyle: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
        hoverBorder: 'hover:border-rose-500/40',
        arrowHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
      },
    ],
  },
];

export default function DataManagementPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Page Banner - Single Line Title and Description */}
      <PageBanner
        title="Data Management"
        description="System administration utilities for imports, records lifecycle, audit tracking, and database integrity."
        icon={<Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
      />

      {/* Categories Grid styled similarly to Dashboard */}
      <div className="space-y-8">
        {DATA_MANAGEMENT_CATEGORIES.map((category) => (
          <div key={category.title} className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {category.title}
              </h2>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {category.subtitle}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="group block">
                    <Card
                      className={`h-full rounded-lg border border-border bg-card p-4 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-0.5 group-hover:shadow-md flex flex-col justify-between gap-3 ${link.hoverBorder}`}
                    >
                      {/* Subtle ambient hover gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                      />

                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-lg border shadow-xs transition-all duration-300 shrink-0 flex items-center justify-center ${link.iconBg}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold tracking-tight text-foreground transition-colors">
                              {link.label}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={`rounded-lg text-[10px] font-medium py-0 px-1.5 mt-1 border ${link.badgeStyle}`}
                            >
                              {link.badge}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all shrink-0 mt-1 ${link.arrowHover}`}
                        />
                      </div>

                      <CardDescription className="relative z-10 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {link.description}
                      </CardDescription>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
