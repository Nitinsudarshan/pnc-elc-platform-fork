"use client";

import React, { useState } from "react";
import {
  CURRENT_VERSION,
  VERSION_HISTORY,
  type VersionEntry,
  type VersionChangeCategory,
} from "@/lib/version-config";
import { PageBanner } from "@/components/shared/page-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  History,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";

const TYPE_BADGE_STYLE: Record<string, string> = {
  major: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
  minor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  patch: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

const CATEGORY_STYLE: Record<VersionChangeCategory, { badge: string; icon: React.ElementType }> = {
  Features: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    icon: Sparkles,
  },
  Improvements: {
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    icon: ArrowUpRight,
  },
  Fixes: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    icon: CheckCircle2,
  },
  Security: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    icon: ShieldCheck,
  },
};

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories: (VersionChangeCategory | "All")[] = [
    "All",
    "Features",
    "Improvements",
    "Fixes",
    "Security",
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      <PageBanner
        title="Platform Changelog & Release Notes"
        description="Comprehensive timeline of platform versions, features, improvements, security patches, and workflow upgrades."
        icon={<History className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
      />

      {/* Overview Card & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Current Active Version</span>
              <Badge variant="outline" className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                v{CURRENT_VERSION}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Semantic versioning enforced across all commits and releases.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Release Timeline */}
      <div className="space-y-6">
        {VERSION_HISTORY.map((entry: VersionEntry) => {
          const filteredChanges =
            selectedCategory === "All"
              ? entry.changes
              : entry.changes.filter((c) => c.category === selectedCategory);

          if (filteredChanges.length === 0 && selectedCategory !== "All") {
            return null;
          }

          const isCurrent = entry.version === CURRENT_VERSION;

          return (
            <Card
              key={entry.version}
              className={`rounded-xl border transition-all ${
                isCurrent
                  ? "border-indigo-500/40 bg-card shadow-sm"
                  : "border-border/80 bg-card/60"
              }`}
            >
              <CardHeader className="p-5 pb-3 border-b bg-muted/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
                      v{entry.version}
                    </span>
                    <Badge variant="outline" className={`text-xs uppercase font-bold px-2 py-0.5 rounded-md ${TYPE_BADGE_STYLE[entry.type]}`}>
                      {entry.type}
                    </Badge>
                    <CardTitle className="text-base font-bold text-foreground">
                      {entry.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{entry.date}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-4">
                <ul className="space-y-2.5">
                  {filteredChanges.map((change, idx) => {
                    const CatMeta = CATEGORY_STYLE[change.category] || CATEGORY_STYLE.Features;
                    const Icon = CatMeta.icon;
                    return (
                      <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed">
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0.5 px-1.5 rounded-md uppercase font-semibold shrink-0 mt-0.5 ${CatMeta.badge}`}
                        >
                          <Icon className="h-2.5 w-2.5 mr-1" />
                          {change.category}
                        </Badge>
                        <span className="text-foreground/90 font-normal">{change.description}</span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
