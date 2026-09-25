'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  Layers,
  ArrowRight,
  MoreVertical,
  Check,
  Copy,
  Trash2,
  FileCode,
  Tag,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Table as TableIcon,
  HelpCircle,
  Download,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LetterTemplate,
  LetterType,
  AddendumType,
  TemplateStatus,
  STANDARD_PLACEHOLDERS,
} from '@/lib/letter-templates/types';
import { DocumentLetterhead } from '@/components/shared/document-letterhead';
import { downloadDocumentAsPdf, downloadDocumentAsWord } from '@/lib/letter-templates/download';
import { toast } from 'sonner';

const LETTER_TYPES: LetterType[] = [
  'Offer Letter',
  'Acceptance Letter',
  'Appointment Letter',
  'Confirmation Letter',
  'Role Change Letter',
  'Addendum',
];

const ADDENDUM_TYPES: AddendumType[] = ['Salary', 'Location', 'Role', 'Other'];

export default function LetterTemplatesPage() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [letterTypeFilter, setLetterTypeFilter] = useState<string>('all');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Editor Modal state
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<LetterTemplate | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    letter_type: LetterType;
    employee_type_name: string;
    addendum_type: AddendumType;
    description: string;
    content: string;
  }>({
    name: '',
    letter_type: 'Offer Letter',
    employee_type_name: 'Consultant',
    addendum_type: 'Salary',
    description: '',
    content: '',
  });

  const [previewContent, setPreviewContent] = useState<string>('');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/letter-templates?status=all`);
      const json = await res.json();
      if (json.success && json.data) {
        setTemplates(json.data);
      } else {
        toast.error('Failed to load letter templates');
      }
    } catch (e) {
      toast.error('Network error loading letter templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setFormData({
      name: '',
      letter_type: 'Offer Letter',
      employee_type_name: 'Consultant',
      addendum_type: 'Salary',
      description: '',
      content: `<h1>{{Template Title}}</h1>
<p><strong>NavGurukul Foundation for Social Welfare</strong></p>
<p>Date: {{Offer Letter Date}}</p>
<p>Dear {{Full Name}},</p>

<p>We are pleased to share the details regarding your engagement as <strong>{{Designation}}</strong> in the <strong>{{Department}}</strong> department.</p>

<h3>Engagement Terms</h3>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%;">
  <tr>
    <td style="width: 30%;"><strong>Position Title</strong></td>
    <td>{{Designation}}</td>
  </tr>
  <tr>
    <td><strong>Department</strong></td>
    <td>{{Department}}</td>
  </tr>
  <tr>
    <td><strong>Date of Joining</strong></td>
    <td>{{Date of Joining}}</td>
  </tr>
  <tr>
    <td><strong>Monthly Compensation</strong></td>
    <td>{{Monthly Compensation}}</td>
  </tr>
</table>

<p>Please confirm your acceptance of this letter within {{Acceptance Period}}.</p>

<br/>
<p>Sincerely,<br/>{{Authorized Signatory Name}}<br/>{{Authorized Signatory Title}}</p>`,
    });
    setEditorModalOpen(true);
  };

  const openEditModal = (tpl: LetterTemplate) => {
    setEditingTemplateId(tpl.id);
    setFormData({
      name: tpl.name,
      letter_type: tpl.letter_type,
      employee_type_name: tpl.employee_type_name,
      addendum_type: tpl.addendum_type || 'Salary',
      description: tpl.description || '',
      content: tpl.content,
    });
    setEditorModalOpen(true);
  };

  const openPreview = (tpl: LetterTemplate) => {
    setSelectedPreviewTemplate(tpl);
    setPreviewContent(tpl.content);
    setPreviewModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Template content cannot be empty');
      return;
    }

    try {
      if (editingTemplateId) {
        const res = await fetch(`/api/letter-templates/${editingTemplateId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Letter template updated successfully');
          setEditorModalOpen(false);
          fetchTemplates();
        } else {
          toast.error(json.error || 'Failed to update template');
        }
      } else {
        const res = await fetch('/api/letter-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Letter template created successfully');
          setEditorModalOpen(false);
          fetchTemplates();
        } else {
          toast.error(json.error || 'Failed to create template');
        }
      }
    } catch (e) {
      toast.error('Network error saving template');
    }
  };

  const handleToggleArchive = async (id: string, currentStatus: TemplateStatus) => {
    const action = currentStatus === 'active' ? 'archive' : 'restore';
    try {
      const res = await fetch(`/api/letter-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(action === 'archive' ? 'Template archived' : 'Template restored to Active');
        fetchTemplates();
      } else {
        toast.error(json.error || 'Failed to toggle status');
      }
    } catch (e) {
      toast.error('Error updating template status');
    }
  };

  const insertPlaceholder = (ph: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + ` ${ph} `,
    }));
    toast.success(`Inserted ${ph}`);
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesStatus =
        statusFilter === 'all' ? true : tpl.status === statusFilter;

      const matchesLetterType =
        letterTypeFilter === 'all' ? true : tpl.letter_type === letterTypeFilter;

      const matchesEmployeeType =
        employeeTypeFilter === 'all'
          ? true
          : tpl.employee_type_name.toLowerCase() === employeeTypeFilter.toLowerCase();

      const matchesSearch =
        tpl.name.toLowerCase().includes(search.toLowerCase()) ||
        (tpl.description && tpl.description.toLowerCase().includes(search.toLowerCase())) ||
        tpl.letter_type.toLowerCase().includes(search.toLowerCase()) ||
        tpl.employee_type_name.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesLetterType && matchesEmployeeType && matchesSearch;
    });
  }, [templates, statusFilter, letterTypeFilter, employeeTypeFilter, search]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <PageBanner
        title="Letter Templates"
        description="Create, customize, and manage reusable letter templates categorized by Letter Type and applicable Employee Type."
        icon={<FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold rounded-lg text-xs">
              <Link href="/manage/letters">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Generated Letters</span>
              </Link>
            </Button>
            <Button
              onClick={openCreateModal}
              size="sm"
              className="gap-1.5 shadow-sm font-semibold rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Template</span>
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs (Active | Archived | All) */}
          <Tabs
            value={statusFilter}
            onValueChange={(val: any) => setStatusFilter(val)}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-muted/60 p-1 rounded-xl h-auto">
              <TabsTrigger value="active" className="rounded-lg text-xs font-semibold py-1.5 px-3">
                Active ({templates.filter((t) => t.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="archived" className="rounded-lg text-xs font-semibold py-1.5 px-3">
                Archived ({templates.filter((t) => t.status === 'archived').length})
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg text-xs font-semibold py-1.5 px-3">
                All ({templates.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8.5 h-8.5 text-xs rounded-lg"
              />
            </div>

            {/* Letter Type Filter */}
            <Select value={letterTypeFilter} onValueChange={setLetterTypeFilter}>
              <SelectTrigger className="h-8.5 text-xs rounded-lg w-[140px]">
                <SelectValue placeholder="Letter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Letter Types</SelectItem>
                {LETTER_TYPES.map((lt) => (
                  <SelectItem key={lt} value={lt}>
                    {lt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employee Type Filter */}
            <Select value={employeeTypeFilter} onValueChange={setEmployeeTypeFilter}>
              <SelectTrigger className="h-8.5 text-xs rounded-lg w-[130px]">
                <SelectValue placeholder="Employee Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employee Types</SelectItem>
                <SelectItem value="Consultant">Consultant</SelectItem>
                <SelectItem value="FTE">FTE</SelectItem>
                <SelectItem value="Intern">Intern</SelectItem>
                <SelectItem value="Apprentice">Apprentice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Template List Table */}
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground">Loading letter templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground text-sm">No letter templates found</p>
            <p className="text-muted-foreground text-xs">Try adjusting your filters or click Create Template.</p>
            <div className="pt-2">
              <Button onClick={openCreateModal} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create First Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/10 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <TableHead className="w-[300px]">Template Name</TableHead>
                  <TableHead>Letter Type</TableHead>
                  <TableHead>Employee Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((tpl) => (
                  <TableRow key={tpl.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs text-foreground flex items-center gap-2">
                          <span>{tpl.name}</span>
                          {tpl.addendum_type && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                              {tpl.addendum_type}
                            </Badge>
                          )}
                        </p>
                        {tpl.description && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-sm">{tpl.description}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {tpl.letter_type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        {tpl.employee_type_name}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          tpl.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {tpl.status === 'active' ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(tpl.updated_at).toLocaleDateString()}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            try {
                              toast.info(`Generating PDF for ${tpl.name}...`);
                              await downloadDocumentAsPdf(tpl.name, tpl.name, tpl.content);
                              toast.success(`Downloaded ${tpl.name}.pdf`);
                            } catch (e) {
                              toast.error('Failed to generate PDF');
                            }
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPreview(tpl)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(tpl)}
                          className="h-7 text-xs font-semibold rounded-lg px-2.5 gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={async () => {
                                try {
                                  toast.info(`Generating PDF for ${tpl.name}...`);
                                  await downloadDocumentAsPdf(tpl.name, tpl.name, tpl.content);
                                  toast.success(`Downloaded ${tpl.name}.pdf`);
                                } catch (e) {
                                  toast.error('Failed to generate PDF');
                                }
                              }}
                              className="text-xs cursor-pointer gap-2 font-medium"
                            >
                              <Download className="h-3.5 w-3.5 text-indigo-600" />
                              <span>Download PDF</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                downloadDocumentAsWord(tpl.name, tpl.name, tpl.content);
                                toast.success(`Downloaded ${tpl.name}.doc`);
                              }}
                              className="text-xs cursor-pointer gap-2"
                            >
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Download Word (.doc)</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => openEditModal(tpl)} className="text-xs cursor-pointer gap-2">
                              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Edit Template</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => openPreview(tpl)} className="text-xs cursor-pointer gap-2">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Preview Document</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleToggleArchive(tpl.id, tpl.status)}
                              className="text-xs cursor-pointer gap-2"
                            >
                              {tpl.status === 'active' ? (
                                <>
                                  <Archive className="h-3.5 w-3.5 text-amber-600" />
                                  <span>Archive Template</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Restore to Active</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      <Dialog open={editorModalOpen} onOpenChange={setEditorModalOpen}>
        <DialogContent
          className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] sm:w-[90vw] h-[90vh] max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden"
          style={{ width: '90vw', maxWidth: '90vw', height: '90vh', maxHeight: '90vh' }}
        >
          <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>{editingTemplateId ? 'Edit Letter Template' : 'Create New Letter Template'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define the template name, categorize by Letter & Employee Type, and customize placeholder content.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Top Row: Template Name & Types */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5 sm:col-span-3">
                <Label className="text-xs font-semibold">Template Name *</Label>
                <Input
                  placeholder="e.g., Consultant Offer Letter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Letter Type *</Label>
                <Select
                  value={formData.letter_type}
                  onValueChange={(val: LetterType) => setFormData({ ...formData, letter_type: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-lg">
                    <SelectValue placeholder="Select type" />
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Applicable Employee Type *</Label>
                <Select
                  value={formData.employee_type_name}
                  onValueChange={(val: string) => setFormData({ ...formData, employee_type_name: val })}
                >
                  <SelectTrigger className="h-9 text-xs rounded-lg">
                    <SelectValue placeholder="Select employee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="FTE">FTE (Full-Time Employee)</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Apprentice">Apprentice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.letter_type === 'Addendum' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Addendum Category *</Label>
                  <Select
                    value={formData.addendum_type}
                    onValueChange={(val: AddendumType) => setFormData({ ...formData, addendum_type: val })}
                  >
                    <SelectTrigger className="h-9 text-xs rounded-lg">
                      <SelectValue placeholder="Addendum type" />
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
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Description (Optional)</Label>
                  <Input
                    placeholder="Short summary of this template's use case"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Quick Placeholders Bar */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Insert Placeholders</span>
                </span>
                <span className="text-[10px] text-muted-foreground">Click any placeholder to append into editor</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {STANDARD_PLACEHOLDERS.map((p) => (
                  <button
                    key={p.placeholder}
                    type="button"
                    onClick={() => insertPlaceholder(p.placeholder)}
                    title={p.description}
                    className="px-2 py-0.5 rounded-md bg-card border border-border/80 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-mono transition-colors"
                  >
                    {p.placeholder}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Letter Template Content (HTML / Rich Text) *</Label>
                <span className="text-[10px] text-muted-foreground">{'Supports HTML tags & {{placeholders}}'}</span>
              </div>
              <Textarea
                rows={14}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="font-mono text-xs rounded-xl p-3 leading-relaxed"
                placeholder="Enter letter template body with HTML tags..."
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPreviewContent(formData.content);
                setPreviewModalOpen(true);
              }}
              className="rounded-lg text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Preview Rendered
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditorModalOpen(false)}
              className="rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PREVIEW MODAL */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent
          className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] sm:w-[90vw] h-[90vh] max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden"
          style={{ width: '90vw', maxWidth: '90vw', height: '90vh', maxHeight: '90vh' }}
        >
          <DialogHeader className="p-4 border-b border-border/60 bg-muted/20 shrink-0">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-600" />
              <span>Document Preview</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-zinc-900/80">
            <DocumentLetterhead contentHtml={previewContent} />
          </div>
          <DialogFooter className="p-3 border-t border-border/60 bg-muted/20 shrink-0 gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                if (selectedPreviewTemplate) {
                  try {
                    toast.info(`Generating PDF for ${selectedPreviewTemplate.name}...`);
                    await downloadDocumentAsPdf(
                      selectedPreviewTemplate.name,
                      selectedPreviewTemplate.name,
                      previewContent
                    );
                    toast.success(`Downloaded ${selectedPreviewTemplate.name}.pdf`);
                  } catch (e) {
                    toast.error('Failed to generate PDF');
                  }
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
              onClick={() => {
                if (selectedPreviewTemplate) {
                  downloadDocumentAsWord(
                    selectedPreviewTemplate.name,
                    selectedPreviewTemplate.name,
                    previewContent
                  );
                  toast.success(`Downloaded ${selectedPreviewTemplate.name}.doc`);
                }
              }}
              className="rounded-lg text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Download Word (.doc)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewModalOpen(false)}
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
