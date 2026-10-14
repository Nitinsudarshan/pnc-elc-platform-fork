"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CURRENT_VERSION,
  VERSION_HISTORY,
  type VersionEntry,
  type VersionChangeCategory,
} from "@/lib/version-config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Tag,
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

export function SidebarVersionFooter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories: (VersionChangeCategory | "All")[] = [
    "All",
    "Features",
    "Improvements",
    "Fixes",
    "Security",
  ];

  return (
    <>
      <div className="w-full shrink-0 border-t border-sidebar-border/60 bg-sidebar/50 px-3 py-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          {/* Version Indicator */}
          <div className="flex items-center gap-1.5 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="font-semibold text-foreground/80">v{CURRENT_VERSION}</span>
          </div>

          {/* Changelog Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-[11px] font-sans font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded hover:bg-muted/40 cursor-pointer"
            title="View Release Notes & Changelog"
          >
            <History className="h-3 w-3" />
            <span>Changelog</span>
          </button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[90vh] max-h-[90vh] rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-5 pb-3 border-b bg-muted/20 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    Release Notes & Version History
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Changelog for the Navgurukul PnC ELC Platform.
                  </DialogDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                v{CURRENT_VERSION} (Current)
              </Badge>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 pt-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </DialogHeader>

          {/* Timeline Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {VERSION_HISTORY.map((entry: VersionEntry) => {
              const filteredChanges =
                selectedCategory === "All"
                  ? entry.changes
                  : entry.changes.filter((c) => c.category === selectedCategory);

              if (filteredChanges.length === 0 && selectedCategory !== "All") {
                return null;
              }

              return (
                <div key={entry.version} className="relative pl-6 border-l-2 border-border/80 space-y-2.5">
                  <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-background border-2 border-indigo-500 flex items-center justify-center">
                    <span className="size-1.5 rounded-full bg-indigo-500" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                      v{entry.version}
                    </span>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold rounded px-1.5 py-0 ${TYPE_BADGE_STYLE[entry.type]}`}>
                      {entry.type}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">
                      {entry.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </span>
                  </div>

                  <ul className="space-y-1.5 pt-1">
                    {filteredChanges.map((change, idx) => {
                      const CatMeta = CATEGORY_STYLE[change.category] || CATEGORY_STYLE.Features;
                      const Icon = CatMeta.icon;
                      return (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <Badge variant="outline" className={`text-[9px] py-0 px-1 rounded uppercase font-semibold shrink-0 mt-0.5 ${CatMeta.badge}`}>
                            <Icon className="h-2.5 w-2.5 mr-0.5" />
                            {change.category}
                          </Badge>
                          <span className="text-foreground/90">{change.description}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-muted/20 border-t flex items-center justify-between text-xs text-muted-foreground px-5">
            <span>Semantic Versioning: Major.Minor.Patch</span>
            <Link
              href="/changelog"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Full Changelog Page</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
