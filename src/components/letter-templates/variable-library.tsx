'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Building2,
  Copy,
  PlusCircle,
  UserMinus,
} from 'lucide-react';
import {
  TEMPLATE_VARIABLES,
  VARIABLE_CATEGORIES,
  TemplateVariable,
  VariableCategory,
} from '@/lib/letter-templates/variables';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VariableLibraryProps {
  onInsertVariable: (variable: TemplateVariable) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const CATEGORY_ICONS: Record<VariableCategory, React.ElementType> = {
  Candidate: User,
  Employment: Briefcase,
  Compensation: CreditCard,
  Letter: FileText,
  Organisation: Building2,
  Exit: UserMinus,
};

export function VariableLibrary({
  onInsertVariable,
  isCollapsed,
  onToggleCollapse,
}: VariableLibraryProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VariableCategory | 'ALL'>('ALL');

  const filteredVariables = useMemo(() => {
    return TEMPLATE_VARIABLES.filter((v) => {
      const matchesSearch =
        search.trim() === '' ||
        v.displayLabel.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase()) ||
        v.key.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' || v.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  const groupedVariables = useMemo(() => {
    const map: Record<VariableCategory, TemplateVariable[]> = {
      Candidate: [],
      Employment: [],
      Compensation: [],
      Letter: [],
      Organisation: [],
      Exit: [],
    };
    filteredVariables.forEach((v) => {
      map[v.category].push(v);
    });
    return map;
  }, [filteredVariables]);

  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-border/70 bg-card/60 flex flex-col items-center py-4 shrink-0 transition-all select-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title="Expand Variable Library"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="mt-8 [writing-mode:vertical-lr] rotate-180 flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-300 rotate-90" />
          <span>Variable Library</span>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 sm:w-84 border-l border-border/70 bg-card/40 flex flex-col h-full shrink-0 select-none transition-all">
      {/* Header */}
      <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Variable Library</h3>
            <p className="text-[10px] text-muted-foreground">Click or drag into blocks</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border/60 bg-background/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variables..."
            className="h-8 pl-8 text-xs rounded-lg bg-card"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors text-[10px] shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({TEMPLATE_VARIABLES.length})
          </button>
          {VARIABLE_CATEGORIES.map((cat) => {
            const count = TEMPLATE_VARIABLES.filter((v) => v.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors text-[10px] shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {VARIABLE_CATEGORIES.map((cat) => {
          const list = groupedVariables[cat];
          if (!list || list.length === 0) return null;
          const CatIcon = CATEGORY_ICONS[cat];

          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <CatIcon className="h-3 w-3 text-indigo-700 dark:text-indigo-300" />
                <span>{cat}</span>
                <span className="text-[10px] font-normal text-muted-foreground/80">
                  ({list.length})
                </span>
              </div>

              <div className="space-y-1">
                {list.map((v) => (
                  <div
                    key={v.key}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', `[${v.displayLabel}]`);
                      e.dataTransfer.setData('application/json', JSON.stringify(v));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => {
                      onInsertVariable(v);
                      toast.success(`Inserted [ ${v.displayLabel} ]`);
                    }}
                    className="group flex items-center justify-between p-2 rounded-lg border border-border/60 bg-card hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-grab active:cursor-grabbing shadow-xs"
                    title={`${v.description} (Drag or click to insert)`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1.5 truncate">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.2 rounded border border-indigo-200 dark:border-indigo-800 text-[11px]">
                          [{v.displayLabel}]
                        </span>
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {v.description}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 shrink-0"
                      title="Insert into active block"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredVariables.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No variables match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-border/60 bg-muted/20 text-[10px] text-muted-foreground text-center">
        Tip: Variables render as chips and populate with real candidate data during letter generation.
      </div>
    </aside>
  );
}
