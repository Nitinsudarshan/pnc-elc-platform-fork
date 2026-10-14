'use client';

import React, { useState } from 'react';
import {
  LetterSection,
  SectionType,
  OpeningSection,
  DetailsSection,
  RoleResponsibilitiesSection,
  TermsSection,
  AcceptanceSection,
  CustomRichTextSection,
} from '@/lib/letter-templates/block-types';
import {
  OpeningSectionEditor,
  DetailsSectionEditor,
  RoleResponsibilitiesSectionEditor,
  TermsSectionEditor,
  AcceptanceSectionEditor,
  CustomRichTextSectionEditor,
} from './section-editors';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  TableProperties,
  ListTodo,
  ShieldCheck,
  PenTool,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionCardProps {
  section: LetterSection;
  index: number;
  totalSections: number;
  isActive: boolean;
  onSelect: () => void;
  onChange: (updated: LetterSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  opening: FileText,
  details: TableProperties,
  role_responsibilities: ListTodo,
  terms: ShieldCheck,
  acceptance: PenTool,
  custom_rich_text: FileText,
};

export function SectionCard({
  section,
  index,
  totalSections,
  isActive,
  onSelect,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const SectionIcon = SECTION_ICONS[section.type] || FileText;

  const renderContent = () => {
    switch (section.type) {
      case 'opening':
        return (
          <OpeningSectionEditor
            section={section as OpeningSection}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'details':
        return (
          <DetailsSectionEditor
            section={section as DetailsSection}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'role_responsibilities':
        return (
          <RoleResponsibilitiesSectionEditor
            section={section as RoleResponsibilitiesSection}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'terms':
        return (
          <TermsSectionEditor
            section={section as TermsSection}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'acceptance':
        return (
          <AcceptanceSectionEditor
            section={section as AcceptanceSection}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'custom_rich_text':
        return (
          <CustomRichTextSectionEditor
            section={section as CustomRichTextSection}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`group relative rounded-2xl border transition-all duration-200 bg-card shadow-xs overflow-hidden ${
        isActive
          ? 'border-indigo-500/80 ring-2 ring-indigo-500/15 shadow-md'
          : 'border-border/70 hover:border-border hover:shadow-xs'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded"
            title="Drag to reorder section"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Section Number & Icon Badge */}
          <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold text-xs shrink-0">
            {index + 1}
          </div>

          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <SectionIcon className="h-4 w-4" />
          </div>

          {/* Section Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={section.title}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
              className="text-sm font-bold px-1.5 py-0.5 border rounded-md bg-background"
            />
          ) : (
            <h3
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="text-sm font-bold text-foreground truncate cursor-pointer hover:underline"
              title="Click to rename section"
            >
              {section.title || `Section ${index + 1}`}
            </h3>
          )}
        </div>

        {/* Section Controls (Section 7) */}
        <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
          {/* Collapse/Expand Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move Section Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === totalSections - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move Section Down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Duplicate Section"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Delete Section"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Section Body */}
      {!isCollapsed && <div className="p-4 sm:p-5">{renderContent()}</div>}
    </section>
  );
}

// -------------------------------------------------------------
// ADD SECTION BUTTON (At the bottom of sections - Section 8)
// -------------------------------------------------------------
interface AddSectionBarProps {
  onAddSection: (type: SectionType) => void;
}

export function AddSectionBar({ onAddSection }: AddSectionBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sectionOptions: {
    type: SectionType;
    label: string;
    description: string;
    icon: React.ElementType;
  }[] = [
    {
      type: 'opening',
      label: 'Opening',
      description: 'Salutation & opening paragraph',
      icon: FileText,
    },
    {
      type: 'details',
      label: 'Engagement Details',
      description: 'Structured role & offer terms',
      icon: TableProperties,
    },
    {
      type: 'role_responsibilities',
      label: 'Role & Responsibilities',
      description: 'Role overview & bullet list',
      icon: ListTodo,
    },
    {
      type: 'terms',
      label: 'Terms of Engagement',
      description: 'Clauses, policies, & handbook',
      icon: ShieldCheck,
    },
    {
      type: 'acceptance',
      label: 'Acceptance',
      description: 'Acceptance & signature block',
      icon: PenTool,
    },
    {
      type: 'custom_rich_text',
      label: 'Custom Rich Text',
      description: 'Custom paragraph section',
      icon: FileText,
    },
  ];

  return (
    <div className="pt-2 pb-6 flex flex-col items-center">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-dashed border-border/80 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:scale-[1.02]"
        >
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">+</span>
          <span>Add Section</span>
        </button>
      ) : (
        <div className="w-full max-w-lg p-3 rounded-2xl bg-card border border-indigo-300 dark:border-indigo-800 shadow-md space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60 px-1">
            <span className="text-xs font-bold text-foreground">Select Section Type</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sectionOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    onAddSection(opt.type);
                    setIsOpen(false);
                  }}
                  className="flex items-start gap-2 p-2 rounded-xl border border-border/60 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left transition-all"
                >
                  <div className="h-6 w-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {opt.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
