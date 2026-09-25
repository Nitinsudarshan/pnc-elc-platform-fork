'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  FileText,
  Search,
  Download,
  Printer,
  Eye,
  Building,
  User,
  Calendar,
  Sparkles,
  ArrowLeft,
  Mail,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { CandidateLetter } from '@/lib/letter-templates/types';
import { DocumentLetterhead } from '@/components/shared/document-letterhead';
import { downloadDocumentAsPdf } from '@/lib/letter-templates/download';
import { toast } from 'sonner';

export default function LettersLibraryPage() {
  const [letters, setLetters] = useState<CandidateLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<CandidateLetter | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/candidate-letters');
      const json = await res.json();
      if (json.success && json.data) {
        setLetters(json.data);
      } else {
        toast.error('Failed to load candidate letters');
      }
    } catch (e) {
      toast.error('Network error loading letters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const openLetter = (letter: CandidateLetter) => {
    setSelectedLetter(letter);
    setViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredLetters = letters.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.candidate_name.toLowerCase().includes(s) ||
      l.template_name.toLowerCase().includes(s) ||
      l.letter_type.toLowerCase().includes(s) ||
      l.employee_type_name.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Header Banner */}
      <PageBanner
        title="Candidate Letters"
        description="Central library of all formal offers, acceptance letters, and addendums customized and generated for candidates."
        icon={<FileCheck2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold rounded-lg text-xs">
              <Link href="/manage/letter-templates">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Manage Templates</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 shadow-sm font-semibold rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/onboarding/candidate/new">
                <span>Issue New Letter</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main Table Card */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by candidate, letter name, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs rounded-lg"
            />
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Total Generated Letters: <span className="font-bold text-foreground">{filteredLetters.length}</span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground">Loading candidate letters...</div>
        ) : filteredLetters.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground text-sm">No candidate letters found</p>
            <p className="text-muted-foreground text-xs">Letters customized during candidate onboarding will appear here.</p>
            <div className="pt-2">
              <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs">
                <Link href="/onboarding/candidate/new">Issue First Letter</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/10 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <TableHead className="w-[280px]">Candidate Details</TableHead>
                  <TableHead>Letter Document</TableHead>
                  <TableHead>Letter Category</TableHead>
                  <TableHead>Employee Type</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLetters.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border shrink-0">
                          <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                            {l.candidate_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{l.candidate_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{l.candidate_email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <button
                          onClick={() => openLetter(l)}
                          className="font-medium text-xs text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-left block truncate max-w-xs"
                        >
                          {l.template_name}
                        </button>
                        {l.addendum_type && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                            {l.addendum_type} Addendum
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {l.letter_type}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        {l.employee_type_name}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(l.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const dateStr = new Date(l.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            });
                            try {
                              toast.info(`Generating PDF for ${l.candidate_name}...`);
                              await downloadDocumentAsPdf(
                                `${l.candidate_name} - ${l.template_name}`,
                                l.template_name,
                                l.content,
                                {
                                  refNumber: `NG-LTR-${l.id.slice(0, 8).toUpperCase()}`,
                                  date: dateStr,
                                }
                              );
                              toast.success(`Downloaded ${l.candidate_name} letter.pdf`);
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
                          variant="outline"
                          onClick={() => openLetter(l)}
                          className="h-7 text-xs font-semibold rounded-lg px-2.5 gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* VIEW / PRINT LETTER MODAL */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent
          className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] sm:w-[90vw] h-[90vh] max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden"
          style={{ width: '90vw', maxWidth: '90vw', height: '90vh', maxHeight: '90vh' }}
        >
          <DialogHeader className="p-4 border-b border-border/60 bg-muted/20 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span>{selectedLetter?.template_name}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Issued for {selectedLetter?.candidate_name} ({selectedLetter?.employee_type_name})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-zinc-900/80">
            <DocumentLetterhead
              refNumber={`NG-LTR-${selectedLetter?.id.slice(0, 8).toUpperCase()}`}
              date={
                selectedLetter
                  ? new Date(selectedLetter.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : undefined
              }
              contentHtml={selectedLetter?.content || ''}
            />
          </div>

          <DialogFooter className="p-3 border-t border-border/60 bg-muted/20 shrink-0 gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                if (selectedLetter) {
                  const dateStr = new Date(selectedLetter.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                  try {
                    toast.info(`Generating PDF for ${selectedLetter.candidate_name}...`);
                    await downloadDocumentAsPdf(
                      `${selectedLetter.candidate_name} - ${selectedLetter.template_name}`,
                      selectedLetter.template_name,
                      selectedLetter.content,
                      {
                        refNumber: `NG-LTR-${selectedLetter.id.slice(0, 8).toUpperCase()}`,
                        date: dateStr,
                      }
                    );
                    toast.success(`Downloaded PDF for ${selectedLetter.candidate_name}`);
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
              onClick={handlePrint}
              className="rounded-lg text-xs gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewModalOpen(false)}
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
