'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LetterSection,
  SectionType,
  LetterTemplateDocument,
  LetterType,
  AddendumType,
  LetterTemplate,
} from '@/lib/letter-templates/types';
import { TemplateVariable } from '@/lib/letter-templates/variables';
import { VariableLibrary } from './variable-library';
import { SectionCard, AddSectionBar } from './section-card';
import { renderSectionsToHtml } from '@/lib/letter-templates/block-renderer';
import {
  migrateHtmlToBlocks,
  convert17BlocksTo5Sections,
} from '@/lib/letter-templates/block-migration';
import { CONSULTANT_OFFER_LETTER_SECTIONS } from '@/lib/letter-templates/consultant-offer-blocks';
import { DocumentLetterhead } from '@/components/shared/document-letterhead';
import { downloadDocumentAsPdf } from '@/lib/letter-templates/download';

import {
  ArrowLeft,
  Save,
  Eye,
  Settings2,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BlockEditorProps {
  initialTemplate?: LetterTemplate | null;
  onBack: () => void;
  onSave: (savedData: {
    name: string;
    letter_type: LetterType;
    employee_type_name: string;
    addendum_type?: AddendumType | null;
    description?: string;
    content: string;
    blocks_json: LetterTemplateDocument;
  }) => Promise<void>;
}

const LETTER_TYPES: LetterType[] = [
  'Offer Letter',
  'Acceptance Letter',
  'Appointment Letter',
  'Confirmation Letter',
  'Role Change Letter',
  'Addendum',
];

const ADDENDUM_TYPES: AddendumType[] = ['Salary', 'Location', 'Role', 'Other'];

export function BlockEditor({
  initialTemplate,
  onBack,
  onSave,
}: BlockEditorProps) {
  // Document metadata state
  const [name, setName] = useState(
    initialTemplate?.name || 'Consultant Offer Letter'
  );
  const [letterType, setLetterType] = useState<LetterType>(
    initialTemplate?.letter_type || 'Offer Letter'
  );
  const [employeeTypeName, setEmployeeTypeName] = useState(
    initialTemplate?.employee_type_name || 'Consultant'
  );
  const [addendumType, setAddendumType] = useState<AddendumType>(
    initialTemplate?.addendum_type || 'Salary'
  );
  const [description, setDescription] = useState(
    initialTemplate?.description || ''
  );

  // 5 Major Document Sections State
  const [sections, setSections] = useState<LetterSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Unsaved changes'>('Saved');

  // Preview and Settings modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Drag-and-drop section reorder state
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // Initialize sections from template or migrate from HTML / 17 blocks
  useEffect(() => {
    if (initialTemplate) {
      if (initialTemplate.blocks_json) {
        if (
          initialTemplate.blocks_json.sections &&
          initialTemplate.blocks_json.sections.length > 0
        ) {
          setSections(initialTemplate.blocks_json.sections);
          setActiveSectionId(initialTemplate.blocks_json.sections[0]?.id || null);
          return;
        }
        if (
          initialTemplate.blocks_json.blocks &&
          initialTemplate.blocks_json.blocks.length > 0
        ) {
          const converted = convert17BlocksTo5Sections(initialTemplate.blocks_json.blocks);
          setSections(converted);
          setActiveSectionId(converted[0]?.id || null);
          return;
        }
      }
      if (initialTemplate.content) {
        const migrated = migrateHtmlToBlocks(initialTemplate.content);
        const secs = migrated.sections || convert17BlocksTo5Sections(migrated.blocks || []);
        setSections(secs);
        setActiveSectionId(secs[0]?.id || null);
        return;
      }
    }

    // Default to the 5 standard Consultant Offer Letter sections
    const defaultSections = JSON.parse(JSON.stringify(CONSULTANT_OFFER_LETTER_SECTIONS));
    setSections(defaultSections);
    setActiveSectionId('sec-opening');
  }, [initialTemplate]);

  // Synchronize orders and mark unsaved
  const handleSectionsChange = useCallback((newSections: LetterSection[]) => {
    const normalized = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(normalized);
    setSaveStatus('Unsaved changes');
  }, []);

  // Update a single section
  const handleUpdateSection = (updated: LetterSection) => {
    const updatedSections = sections.map((s) => (s.id === updated.id ? updated : s));
    handleSectionsChange(updatedSections);
  };

  // Move section up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    handleSectionsChange(newSections);
  };

  // Move section down
  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    handleSectionsChange(newSections);
  };

  // Duplicate section
  const handleDuplicate = (index: number) => {
    const target = sections[index];
    const cloned: LetterSection = JSON.parse(JSON.stringify(target));
    cloned.id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    cloned.title = `${target.title} (Copy)`;

    const newSections = [...sections];
    newSections.splice(index + 1, 0, cloned);
    handleSectionsChange(newSections);
    setActiveSectionId(cloned.id);
    toast.success(`Duplicated "${target.title}"`);
  };

  // Delete section
  const handleDelete = (index: number) => {
    if (sections.length <= 1) {
      toast.error('Template must have at least one section');
      return;
    }
    const targetTitle = sections[index]?.title || 'Section';
    const newSections = sections.filter((_, idx) => idx !== index);
    handleSectionsChange(newSections);
    if (activeSectionId === sections[index]?.id) {
      setActiveSectionId(newSections[0]?.id || null);
    }
    toast.info(`Deleted "${targetTitle}"`);
  };

  // Add section
  const handleAddSection = (type: SectionType) => {
    const id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let newSection: LetterSection;

    switch (type) {
      case 'opening':
        newSection = {
          id,
          type: 'opening',
          title: 'Opening',
          order: sections.length + 1,
          content: 'Dear [Full Name],\n\nGreetings from NavGurukul.',
        };
        break;
      case 'details':
        newSection = {
          id,
          type: 'details',
          title: 'Engagement Details',
          order: sections.length + 1,
          fields: [
            { id: `f-${Date.now()}-1`, label: 'Position Title', value: '[Designation]' },
            { id: `f-${Date.now()}-2`, label: 'Engagement Type', value: 'Consultant' },
          ],
        };
        break;
      case 'role_responsibilities':
        newSection = {
          id,
          type: 'role_responsibilities',
          title: 'Role & Responsibilities',
          order: sections.length + 1,
          roleOverview: '[Role Overview]',
          responsibilities: [
            { id: `item-${Date.now()}-1`, text: 'Lead functional initiatives and core deliverables.' },
          ],
        };
        break;
      case 'terms':
        newSection = {
          id,
          type: 'terms',
          title: 'Terms of Engagement',
          order: sections.length + 1,
          clauses: [
            { id: `cl-${Date.now()}-1`, title: 'Notice Period', content: '[Notice Period]' },
          ],
        };
        break;
      case 'acceptance':
        newSection = {
          id,
          type: 'acceptance',
          title: 'Acceptance',
          order: sections.length + 1,
          content: 'We look forward to your acceptance within [Acceptance Period].',
          signature: {
            employer: {
              header: 'For NavGurukul Foundation for Social Welfare',
              signatoryName: '[Authorized Signatory Name]',
              signatoryTitle: '[Authorized Signatory Title]',
              dateText: 'Date: [Offer Letter Date]',
            },
            candidate: {
              header: 'Accepted & Agreed',
              signatoryName: '[Full Name]',
              signatoryTitle: '[Designation]',
              dateText: 'Date: [Date of Acceptance]',
            },
          },
        };
        break;
      case 'custom_rich_text':
      default:
        newSection = {
          id,
          type: 'custom_rich_text',
          title: 'Custom Section',
          order: sections.length + 1,
          content: 'Enter section paragraphs or details here...',
        };
        break;
    }

    const newSections = [...sections, newSection];
    handleSectionsChange(newSections);
    setActiveSectionId(newSection.id);
    toast.success(`Added ${newSection.title} section`);
  };

  // Drag and drop section reordering
  const handleSectionDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSectionDrop = (targetIndex: number) => {
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) {
      setDraggedSectionIndex(null);
      return;
    }
    const newSections = [...sections];
    const [moved] = newSections.splice(draggedSectionIndex, 1);
    newSections.splice(targetIndex, 0, moved);
    handleSectionsChange(newSections);
    setDraggedSectionIndex(null);
    toast.success(`Reordered section to position ${targetIndex + 1}`);
  };

  // Insert variable into active section
  const handleInsertVariable = (variable: TemplateVariable) => {
    const chipText = `[${variable.displayLabel}]`;
    if (!activeSectionId && sections.length > 0) {
      setActiveSectionId(sections[0].id);
    }

    const activeSec = sections.find((s) => s.id === activeSectionId) || sections[0];
    if (!activeSec) return;

    if (activeSec.type === 'opening') {
      handleUpdateSection({
        ...activeSec,
        content: `${activeSec.content} ${chipText}`,
      });
    } else if (activeSec.type === 'details') {
      const updatedFields = [...activeSec.fields];
      if (updatedFields.length > 0) {
        const lastField = updatedFields[updatedFields.length - 1];
        lastField.value = lastField.value ? `${lastField.value} ${chipText}` : chipText;
      }
      handleUpdateSection({ ...activeSec, fields: updatedFields });
    } else if (activeSec.type === 'role_responsibilities') {
      handleUpdateSection({
        ...activeSec,
        roleOverview: `${activeSec.roleOverview} ${chipText}`,
      });
    } else if (activeSec.type === 'terms') {
      const updatedClauses = [...activeSec.clauses];
      if (updatedClauses.length > 0) {
        const last = updatedClauses[updatedClauses.length - 1];
        last.content = `${last.content} ${chipText}`;
      }
      handleUpdateSection({ ...activeSec, clauses: updatedClauses });
    } else if (activeSec.type === 'acceptance') {
      handleUpdateSection({
        ...activeSec,
        content: `${activeSec.content} ${chipText}`,
      });
    } else if (activeSec.type === 'custom_rich_text') {
      handleUpdateSection({
        ...activeSec,
        content: `${activeSec.content} ${chipText}`,
      });
    }
  };

  // Open Preview
  const handleOpenPreview = () => {
    const html = renderSectionsToHtml(sections, {
      forPreview: true,
      templateTitle: name,
    });
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  // Save Template
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (sections.length === 0) {
      toast.error('Template must have at least one section');
      return;
    }

    try {
      setIsSaving(true);
      const generatedHtml = renderSectionsToHtml(sections, {
        forPreview: false,
        templateTitle: name,
      });

      const documentJson: LetterTemplateDocument = {
        version: 1,
        sections,
      };

      await onSave({
        name,
        letter_type: letterType,
        employee_type_name: employeeTypeName,
        addendum_type: letterType === 'Addendum' ? addendumType : null,
        description,
        content: generatedHtml,
        blocks_json: documentJson,
      });

      setSaveStatus('Saved');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* TOP APPLICATION BAR */}
      <header className="h-14 border-b border-border/70 bg-card/80 backdrop-blur-xs px-4 flex items-center justify-between shrink-0 select-none z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-lg text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground -ml-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="h-4 w-[1px] bg-border shrink-0" />

          {/* Template Title Input */}
          <div className="flex items-center gap-2 min-w-0 max-w-sm sm:max-w-md">
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaveStatus('Unsaved changes');
              }}
              placeholder="Template Name..."
              className="h-8 text-xs font-bold bg-transparent hover:bg-muted/40 focus:bg-background border-transparent hover:border-border transition-colors truncate rounded-lg"
            />
          </div>

          {/* Status Badge */}
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
              saveStatus === 'Saved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
            }`}
          >
            {saveStatus === 'Saved' ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
            ) : (
              <Clock className="h-3 w-3 text-amber-700 dark:text-amber-300" />
            )}
            <span>{saveStatus}</span>
          </Badge>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {/* Settings / Metadata Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
            className="h-8 text-xs rounded-lg gap-1.5 font-medium"
          >
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          {/* Preview Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            className="h-8 text-xs rounded-lg gap-1.5 font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Preview</span>
          </Button>

          {/* Save Button */}
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold gap-1.5 shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
          </Button>
        </div>
      </header>

      {/* WORKSPACE AREA: 5 MAJOR SECTIONS + VARIABLE LIBRARY */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Document Canvas */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full space-y-4">
          {/* Document Sections Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60 select-none">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
              <h2 className="text-xs font-bold text-foreground tracking-wide uppercase">
                Document Sections ({sections.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Document view • Drag sections to reorder • Insert variables
            </span>
          </div>

          {/* 5 Major Sections List */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
                totalSections={sections.length}
                isActive={activeSectionId === section.id}
                onSelect={() => setActiveSectionId(section.id)}
                onChange={handleUpdateSection}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onDuplicate={() => handleDuplicate(index)}
                onDelete={() => handleDelete(index)}
                onDragStart={() => handleSectionDragStart(index)}
                onDragOver={handleSectionDragOver}
                onDrop={() => handleSectionDrop(index)}
              />
            ))}
          </div>

          {/* Simple "+ Add Section" Bar at the bottom (Section 8) */}
          <AddSectionBar onAddSection={handleAddSection} />
        </main>

        {/* Right Sidebar: Variable Library */}
        <VariableLibrary
          onInsertVariable={handleInsertVariable}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* TEMPLATE SETTINGS MODAL */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
              <span>Template Settings &amp; Metadata</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure letter type categorization and applicable employee types.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Letter Type</Label>
              <Select
                value={letterType}
                onValueChange={(val: LetterType) => {
                  setLetterType(val);
                  setSaveStatus('Unsaved changes');
                }}
              >
                <SelectTrigger className="h-9 text-xs rounded-lg">
                  <SelectValue placeholder="Letter Type" />
                </SelectTrigger>
                <SelectContent>
                  {LETTER_TYPES.map((lt) => (
                    <SelectItem key={lt} value={lt}>
                      {lt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Applicable Employee Type</Label>
              <Select
                value={employeeTypeName}
                onValueChange={(val: string) => {
                  setEmployeeTypeName(val);
                  setSaveStatus('Unsaved changes');
                }}
              >
                <SelectTrigger className="h-9 text-xs rounded-lg">
                  <SelectValue placeholder="Employee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="FTE">FTE (Full-Time Employee)</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                  <SelectItem value="Apprentice">Apprentice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {letterType === 'Addendum' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Addendum Category</Label>
                <Select
                  value={addendumType}
                  onValueChange={(val: AddendumType) => {
                    setAddendumType(val);
                    setSaveStatus('Unsaved changes');
                  }}
                >
                  <SelectTrigger className="h-9 text-xs rounded-lg">
                    <SelectValue placeholder="Addendum Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDENDUM_TYPES.map((at) => (
                      <SelectItem key={at} value={at}>
                        {at} Addendum
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSaveStatus('Unsaved changes');
                }}
                placeholder="Short description of this template..."
                className="h-9 text-xs rounded-lg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FULL DOCUMENT PREVIEW MODAL */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="w-[92vw] max-w-[92vw] sm:max-w-[92vw] sm:w-[92vw] h-[92vh] max-h-[92vh] flex flex-col rounded-2xl p-0 overflow-hidden"
          style={{ width: '92vw', maxWidth: '92vw', height: '92vh', maxHeight: '92vh' }}
        >
          <DialogHeader className="p-4 border-b border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />
                <span>Letter Document Preview</span>
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                Live document view with dummy candidate data (Priya Sharma, Program Associate, NavGurukul letterhead).
              </p>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-zinc-900/80">
            <DocumentLetterhead contentHtml={previewHtml} title={name} />
          </div>

          <DialogFooter className="p-3 border-t border-border/60 bg-muted/20 shrink-0 gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                try {
                  toast.info(`Generating PDF for ${name}...`);
                  await downloadDocumentAsPdf(name, name, previewHtml);
                  toast.success(`Downloaded ${name}.pdf`);
                } catch (e) {
                  toast.error('Failed to generate PDF');
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs gap-1.5 font-semibold shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(false)}
              className="rounded-lg text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
