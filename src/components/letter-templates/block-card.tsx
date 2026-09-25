'use client';

import React, { useState } from 'react';
import {
  LetterBlock,
  BlockType,
  TextBlock,
  HeadingBlock,
  DetailsBlock,
  RichTextBlock,
  BulletListBlock,
  ClauseBlock,
  SignatureBlock,
} from '@/lib/letter-templates/block-types';
import {
  TextBlockEditor,
  HeadingBlockEditor,
  DetailsBlockEditor,
  RichTextBlockEditor,
  BulletListBlockEditor,
  ClauseBlockEditor,
  SignatureBlockEditor,
} from './block-editors';
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  FileText,
  Heading,
  TableProperties,
  List,
  ShieldAlert,
  PenTool,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlockCardProps {
  block: LetterBlock;
  index: number;
  totalBlocks: number;
  isActive: boolean;
  onSelect: () => void;
  onChange: (updated: LetterBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const BLOCK_TYPE_INFO: Record<
  BlockType,
  { label: string; icon: React.ElementType; color: string }
> = {
  text: { label: 'Text', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900' },
  heading: { label: 'Heading', icon: Heading, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900' },
  details: { label: 'Field / Detail', icon: TableProperties, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900' },
  rich_text: { label: 'Rich Text', icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900' },
  bullet_list: { label: 'Bullet List', icon: List, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' },
  clause: { label: 'Clause', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900' },
  signature: { label: 'Signature Block', icon: PenTool, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900' },
};

export function BlockCard({
  block,
  index,
  totalBlocks,
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
}: BlockCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const typeInfo = BLOCK_TYPE_INFO[block.type] || BLOCK_TYPE_INFO.text;
  const TypeIcon = typeInfo.icon;

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlockEditor
            block={block as TextBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'heading':
        return (
          <HeadingBlockEditor
            block={block as HeadingBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'details':
        return (
          <DetailsBlockEditor
            block={block as DetailsBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'rich_text':
        return (
          <RichTextBlockEditor
            block={block as RichTextBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'bullet_list':
        return (
          <BulletListBlockEditor
            block={block as BulletListBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'clause':
        return (
          <ClauseBlockEditor
            block={block as ClauseBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      case 'signature':
        return (
          <SignatureBlockEditor
            block={block as SignatureBlock}
            onChange={onChange}
            onFocus={onSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`group relative rounded-xl border transition-all duration-200 bg-card shadow-xs ${
        isActive
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-border/80 hover:border-border hover:shadow-xs'
      }`}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/60 bg-muted/20 rounded-t-xl select-none">
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag Handle */}
          <div
            className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 rounded"
            title="Drag to reorder block"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Block Number & Type Icon */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${typeInfo.color}`}
          >
            <TypeIcon className="h-3 w-3" />
            <span>{typeInfo.label}</span>
          </div>

          {/* Block Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={block.title}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className="text-xs font-semibold px-1 py-0.5 border rounded bg-background"
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="text-xs font-semibold text-foreground truncate cursor-pointer hover:underline"
              title="Click to rename block title"
            >
              {block.title || `Block #${index + 1}`}
            </span>
          )}
        </div>

        {/* Quick Contextual Controls (Section 26) */}
        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
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
            title="Move Block Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === totalBlocks - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move Block Down"
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
            title="Duplicate Block"
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
            title="Delete Block"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Block Body Editor */}
      <div className="p-3.5">{renderEditor()}</div>
    </div>
  );
}

// -------------------------------------------------------------
// ADD BLOCK INSERTION DIVIDER (Section 27)
// -------------------------------------------------------------
interface AddBlockDividerProps {
  onAddBlock: (type: BlockType) => void;
}

export function AddBlockDivider({ onAddBlock }: AddBlockDividerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const blockOptions: { type: BlockType; label: string; icon: React.ElementType }[] = [
    { type: 'text', label: 'Text', icon: FileText },
    { type: 'heading', label: 'Heading', icon: Heading },
    { type: 'details', label: 'Details', icon: TableProperties },
    { type: 'rich_text', label: 'Rich Text', icon: FileText },
    { type: 'bullet_list', label: 'Bullet List', icon: List },
    { type: 'clause', label: 'Clause', icon: ShieldAlert },
    { type: 'signature', label: 'Signature', icon: PenTool },
  ];

  return (
    <div className="relative py-2 flex flex-col items-center group">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-full border-t border-dashed border-border/70 group-hover:border-indigo-400/80 transition-colors" />
      </div>

      <div className="relative z-10">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border/80 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-semibold text-muted-foreground shadow-xs transition-all hover:scale-105"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Block</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-xl bg-card border border-indigo-300 dark:border-indigo-800 shadow-md animate-in fade-in zoom-in-95 duration-150">
            {blockOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    onAddBlock(opt.type);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
