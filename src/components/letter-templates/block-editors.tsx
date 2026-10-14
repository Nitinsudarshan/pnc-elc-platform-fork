'use client';

import React, { useRef } from 'react';
import {
  LetterBlock,
  TextBlock,
  HeadingBlock,
  DetailsBlock,
  DetailField,
  RichTextBlock,
  BulletListBlock,
  ClauseBlock,
  SignatureBlock,
} from '@/lib/letter-templates/block-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Bold,
  Italic,
  Underline,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building,
  UserCheck,
  List,
  Sparkles,
} from 'lucide-react';

interface BlockEditorProps<T extends LetterBlock> {
  block: T;
  onChange: (updated: T) => void;
  onFocus?: () => void;
}

// -------------------------------------------------------------
// TEXT BLOCK EDITOR
// -------------------------------------------------------------
export function TextBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<TextBlock>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...block, content: `${block.content} ${varText}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = block.content;
    const next = current.substring(0, start) + varText + current.substring(end);
    onChange({ ...block, content: next });
  };

  return (
    <div className="space-y-1.5" onFocus={onFocus}>
      <Textarea
        ref={textareaRef}
        rows={4}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="Enter paragraph text... Drag variables here or click in library."
        className="text-xs leading-relaxed font-sans rounded-lg resize-y bg-background focus:border-indigo-500"
      />
    </div>
  );
}

// -------------------------------------------------------------
// HEADING BLOCK EDITOR
// -------------------------------------------------------------
export function HeadingBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<HeadingBlock>) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2" onFocus={onFocus}>
      <div className="flex items-center gap-1 border border-border/70 rounded-lg p-0.5 bg-muted/40 shrink-0">
        {([1, 2, 3] as const).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onChange({ ...block, level: lvl })}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              block.level === lvl
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            H{lvl}
          </button>
        ))}
      </div>
      <Input
        value={block.text || block.title}
        onChange={(e) =>
          onChange({ ...block, text: e.target.value, title: e.target.value })
        }
        placeholder="Section Heading Title..."
        className="h-9 text-xs font-bold rounded-lg flex-1 bg-background"
      />
    </div>
  );
}

// -------------------------------------------------------------
// DETAILS BLOCK EDITOR
// -------------------------------------------------------------
export function DetailsBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<DetailsBlock>) {
  const addField = () => {
    const newField: DetailField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: 'New Field',
      value: '',
    };
    onChange({ ...block, fields: [...block.fields, newField] });
  };

  const removeField = (id: string) => {
    onChange({
      ...block,
      fields: block.fields.filter((f) => f.id !== id),
    });
  };

  const updateField = (id: string, updates: Partial<DetailField>) => {
    onChange({
      ...block,
      fields: block.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  return (
    <div className="space-y-2.5" onFocus={onFocus}>
      <div className="rounded-lg border border-border/70 divide-y divide-border/60 bg-background/50 overflow-hidden">
        {block.fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center gap-2 p-2 sm:px-3 hover:bg-muted/30 transition-colors group"
          >
            <div className="w-1/3 min-w-[120px]">
              <Input
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                placeholder="Field Label (e.g. Work Location)"
                className="h-8 text-xs font-semibold rounded-md bg-card"
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
                className="h-8 text-xs rounded-md bg-card font-mono text-indigo-700 dark:text-indigo-300"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeField(field.id)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
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
// RICH TEXT BLOCK EDITOR
// -------------------------------------------------------------
export function RichTextBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<RichTextBlock>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = block.content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix || prefix}`;
    const next =
      block.content.substring(0, start) +
      replacement +
      block.content.substring(end);
    onChange({ ...block, content: next });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 10);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...block, content: `${block.content} ${varText}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      block.content.substring(0, start) + varText + block.content.substring(end);
    onChange({ ...block, content: next });
  };

  return (
    <div className="space-y-1.5" onFocus={onFocus}>
      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-1 border border-border/70 rounded-t-lg px-2 py-1 bg-muted/40 text-muted-foreground">
        <button
          type="button"
          onClick={() => insertFormatting('**')}
          className="p-1 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*')}
          className="p-1 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<u>', '</u>')}
          className="p-1 rounded hover:bg-muted hover:text-foreground transition-colors"
          title="Underline (<u>text</u>)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <div className="h-3.5 w-[1px] bg-border mx-1" />
        <span className="text-[10px] text-muted-foreground/80">
          Markdown / HTML tags &amp; [Variables] supported
        </span>
      </div>

      <Textarea
        ref={textareaRef}
        rows={5}
        value={block.content}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="Enter rich paragraph content... Drag variables or use toolbar."
        className="text-xs leading-relaxed font-sans rounded-b-lg rounded-t-none resize-y bg-background focus:border-indigo-500 -mt-1.5"
      />
    </div>
  );
}

// -------------------------------------------------------------
// BULLET LIST BLOCK EDITOR
// -------------------------------------------------------------
export function BulletListBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<BulletListBlock>) {
  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: '',
    };
    onChange({ ...block, items: [...block.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({
      ...block,
      items: block.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (id: string, text: string) => {
    onChange({
      ...block,
      items: block.items.map((item) => (item.id === id ? { ...item, text } : item)),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= block.items.length) return;
    const newItems = [...block.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    onChange({ ...block, items: newItems });
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <div className="space-y-1.5">
        {block.items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-1.5 p-1 rounded-lg border border-border/60 bg-card hover:border-border transition-all group"
          >
            <div className="flex items-center gap-0.5 text-muted-foreground px-1">
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
              placeholder="List item responsibility or deliverable..."
              className="h-8 text-xs rounded-md bg-background flex-1"
            />

            <div className="flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
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
                disabled={index === block.items.length - 1}
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
        className="h-7 text-xs rounded-lg gap-1 border-dashed hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <Plus className="h-3 w-3" />
        <span>Add Responsibility / Item</span>
      </Button>
    </div>
  );
}

// -------------------------------------------------------------
// CLAUSE BLOCK EDITOR
// -------------------------------------------------------------
export function ClauseBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<ClauseBlock>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const varText = e.dataTransfer.getData('text/plain');
    if (!varText) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      onChange({ ...block, content: `${block.content} ${varText}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next =
      block.content.substring(0, start) + varText + block.content.substring(end);
    onChange({ ...block, content: next });
  };

  return (
    <div className="space-y-2" onFocus={onFocus}>
      <div>
        <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
          Clause / Term Title
        </Label>
        <Input
          value={block.clauseTitle}
          onChange={(e) =>
            onChange({ ...block, clauseTitle: e.target.value, title: e.target.value })
          }
          placeholder="e.g. Termination Clause or Sensitive Data"
          className="h-8 text-xs font-semibold rounded-lg bg-background"
        />
      </div>

      <div>
        <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
          Clause Terms &amp; Conditions
        </Label>
        <Textarea
          ref={textareaRef}
          rows={3}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          placeholder="Enter legal / engagement clause wording or [ Variable ]..."
          className="text-xs leading-relaxed rounded-lg resize-y bg-background font-sans"
        />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SIGNATURE BLOCK EDITOR
// -------------------------------------------------------------
export function SignatureBlockEditor({
  block,
  onChange,
  onFocus,
}: BlockEditorProps<SignatureBlock>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" onFocus={onFocus}>
      {/* Employer Side */}
      <div className="p-3 rounded-xl border border-indigo-200/70 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
        <div className="flex items-center gap-1.5 pb-1 border-b border-indigo-200/50 dark:border-indigo-800/40">
          <Building className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
            Employer / NavGurukul Signatory
          </span>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Header Label</Label>
          <Input
            value={block.employer.header}
            onChange={(e) =>
              onChange({
                ...block,
                employer: { ...block.employer, header: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Signatory Name</Label>
          <Input
            value={block.employer.signatoryName}
            onChange={(e) =>
              onChange({
                ...block,
                employer: { ...block.employer, signatoryName: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Signatory Title</Label>
          <Input
            value={block.employer.signatoryTitle}
            onChange={(e) =>
              onChange({
                ...block,
                employer: { ...block.employer, signatoryTitle: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Date Text</Label>
          <Input
            value={block.employer.dateText}
            onChange={(e) =>
              onChange({
                ...block,
                employer: { ...block.employer, dateText: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card font-mono"
          />
        </div>
      </div>

      {/* Candidate Side */}
      <div className="p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
        <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-200/50 dark:border-emerald-800/40">
          <UserCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
            Candidate / Consultant Acceptance
          </span>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Header Label</Label>
          <Input
            value={block.candidate.header}
            onChange={(e) =>
              onChange({
                ...block,
                candidate: { ...block.candidate, header: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Candidate Name</Label>
          <Input
            value={block.candidate.signatoryName}
            onChange={(e) =>
              onChange({
                ...block,
                candidate: { ...block.candidate, signatoryName: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Designation</Label>
          <Input
            value={block.candidate.signatoryTitle}
            onChange={(e) =>
              onChange({
                ...block,
                candidate: { ...block.candidate, signatoryTitle: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card font-mono"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground font-semibold">Date Text</Label>
          <Input
            value={block.candidate.dateText}
            onChange={(e) =>
              onChange({
                ...block,
                candidate: { ...block.candidate, dateText: e.target.value },
              })
            }
            className="h-7 text-xs rounded-md bg-card font-mono"
          />
        </div>
      </div>
    </div>
  );
}
