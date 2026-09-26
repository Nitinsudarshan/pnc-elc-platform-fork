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
import { PageBanner } from '@/components/shared/page_banner';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DATA_MANAGEMENT_CATEGORIES = [
  {
    title: 'Organization & Master Data',
    links: [
      {
        href: '/data-management/departments',
        label: 'Departments',
        description: 'Configure teams, assign HODs, and manage department divisions.',
        icon: Building2,
        badge: 'P&C Admin',
      },
      {
        href: '/data-management/locations',
        label: 'Locations',
        description: 'Manage campuses, bootcamps, and day centers.',
        icon: MapPin,
        badge: 'Operations',
      },
      {
        href: '/data-management/employment-types',
        label: 'Employment Types',
        description: 'Maintain engagement models (FTE, FTC, Interns, Contractors).',
        icon: Briefcase,
        badge: 'P&C Admin',
      },
    ],
  },
  {
    title: 'Employee Data & Lifecycle',
    links: [
      {
        href: '/data-management/import',
        label: 'Import Employee Data',
        description: 'Upload CSV or XLSX files and configure schema mappings.',
        icon: FileUp,
        badge: 'Super Admin',
      },
      {
        href: '/data-management/import-history',
        label: 'Import History',
        description: 'Review details and statistics of previous system imports.',
        icon: History,
        badge: 'Internal Users',
      },
      {
        href: '/data-management/record-history',
        label: 'Record History',
        description: 'Track granular field-level updates and timeline changes for individuals.',
        icon: UserRoundCog,
        badge: 'Super Admin',
      },
    ],
  },
  {
    title: 'Audits and Rollbacks',
    links: [
      {
        href: '/data-management/audit-logs?table=onboarding_records',
        label: 'Onboarding Audit Logs',
        description: 'Track candidate submissions, documents, and account provisioning.',
        icon: UserPlus,
        badge: 'P&C Admin',
      },
      {
        href: '/data-management/audit-logs',
        label: 'System Audit Logs',
        description: 'Full append-only change logs and activity audits across all profiles.',
        icon: FileSpreadsheet,
        badge: 'Internal Users',
      },
      {
        href: '/data-management/rollback',
        label: 'Rollback Center',
        description: 'Perform safety restores on single accounts or undo entire import batches.',
        icon: RotateCcw,
        badge: 'Super Admin',
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

      <div className="space-y-8">
        {DATA_MANAGEMENT_CATEGORIES.map((category) => (
          <div key={category.title} className="space-y-3.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground border-b border-border/40 pb-2">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="group block">
                    <Card className="h-full rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-muted text-foreground border border-border group-hover:text-primary transition-colors shrink-0 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {link.label}
                            </CardTitle>
                            <Badge variant="secondary" className="rounded-lg text-[10px] font-medium py-0 px-1.5 mt-1">
                              {link.badge}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 mt-1" />
                      </div>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2">
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
