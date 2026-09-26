'use client';

import React from 'react';
import Link from 'next/link';
import {
  Settings,
  FileText,
  FileCheck2,
  PenTool,
  Mail,
  SlidersHorizontal,
  Users,
  DatabaseBackup,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page_banner';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MANAGE_SECTIONS = [
  {
    category: 'Document Governance & Legal',
    items: [
      {
        title: 'Letter Templates',
        description: 'Design and customize dynamic contract clauses, offer letter formats, and policy addendums.',
        href: '/manage/letter-templates',
        icon: FileText,
        badge: 'Legal & P&C',
      },
      {
        title: 'Generated Letters',
        description: 'Track candidate-specific letter issuances, signoff workflows, and generated PDF archives.',
        href: '/manage/letters',
        icon: FileCheck2,
        badge: 'Contracts',
      },
      {
        title: 'Authorized Signatories',
        description: 'Manage legal signatories, role credentials, signatures, and organizational official stamps.',
        href: '/manage/signatories',
        icon: PenTool,
        badge: 'Institutional',
      },
    ],
  },
  {
    category: 'Communications & Automation',
    items: [
      {
        title: 'Emails & Delivery Quota',
        description: 'Monitor daily provider quotas, dispatch volume charts, cadence rules, and trigger templates.',
        href: '/manage/emails',
        icon: Mail,
        badge: 'Delivery Hub',
      },
      {
        title: 'Platform Settings',
        description: 'Configure probation rules, appraisal cycles, peer feedback thresholds, and system notifications.',
        href: '/manage/settings',
        icon: SlidersHorizontal,
        badge: 'System Rules',
      },
    ],
  },
  {
    category: 'Administration & System Integrity',
    items: [
      {
        title: 'User Access Control',
        description: 'Configure administrative privileges, role-based access control, and team management.',
        href: '/manage/users',
        icon: Users,
        badge: 'Security',
      },
      {
        title: 'Data Management',
        description: 'Execute bulk employee imports, inspect change logs, audit records, and manage rollbacks.',
        href: '/data-management',
        icon: DatabaseBackup,
        badge: 'Database',
      },
    ],
  },
];

export default function ManageHubPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Banner - Single Line Title and Description */}
      <PageBanner
        title="Management Hub"
        description="Administrative center for document governance, communication templates, access, and settings."
        icon={<Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
      />

      {/* Sections Grid */}
      <div className="space-y-8">
        {MANAGE_SECTIONS.map((section) => (
          <div key={section.category} className="space-y-3.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground border-b border-border/40 pb-2">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group block">
                    <Card className="h-full rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-sm flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-muted text-foreground border border-border group-hover:text-primary transition-colors shrink-0 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </CardTitle>
                            <Badge variant="secondary" className="rounded-lg text-[10px] font-medium py-0 px-1.5 mt-1">
                              {item.badge}
                            </Badge>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 mt-1" />
                      </div>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
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
