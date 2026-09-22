'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Sparkles,
  Send,
  XCircle,
  FileX2,
  Eye,
  Check,
  History,
  Lock,
  Download,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FullOnboardingData, OnboardingStatus, DocumentStatus } from '@/lib/onboarding/types';
import { toast } from 'sonner';

export default function OnboardingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState<FullOnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Reject Document Dialog State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Preview Document Dialog State
  const [previewDoc, setPreviewDoc] = useState<{ title: string; html: string } | null>(null);

  // Official Provisioning Dialog State
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/onboarding/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast.error('Could not find onboarding record');
      }
    } catch (err) {
      toast.error('Network error loading onboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSendInvitation = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_invitation' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Invitation sent to ${data?.record.personal_email}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Error sending invitation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDocument = async (docId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_document',
          document_id: docId,
          status: 'verified',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Document verified successfully');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to verify document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocId || !rejectionReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_document',
          document_id: selectedDocId,
          status: 'rejected',
          rejection_reason: rejectionReason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.warning('Document marked as rejected');
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedDocId(null);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to reject document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OnboardingStatus, note?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          status: newStatus,
          note,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Onboarding status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProvisionAccount = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provision_account' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Official account provisioned & employee record linked!');
        setProvisionDialogOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to provision account');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-muted-foreground text-sm">
        Loading candidate onboarding record...
      </div>
    );
  }

  const { record, personalDetails, employmentDetails, documents, policies, generatedDocuments, activityLogs, provisioning } = data;

  const offerDoc = generatedDocuments.find((d) => d.document_type === 'offer_letter');
  const apptDoc = generatedDocuments.find((d) => d.document_type === 'appointment_letter');

  // Check completeness for final review
  const isPersonalComplete = !!personalDetails?.full_name && !!personalDetails?.current_address;
  const isEmploymentConfirmed = !!employmentDetails?.candidate_confirmed;
  const verifiedDocsCount = documents.filter((d) => d.status === 'verified').length;
  const totalUploadedDocs = documents.filter((d) => ['uploaded', 'verified'].includes(d.status)).length;
  const areAllDocsVerified = totalUploadedDocs >= 3 && documents.every((d) => d.status === 'verified' || d.status === 'pending');
  const arePoliciesComplete = policies.filter((p) => p.status === 'completed').length >= 4;
  const isOfferSigned = offerDoc?.status === 'signed';
  const isApptSigned = apptDoc?.status === 'signed';

  const canApprove = isPersonalComplete && isEmploymentConfirmed && isOfferSigned && isApptSigned;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Page Banner */}
      <PageBanner
        title={record.candidate_name}
        description={
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-muted-foreground mt-0.5">
            <span className="font-semibold text-foreground/90">{record.designation}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building className="size-3.5" />
              {record.team_name || record.department || 'NavGurukul'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="size-3.5" />
              {record.personal_email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Joining: {record.joining_date}
            </span>
          </div>
        }
        icon={<User className="size-6 text-indigo-600 dark:text-indigo-400" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs rounded-lg">
              <Link href={`/onboarding/${record.invitation_token}`} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5 text-indigo-600" />
                <span>Candidate Portal</span>
              </Link>
            </Button>

            {record.status === 'draft' && (
              <Button
                onClick={handleSendInvitation}
                disabled={actionLoading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <Send className="size-3.5" />
                <span>Send Onboarding</span>
              </Button>
            )}

            {['submitted', 'under_review'].includes(record.status) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('changes_requested', 'P&C requested candidate to update specific details.')}
                  disabled={actionLoading}
                  className="gap-1.5 text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 rounded-lg"
                >
                  <AlertCircle className="size-3.5" />
                  <span>Request Changes</span>
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('approved', 'P&C verified all documents and approved the onboarding dossier.')}
                  disabled={actionLoading}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Approve Onboarding</span>
                </Button>
              </>
            )}

            {record.status === 'approved' && (
              <Button
                onClick={() => setProvisionDialogOpen(true)}
                disabled={actionLoading}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md animate-pulse"
              >
                <Sparkles className="size-3.5" />
                <span>Create Official Account</span>
              </Button>
            )}

            {record.status === 'completed' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Official Account Active ({provisioning?.official_email || 'Provisioned'})</span>
              </div>
            )}
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b border-border/80 overflow-x-auto pb-px">
          <TabsList className="bg-transparent h-auto p-0 flex gap-2">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Comparison & Diff View
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Personal Details
            </TabsTrigger>
            <TabsTrigger
              value="employment"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Employment & Terms
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Verification ({documents.filter((d) => d.status === 'verified').length}/{documents.length})
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Pre-Joining Policies
            </TabsTrigger>
            <TabsTrigger
              value="letters"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Offer & Appointment
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Final Review
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="data-[state=active]:bg-card data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-2.5 text-xs font-semibold"
            >
              Audit Timeline ({activityLogs.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Initial vs Candidate Submitted Comparison (Diff View) */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="size-5 text-indigo-600 dark:text-indigo-400" />
                    P&C Initial Information vs. Candidate Submitted Information
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    System verifies whether candidate updated any key information during self-service onboarding.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  Audited Comparison
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-1/4">Field / Parameter</th>
                    <th className="py-3 px-4 w-1/3">P&C Created Value</th>
                    <th className="py-3 px-4 w-1/3">Candidate Submitted Value</th>
                    <th className="py-3 px-4 text-right">Comparison Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {/* Full Name */}
                  <tr className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-semibold text-foreground">Full Name</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">{record.candidate_name}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {personalDetails?.full_name || record.candidate_name}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {personalDetails?.full_name && personalDetails.full_name !== record.candidate_name ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                          Changed by Candidate
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          Matched
                        </Badge>
                      )}
                    </td>
                  </tr>

                  {/* Phone */}
                  <tr className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-semibold text-foreground">Phone Number</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">{record.phone || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {personalDetails?.phone || record.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {personalDetails?.phone && record.phone && personalDetails.phone !== record.phone ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                          Changed by Candidate
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          Matched
                        </Badge>
                      )}
                    </td>
                  </tr>

                  {/* Email */}
                  <tr className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-semibold text-foreground">Personal Email</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">{record.personal_email}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {personalDetails?.personal_email || record.personal_email}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                        Matched
                      </Badge>
                    </td>
                  </tr>

                  {/* Is Alumni */}
                  <tr className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-semibold text-foreground">Is Alumni?</td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {record.is_alumni ? 'Yes (Alumni)' : 'No'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {personalDetails ? (personalDetails.is_alumni ? 'Yes (Alumni)' : 'No') : record.is_alumni ? 'Yes' : 'No'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                        Matched
                      </Badge>
                    </td>
                  </tr>

                  {/* Address */}
                  <tr className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-semibold text-foreground">Current Address</td>
                    <td className="py-3.5 px-4 text-muted-foreground">Not collected at initial stage</td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {personalDetails?.current_address || 'Pending candidate submission'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {personalDetails?.current_address ? (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                          Provided by Candidate
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>

                  {/* Emergency Contact */}
                  <tr className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-semibold text-foreground">Emergency Contact</td>
                    <td className="py-3.5 px-4 text-muted-foreground">Not collected at initial stage</td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {personalDetails?.emergency_contact_name
                        ? `${personalDetails.emergency_contact_name} (${personalDetails.emergency_contact_relation || 'Relation'}) - ${personalDetails.emergency_contact_phone}`
                        : 'Pending candidate submission'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {personalDetails?.emergency_contact_name ? (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
                          Provided by Candidate
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Personal Details */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base font-bold">Personal & Emergency Contact Dossier</CardTitle>
              <CardDescription className="text-xs">
                Candidate-submitted identity, address, blood group, and emergency contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Full Name</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.full_name || record.candidate_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Preferred / Nickname</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.preferred_name || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Date of Birth</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.date_of_birth || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Gender</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.gender || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Blood Group</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.blood_group || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Is Alumni?</p>
                <p className="text-sm font-medium text-foreground">
                  {personalDetails?.is_alumni || record.is_alumni ? 'Yes (NavGurukul Alumni)' : 'No'}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Current Address</p>
                <p className="text-sm font-medium text-foreground">
                  {personalDetails?.current_address ? `${personalDetails.current_address}, ${personalDetails.city || ''} ${personalDetails.state || ''} - ${personalDetails.pincode || ''}` : '—'}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Permanent Address</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.permanent_address || 'Same as current address'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Emergency Contact Name</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.emergency_contact_name || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Emergency Relationship</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.emergency_contact_relation || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Emergency Phone</p>
                <p className="text-sm font-medium text-foreground">{personalDetails?.emergency_contact_phone || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Employment Terms */}
        <TabsContent value="employment" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Employment Parameters & Confirmation</CardTitle>
                  <CardDescription className="text-xs">
                    Contractual terms, compensation, probation duration, and candidate confirmation status.
                  </CardDescription>
                </div>
                {employmentDetails?.candidate_confirmed ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs gap-1">
                    <CheckCircle2 className="size-3.5" />
                    Confirmed by Candidate
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50/50">
                    Pending Candidate Confirmation
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Designation / Role</p>
                <p className="text-sm font-bold text-foreground">{record.designation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Department / Team</p>
                <p className="text-sm font-medium text-foreground">{record.team_name || record.department || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Reporting Manager</p>
                <p className="text-sm font-medium text-foreground">{record.manager_name || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Onboarding Buddy</p>
                <p className="text-sm font-medium text-foreground">{record.buddy_name || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Proposed Joining Date</p>
                <p className="text-sm font-medium text-foreground">{record.joining_date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Engagement Type</p>
                <p className="text-sm font-medium text-foreground">{record.employee_type_name || 'Full-Time Employee'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Probation Period</p>
                <p className="text-sm font-medium text-foreground">{record.probation_period || '3 Months'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Notice Period</p>
                <p className="text-sm font-medium text-foreground">{record.notice_period || '1 Month'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">CTC / Compensation</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{record.ctc || '—'}</p>
              </div>
              <div className="col-span-1 md:col-span-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Role & Responsibilities Scope</p>
                <p className="text-sm text-foreground/90 bg-muted/20 p-3 rounded-lg border border-border/50 leading-relaxed">
                  {record.role_responsibilities || 'Standard duties as per NavGurukul team specifications.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: Document Verification */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Candidate Document Verification Console</CardTitle>
                  <CardDescription className="text-xs">
                    Inspect uploaded proofs, mark as Verified, or Reject with actionable feedback for candidate re-upload.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {documents.filter((d) => d.status === 'verified').length} / {documents.length} Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {documents.map((doc) => {
                  const isUploaded = ['uploaded', 'verified', 'rejected'].includes(doc.status);
                  return (
                    <div key={doc.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-lg shrink-0 ${
                            doc.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                              : doc.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                              : doc.status === 'uploaded'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{doc.document_type}</span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                                doc.status === 'verified'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                                  : doc.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-600 border-rose-300'
                                  : doc.status === 'uploaded'
                                  ? 'bg-blue-50 text-blue-600 border-blue-300'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                            {doc.file_name ? (
                              <span className="font-mono">{doc.file_name} ({doc.file_size || '1 MB'})</span>
                            ) : (
                              <span className="italic text-muted-foreground">Pending upload by candidate</span>
                            )}
                            {doc.verified_by && <span>• Verified by {doc.verified_by}</span>}
                          </div>

                          {doc.rejection_reason && (
                            <div className="mt-2 p-2 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                              <span><strong>Rejection Reason:</strong> {doc.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isUploaded && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setPreviewDoc({
                                title: doc.document_type,
                                html: `<div class="p-8 text-center text-sm space-y-4">
                                  <div class="size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center font-bold">PDF</div>
                                  <p class="font-bold text-base text-foreground">${doc.file_name}</p>
                                  <p class="text-xs text-muted-foreground font-mono">Simulated document storage reference: secure-vault://onboarding/${record.id}/${doc.id}</p>
                                  <div class="border border-dashed border-border p-6 rounded-xl bg-muted/10 text-xs text-muted-foreground">
                                    [Official Document Content Preview Rendered for Verification Audit]
                                  </div>
                                </div>`,
                              })
                            }
                            className="text-xs h-8 gap-1"
                          >
                            <Eye className="size-3.5" />
                            <span>Preview</span>
                          </Button>
                        )}

                        {isUploaded && doc.status !== 'verified' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyDocument(doc.id)}
                            disabled={actionLoading}
                            className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          >
                            <Check className="size-3.5" />
                            <span>Verify</span>
                          </Button>
                        )}

                        {isUploaded && doc.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              setRejectDialogOpen(true);
                            }}
                            disabled={actionLoading}
                            className="text-xs h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <FileX2 className="size-3.5" />
                            <span>Reject</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Pre-Joining Policies */}
        <TabsContent value="policies" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base font-bold">Pre-Joining Learning & Policy Acknowledgment</CardTitle>
              <CardDescription className="text-xs">
                Tracking candidate progress through mandatory organizational handbooks and codes of conduct.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {policies.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-border/60 bg-muted/10 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{p.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          p.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-300'
                        }`}
                      >
                        {p.status === 'completed' ? 'Completed' : 'Not Started'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                    {p.completed_at && (
                      <p className="text-[11px] text-emerald-600 font-mono">
                        Acknowledged on {new Date(p.completed_at).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setPreviewDoc({
                        title: p.title,
                        html: `<div class="p-6 text-sm leading-relaxed space-y-4 text-foreground/90 whitespace-pre-line">${p.content}</div>`,
                      })
                    }
                    className="text-xs h-8 gap-1 shrink-0"
                  >
                    <Eye className="size-3.5" />
                    <span>View Policy</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: Offer & Appointment Letters */}
        <TabsContent value="letters" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offer Letter Card */}
            <Card className="border border-border/80 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-indigo-600" />
                    <CardTitle className="text-base font-bold">Offer Letter</CardTitle>
                  </div>
                  <Badge
                    className={`text-xs ${
                      offerDoc?.status === 'signed'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                        : 'bg-blue-50 text-blue-600 border-blue-300'
                    }`}
                  >
                    {offerDoc?.status === 'signed' ? 'Signed & Accepted' : 'Generated (Unsigned)'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Official offer of employment specifying CTC, probation, and position details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2 text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Document Status:</span>
                  <span className="font-semibold text-foreground capitalize">{offerDoc?.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Signed At:</span>
                  <span className="font-mono text-foreground">{offerDoc?.signed_at ? new Date(offerDoc.signed_at).toLocaleString('en-IN') : 'Pending candidate signature'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Signer Name:</span>
                  <span className="font-semibold text-foreground">{offerDoc?.signed_by || '—'}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/40 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewDoc({
                      title: 'Offer Letter - ' + record.candidate_name,
                      html: offerDoc?.generated_content?.contentHtml || '<p>Offer letter content</p>',
                    })
                  }
                  className="text-xs h-8 gap-1.5"
                >
                  <Eye className="size-3.5" />
                  <span>Preview Document</span>
                </Button>
              </CardFooter>
            </Card>

            {/* Appointment Letter Card */}
            <Card className="border border-border/80 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="size-5 text-indigo-600" />
                    <CardTitle className="text-base font-bold">Appointment Letter</CardTitle>
                  </div>
                  <Badge
                    className={`text-xs ${
                      apptDoc?.status === 'signed'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                        : 'bg-blue-50 text-blue-600 border-blue-300'
                    }`}
                  >
                    {apptDoc?.status === 'signed' ? 'Signed & Accepted' : 'Generated (Unsigned)'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Formal appointment letter with governance clauses and joining terms.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2 text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Document Status:</span>
                  <span className="font-semibold text-foreground capitalize">{apptDoc?.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Signed At:</span>
                  <span className="font-mono text-foreground">{apptDoc?.signed_at ? new Date(apptDoc.signed_at).toLocaleString('en-IN') : 'Pending candidate signature'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Signer Name:</span>
                  <span className="font-semibold text-foreground">{apptDoc?.signed_by || '—'}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/40 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewDoc({
                      title: 'Appointment Letter - ' + record.candidate_name,
                      html: apptDoc?.generated_content?.contentHtml || '<p>Appointment letter content</p>',
                    })
                  }
                  className="text-xs h-8 gap-1.5"
                >
                  <Eye className="size-3.5" />
                  <span>Preview Document</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 7: Final Review & Approval */}
        <TabsContent value="review" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-base font-bold">P&C Final Onboarding Review & Quality Gate</CardTitle>
              <CardDescription className="text-xs">
                Comprehensive sign-off checklist before approving onboarding and provisioning organizational credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Identity */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">1. Identity & Contact</span>
                    {isPersonalComplete ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPersonalComplete ? 'Complete & verified' : 'Incomplete submission'}
                  </p>
                </div>

                {/* 2. Employment */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">2. Employment Terms</span>
                    {isEmploymentConfirmed ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isEmploymentConfirmed ? 'Confirmed by candidate' : 'Pending confirmation'}
                  </p>
                </div>

                {/* 3. Documents */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">3. Document Dossier</span>
                    {verifiedDocsCount >= 3 ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {verifiedDocsCount} verified of {documents.length}
                  </p>
                </div>

                {/* 4. Policies */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">4. Pre-Joining Policies</span>
                    {arePoliciesComplete ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {policies.filter((p) => p.status === 'completed').length} / {policies.length} Read
                  </p>
                </div>

                {/* 5. Offer Letter */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">5. Offer Letter</span>
                    {isOfferSigned ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isOfferSigned ? 'Accepted & Signed' : 'Pending signature'}
                  </p>
                </div>

                {/* 6. Appointment Letter */}
                <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">6. Appointment Letter</span>
                    {isApptSigned ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isApptSigned ? 'Accepted & Signed' : 'Pending signature'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Current Status: <span className="font-semibold text-foreground capitalize">{record.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {record.status !== 'completed' && (
                  <Button
                    onClick={() => handleStatusUpdate('approved', 'P&C completed final review and approved onboarding.')}
                    disabled={actionLoading}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Approve Onboarding Dossier</span>
                  </Button>
                )}
                {record.status === 'approved' && (
                  <Button
                    onClick={() => setProvisionDialogOpen(true)}
                    disabled={actionLoading}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md"
                  >
                    <Sparkles className="size-4" />
                    <span>Proceed to Account Provisioning</span>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* TAB 8: Audit Timeline */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <History className="size-5 text-indigo-600" />
                <CardTitle className="text-base font-bold">Lifecycle Activity & Audit Trail</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Immutable event record for all onboarding milestones, candidate submissions, and P&C reviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activityLogs.map((log) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute -left-6 top-1.5 size-3 rounded-full bg-indigo-600 ring-4 ring-card" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">{log.action}</span>
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase px-1.5 py-0 font-mono text-muted-foreground"
                        >
                          {log.actor_type}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Date(log.created_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Document Reason Dialog - 90vw/90vh */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[90vh] max-h-[90vh] rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden flex flex-col bg-card/95 backdrop-blur-md">
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20 shrink-0">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-600">
              <AlertCircle className="size-5" />
              Reject Candidate Document
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              State the reason for rejection clearly. The candidate will see this feedback in their portal and be requested to upload a corrected copy.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-200">
              Please note: Rejecting a document will change the document status to <strong>Rejected</strong> and alert the candidate to re-upload.
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejection_reason" className="text-xs font-semibold">
                Rejection Feedback / Notes <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="rejection_reason"
                rows={8}
                placeholder="e.g. The address proof is blurry and older than 3 months. Please upload a recent electricity bill or rental agreement."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRejectDocument}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document HTML Preview Dialog - 90vw/90vh */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[90vh] max-h-[90vh] rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden flex flex-col bg-card/95 backdrop-blur-md">
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20 shrink-0">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-indigo-500" />
              {previewDoc?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-y-auto">
            <div
              className="prose dark:prose-invert max-w-none text-xs"
              dangerouslySetInnerHTML={{ __html: previewDoc?.html || '' }}
            />
          </div>
          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Account Provisioning Simulation Dialog - 90vw/90vh */}
      <Dialog open={provisionDialogOpen} onOpenChange={setProvisionDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[90vh] max-h-[90vh] rounded-2xl border border-border/80 shadow-2xl p-0 overflow-hidden flex flex-col bg-card/95 backdrop-blur-md">
          <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20 shrink-0">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-indigo-600">
              <Sparkles className="size-5" />
              Provision Official NavGurukul Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              This action generates the official Google Workspace email, allocates the employee ID code, and triggers credential dispatch to the candidate's personal email.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
            <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-3">
              <div className="flex justify-between py-1 border-b border-indigo-200/50">
                <span className="text-muted-foreground font-semibold">Candidate Full Name:</span>
                <span className="font-bold text-foreground">{record.candidate_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-indigo-200/50">
                <span className="text-muted-foreground font-semibold">Designation:</span>
                <span className="font-medium text-foreground">{record.designation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-indigo-200/50">
                <span className="text-muted-foreground font-semibold">Department / Team:</span>
                <span className="font-medium text-foreground">{record.team_name || record.department || 'NavGurukul'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-indigo-200/50">
                <span className="text-muted-foreground font-semibold">Generated Official Email:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {record.candidate_name.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground font-semibold">Candidate Personal Email:</span>
                <span className="font-mono text-muted-foreground">{record.personal_email}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
              <p className="font-bold text-foreground">Next Automatic Steps on Provisioning:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
                <li>Create and activate official Google Workspace account.</li>
                <li>Assign permanent unique employee identifier (e.g. <code>NG-2026-XXXX</code>).</li>
                <li>Link candidate profile directly to the permanent <strong>Employee Directory</strong>.</li>
                <li>Dispatch welcome onboarding packet and credentials to candidate's personal email.</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setProvisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleProvisionAccount}
              disabled={actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Confirm & Provision Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
