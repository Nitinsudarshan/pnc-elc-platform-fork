'use client';

import React, { useRef } from 'react';
import {
  LetterSection,
  OpeningSection,
  DetailsSection,
  DetailField,
  RoleResponsibilitiesSection,
  TermsSection,
  ClauseItem,
  AcceptanceSection,
  CustomRichTextSection,
} from '@/lib/letter-templates/block-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface SectionEditorProps<T extends LetterSection> {
  section: T;
  onChange: (updated: T) => void;
  onFocus?: () => void;
}

// -------------------------------------------------------------
// 1. OPENING SECTION EDITOR
// -------------------------------------------------------------
export function OpeningSectionEditor({
  section,
  onChange,
  onFocus,
}: SectionEditorProps<OpeningSection>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...section, content: `${section.content} ${varText}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      section.content.substring(0, start) + varText + section.content.substring(end);
    onChange({ ...section, content: next });
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <Textarea
        ref={textareaRef}
        rows={5}
        value={section.content}
        onChange={(e) => onChange({ ...section, content: e.target.value })}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="Enter opening text, greeting, and introductory paragraph... Drag variables or click in library."
        className="text-xs leading-relaxed font-sans rounded-xl p-3 bg-card border-border/70 resize-y focus:border-indigo-500 shadow-2xs"
      />
    </div>
  );
}

// -------------------------------------------------------------
// 2. ENGAGEMENT DETAILS SECTION EDITOR
// -------------------------------------------------------------
export function DetailsSectionEditor({
  section,
  onChange,
  onFocus,
}: SectionEditorProps<DetailsSection>) {
  const addField = () => {
    const newField: DetailField = {
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: 'New Field',
      value: '',
    };
    onChange({ ...section, fields: [...section.fields, newField] });
  };

  const removeField = (id: string) => {
    onChange({
      ...section,
      fields: section.fields.filter((f) => f.id !== id),
    });
  };

  const updateField = (id: string, updates: Partial<DetailField>) => {
    onChange({
      ...section,
      fields: section.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  return (
    <div className="space-y-3" onFocus={onFocus}>
      <div className="rounded-xl border border-border/70 divide-y divide-border/50 bg-background/60 overflow-hidden shadow-2xs">
        {section.fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 transition-colors group"
          >
            <div className="w-1/3 max-w-[200px] min-w-[120px]">
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="Field Label"
                className="h-8 text-xs font-semibold rounded-lg bg-card border-transparent hover:border-border/80 focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <Input
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value })}
                onDrop={(e) => {
                  e.preventDefault();
                  const varText = e.dataTransfer.getData('text/plain');
                  if (varText) {
                    updateField(field.id, {
                      value: field.value ? `${field.value} ${varText}` : varText,
                    });
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                placeholder="Value or [ Variable ]"
                className="h-8 text-xs rounded-lg bg-card font-mono text-indigo-700 dark:text-indigo-300 border-transparent hover:border-border/80 focus:border-indigo-500"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeField(field.id)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-30 group-hover:opacity-100 transition-opacity shrink-0"
              title="Remove Field"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addField}
        className="h-7 text-xs rounded-lg gap-1 border-dashed hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <Plus className="h-3 w-3" />
        <span>Add Field</span>
      </Button>
    </div>
  );
}

// -------------------------------------------------------------
// 3. ROLE & RESPONSIBILITIES SECTION EDITOR
// -------------------------------------------------------------
export function RoleResponsibilitiesSectionEditor({
  section,
  onChange,
  onFocus,
}: SectionEditorProps<RoleResponsibilitiesSection>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: '',
    };
    onChange({
      ...section,
      responsibilities: [...section.responsibilities, newItem],
    });
  };

  const removeItem = (id: string) => {
    onChange({
      ...section,
      responsibilities: section.responsibilities.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, text: string) => {
    onChange({
      ...section,
      responsibilities: section.responsibilities.map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= section.responsibilities.length) return;
    const newItems = [...section.responsibilities];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    onChange({ ...section, responsibilities: newItems });
  };

  const handleOverviewDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({
        ...section,
        roleOverview: `${section.roleOverview} ${varText}`,
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      section.roleOverview.substring(0, start) +
      varText +
      section.roleOverview.substring(end);
    onChange({ ...section, roleOverview: next });
  };

  return (
    <div className="space-y-4" onFocus={onFocus}>
      {/* Subsection: Role Overview */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground">Role Overview</Label>
          <span className="text-[10px] text-muted-foreground">High-level role summary</span>
        </div>
        <Textarea
          ref={textareaRef}
          rows={3}
          value={section.roleOverview}
          onChange={(e) => onChange({ ...section, roleOverview: e.target.value })}
          onDrop={handleOverviewDrop}
          onDragOver={(e) => e.preventDefault()}
          placeholder="Role overview summary or [ Role Overview ]..."
          className="text-xs leading-relaxed font-sans rounded-xl p-2.5 bg-card border-border/70 resize-y focus:border-indigo-500 shadow-2xs"
        />
      </div>

      <div className="border-t border-border/60" />

      {/* Subsection: Key Responsibilities */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground">Key Responsibilities</Label>
          <span className="text-[10px] text-muted-foreground">
            {section.responsibilities.length} items
          </span>
        </div>

        <div className="space-y-1.5">
          {section.responsibilities.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 p-1 px-2 rounded-lg border border-border/60 bg-card hover:border-border transition-all group shadow-2xs"
            >
              <div className="flex items-center text-muted-foreground px-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </div>

              <Input
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                onDrop={(e) => {
                  e.preventDefault();
                  const varText = e.dataTransfer.getData('text/plain');
                  if (varText) {
                    updateItem(item.id, item.text ? `${item.text} ${varText}` : varText);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                placeholder="Responsibility or deliverable item..."
                className="h-8 text-xs rounded-md bg-background flex-1 border-transparent hover:border-border/80 focus:border-indigo-500"
              />

              <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
                  title="Move item up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={index === section.responsibilities.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
                  title="Move item down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive"
                  title="Remove item"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="h-7 text-xs rounded-lg gap-1 border-dashed hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-1"
        >
          <Plus className="h-3 w-3" />
          <span>Add Responsibility</span>
        </Button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. TERMS OF ENGAGEMENT SECTION EDITOR (Compact Subsections)
// -------------------------------------------------------------
export function TermsSectionEditor({
  section,
  onChange,
  onFocus,
}: SectionEditorProps<TermsSection>) {
  const addClause = () => {
    const newClause: ClauseItem = {
      id: `cl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'New Term / Clause',
      content: '',
    };
    onChange({ ...section, clauses: [...section.clauses, newClause] });
  };

  const removeClause = (id: string) => {
    onChange({
      ...section,
      clauses: section.clauses.filter((c) => c.id !== id),
    });
  };

  const updateClause = (id: string, updates: Partial<ClauseItem>) => {
    onChange({
      ...section,
      clauses: section.clauses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  return (
    <div className="space-y-3" onFocus={onFocus}>
      <div className="space-y-2.5">
        {section.clauses.map((clause) => (
          <div
            key={clause.id}
            className="p-3 rounded-xl border border-border/70 bg-card hover:border-border transition-all group space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2">
              <Input
                value={clause.title}
                onChange={(e) => updateClause(clause.id, { title: e.target.value })}
                placeholder="Clause Title (e.g. Notice Period)"
                className="h-7 text-xs font-bold text-foreground rounded-md bg-muted/40 max-w-xs border-transparent hover:border-border/80 focus:border-indigo-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeClause(clause.id)}
                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                title="Remove Clause"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <Textarea
              rows={2}
              value={clause.content}
              onChange={(e) => updateClause(clause.id, { content: e.target.value })}
              onDrop={(e) => {
                e.preventDefault();
                const varText = e.dataTransfer.getData('text/plain');
                if (varText) {
                  updateClause(clause.id, {
                    content: clause.content ? `${clause.content} ${varText}` : varText,
                  });
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              placeholder="Clause terms, handbook policies, or [ Variable ]..."
              className="text-xs leading-relaxed rounded-lg p-2 bg-background border-border/60 resize-y focus:border-indigo-500 font-sans"
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addClause}
        className="h-7 text-xs rounded-lg gap-1 border-dashed hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <Plus className="h-3 w-3" />
        <span>Add Term / Clause</span>
      </Button>
    </div>
  );
}

// -------------------------------------------------------------
// 5. ACCEPTANCE SECTION EDITOR
// -------------------------------------------------------------
export function AcceptanceSectionEditor({
  section,
  onChange,
  onFocus,
}: SectionEditorProps<AcceptanceSection>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...section, content: `${section.content} ${varText}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      section.content.substring(0, start) + varText + section.content.substring(end);
    onChange({ ...section, content: next });
  };

  return (
    <div className="space-y-4" onFocus={onFocus}>
      {/* Acceptance paragraph */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-foreground">Acceptance Statement</Label>
        <Textarea
          ref={textareaRef}
          rows={3}
          value={section.content}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          placeholder="We look forward to your acceptance... [ Acceptance Period ]"
          className="text-xs leading-relaxed font-sans rounded-xl p-2.5 bg-card border-border/70 resize-y focus:border-indigo-500 shadow-2xs"
        />
      </div>

      <div className="border-t border-border/60" />

      {/* Signature Area (2-column card) */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-foreground">Signatures</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Employer Side */}
          <div className="p-3 rounded-xl border border-indigo-200/70 dark:border-indigo-800/60 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-indigo-200/50 dark:border-indigo-800/40">
              <Building className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Employer (NavGurukul)
              </span>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Header</Label>
              <Input
                value={section.signature.employer.header}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      employer: { ...section.signature.employer, header: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Signatory</Label>
              <Input
                value={section.signature.employer.signatoryName}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      employer: { ...section.signature.employer, signatoryName: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Title</Label>
              <Input
                value={section.signature.employer.signatoryTitle}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      employer: { ...section.signature.employer, signatoryTitle: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Date Text</Label>
              <Input
                value={section.signature.employer.dateText}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      employer: { ...section.signature.employer, dateText: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card font-mono"
              />
            </div>
          </div>

          {/* Candidate Side */}
          <div className="p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-200/50 dark:border-emerald-800/40">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Candidate / Consultant
              </span>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Header</Label>
              <Input
                value={section.signature.candidate.header}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      candidate: { ...section.signature.candidate, header: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Signatory</Label>
              <Input
                value={section.signature.candidate.signatoryName}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      candidate: { ...section.signature.candidate, signatoryName: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Designation</Label>
              <Input
                value={section.signature.candidate.signatoryTitle}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      candidate: { ...section.signature.candidate, signatoryTitle: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground font-semibold">Date Text</Label>
              <Input
                value={section.signature.candidate.dateText}
                onChange={(e) =>
                  onChange({
                    ...section,
                    signature: {
                      ...section.signature,
                      candidate: { ...section.signature.candidate, dateText: e.target.value },
                    },
                  })
                }
                className="h-7 text-xs rounded-md bg-card font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. CUSTOM RICH TEXT SECTION EDITOR
// -------------------------------------------------------------
export function CustomRichTextSectionEditor({
  section,
  onChange,
  onFocus,
}: SectionEditorProps<CustomRichTextSection>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...section, content: `${section.content} ${varText}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      section.content.substring(0, start) + varText + section.content.substring(end);
    onChange({ ...section, content: next });
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <Textarea
        ref={textareaRef}
        rows={4}
        value={section.content}
        onChange={(e) => onChange({ ...section, content: e.target.value })}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="Enter section content with [ Variables ]..."
        className="text-xs leading-relaxed font-sans rounded-xl p-3 bg-card border-border/70 resize-y focus:border-indigo-500 shadow-2xs"
      />
    </div>
  );
}
