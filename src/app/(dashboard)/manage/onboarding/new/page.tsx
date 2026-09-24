'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  ArrowLeft,
  Building,
  User,
  Calendar,
  Briefcase,
  IndianRupee,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  FileText,
  MapPin,
} from 'lucide-react';
import { PageBanner } from '@/components/shared/page-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Department } from '@/lib/departments/types';
import { Campus } from '@/lib/campuses/types';
import { EmploymentType } from '@/lib/employment-types/types';

export default function CreateOnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Master Data
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<{ id: string; name: string; code: string }[]>([]);

  useEffect(() => {
    // Fetch active departments
    fetch('/api/departments?includeArchived=false')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setDepartments(json.data);
        }
      })
      .catch(() => {});

    // Fetch active campuses
    fetch('/api/campuses?includeClosed=false')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCampuses(json.data);
        }
      })
      .catch(() => {});

    // Fetch active employment types
    fetch('/api/employment-types?includeArchived=false')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setEmploymentTypes(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    candidate_name: 'Rahul Kumar',
    personal_email: 'rahul.personal@example.com',
    phone: '+91 98765 43210',
    designation: 'Software Engineer',
    department: 'Tech & Product',
    team_name: 'Tech & Product',
    manager_name: 'Nitin Sudarshan',
    buddy_name: 'Rohit Verma',
    location: 'Bangalore',
    employee_type_name: 'Full-Time Employee (FTE)',
    joining_date: '2026-10-01',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹12,00,000 PA',
    is_alumni: false,
    role_responsibilities:
      'Architect and build resilient microservices, maintain web applications for student cohorts, and collaborate on peer-learning platforms.',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, sendNow: boolean = false) => {
    e.preventDefault();
    if (!formData.candidate_name || !formData.personal_email || !formData.designation || !formData.joining_date) {
      toast.error('Please fill in all mandatory fields (*)');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success && json.data) {
        const createdId = json.data.record.id;
        toast.success(`Onboarding created for ${formData.candidate_name}`);

        if (sendNow) {
          const sendRes = await fetch(`/api/onboarding/${createdId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send_invitation' }),
          });
          const sendJson = await sendRes.json();
          if (sendJson.success) {
            toast.success(`Invitation link generated and sent to ${formData.personal_email}`);
          }
        }

        // Land back at /manage/onboarding
        router.push('/manage/onboarding');
      } else {
        toast.error(json.error || 'Failed to create onboarding');
      }
    } catch (err) {
      toast.error('Network error creating onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 animate-in fade-in duration-300">
      {/* Banner */}
      <PageBanner
        title="Create Candidate Onboarding"
        description="Initiate the post-selection onboarding record. Generates Offer & Appointment documents and creates the candidate invitation dossier."
        icon={<UserPlus className="h-8 w-8 text-indigo-500" />}
        actions={
          <Link href="/manage/onboarding">
            <Button variant="outline" size="sm" className="rounded-lg gap-1.5 h-9">
              <ArrowLeft className="h-4 w-4" />
              Cancel & Return
            </Button>
          </Link>
        }
      />

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Section 1: Candidate Identity */}
        <Card className="rounded-lg border border-border/80 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <User className="size-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base font-bold">1. Candidate Identity & Contact</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Primary candidate details for generation of offer letters and account provisioning.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidate_name" className="text-xs font-semibold">
                Candidate Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="candidate_name"
                className="rounded-lg"
                placeholder="e.g. Priya Sharma"
                value={formData.candidate_name}
                onChange={(e) => handleChange('candidate_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personal_email" className="text-xs font-semibold">
                Personal Email Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="personal_email"
                type="email"
                className="rounded-lg"
                placeholder="e.g. priya.candidate@gmail.com"
                value={formData.personal_email}
                onChange={(e) => handleChange('personal_email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                className="rounded-lg"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end pb-1.5">
              <div className="flex items-center justify-between border border-border/80 rounded-lg p-2.5 bg-muted/20">
                <div className="space-y-0.5">
                  <Label htmlFor="is_alumni" className="text-xs font-semibold cursor-pointer">
                    NavGurukul Alumni / Former Student
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Enable if the candidate graduated from a residential campus cohort.
                  </p>
                </div>
                <Switch
                  id="is_alumni"
                  checked={formData.is_alumni}
                  onCheckedChange={(checked) => handleChange('is_alumni', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Role, Team & Hierarchy */}
        <Card className="rounded-lg border border-border/80 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Briefcase className="size-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base font-bold">2. Position & Organization Assignment</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Assign designation, department, campus location, reporting manager, and onboarding buddy.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation" className="text-xs font-semibold">
                Job Role / Designation <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="designation"
                className="rounded-lg"
                placeholder="e.g. Software Engineer"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                required
              />
            </div>

            {/* Dynamic Departments */}
            <div className="space-y-2">
              <Label htmlFor="team_name" className="text-xs font-semibold">
                Department / Team
              </Label>
              <Select
                value={formData.team_name}
                onValueChange={(val) => {
                  handleChange('team_name', val);
                  handleChange('department', val);
                }}
              >
                <SelectTrigger id="team_name" className="rounded-lg">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name} className="rounded-lg">
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="AI LAB">AI LAB</SelectItem>
                      <SelectItem value="CEO Office">CEO Office</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                      <SelectItem value="PnC">PnC</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Sama">Sama</SelectItem>
                      <SelectItem value="SOSC">SOSC</SelectItem>
                      <SelectItem value="Tech & Product">Tech & Product</SelectItem>
                      <SelectItem value="Zuvy">Zuvy</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager_name" className="text-xs font-semibold">
                Reporting Manager
              </Label>
              <Select
                value={formData.manager_name}
                onValueChange={(val) => handleChange('manager_name', val)}
              >
                <SelectTrigger id="manager_name" className="rounded-lg">
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Nitin Sudarshan">Nitin Sudarshan (Engineering Lead)</SelectItem>
                  <SelectItem value="Sharmistha Mazumdar">Sharmistha Mazumdar (P&C Lead)</SelectItem>
                  <SelectItem value="Rohit Verma">Rohit Verma (Operations Manager)</SelectItem>
                  <SelectItem value="Ananya Sen">Ananya Sen (Programs Manager)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buddy_name" className="text-xs font-semibold">
                Onboarding Buddy / Peer Mentor
              </Label>
              <Select
                value={formData.buddy_name}
                onValueChange={(val) => handleChange('buddy_name', val)}
              >
                <SelectTrigger id="buddy_name" className="rounded-lg">
                  <SelectValue placeholder="Select Buddy" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Rohit Verma">Rohit Verma</SelectItem>
                  <SelectItem value="Priya Nair">Priya Nair</SelectItem>
                  <SelectItem value="Vikram Patel">Vikram Patel</SelectItem>
                  <SelectItem value="Sharmistha Mazumdar">Sharmistha Mazumdar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Campuses */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-semibold">
                Work Location / Campus
              </Label>
              <Select
                value={formData.location}
                onValueChange={(val) => handleChange('location', val)}
              >
                <SelectTrigger id="location" className="rounded-lg">
                  <SelectValue placeholder="Select Campus / Location" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {campuses.length > 0 ? (
                    campuses.map((camp) => (
                      <SelectItem key={camp.id} value={camp.name} className="rounded-lg">
                        {camp.name} Campus
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Bangalore">Bangalore Campus</SelectItem>
                      <SelectItem value="Dantewada">Dantewada Campus</SelectItem>
                      <SelectItem value="Dharamshala">Dharamshala Campus</SelectItem>
                      <SelectItem value="Jashpur">Jashpur Campus</SelectItem>
                      <SelectItem value="Kishanganj">Kishanganj Campus</SelectItem>
                      <SelectItem value="Pune">Pune Campus</SelectItem>
                      <SelectItem value="Raigarh">Raigarh Campus</SelectItem>
                      <SelectItem value="Igatpuri">Igatpuri Campus</SelectItem>
                    </>
                  )}
                  <SelectItem value="Remote / Hybrid">Remote / Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Employment Types */}
            <div className="space-y-2">
              <Label htmlFor="employee_type_name" className="text-xs font-semibold">
                Employment / Engagement Type
              </Label>
              <Select
                value={formData.employee_type_name}
                onValueChange={(val) => handleChange('employee_type_name', val)}
              >
                <SelectTrigger id="employee_type_name" className="rounded-lg">
                  <SelectValue placeholder="Select Engagement Type" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {employmentTypes.length > 0 ? (
                    employmentTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name} className="rounded-lg">
                        {t.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Full-Time Employee (FTE)">Full-Time Employee (FTE)</SelectItem>
                      <SelectItem value="Full-Time Consultant (FTC)">Full-Time Consultant (FTC)</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Independent Contractor">Independent Contractor</SelectItem>
                      <SelectItem value="Apprentice (Tech)">Apprentice (Tech)</SelectItem>
                      <SelectItem value="Apprentice (Non-Tech)">Apprentice (Non-Tech)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Compensation, Terms & Responsibilities */}
        <Card className="rounded-lg border border-border/80 shadow-xs">
          <CardHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <IndianRupee className="size-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base font-bold">3. Terms, Compensation & Responsibilities</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Joining timeline, compensation, probation and notice clauses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="joining_date" className="text-xs font-semibold">
                Proposed Joining Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="joining_date"
                type="date"
                className="rounded-lg"
                value={formData.joining_date}
                onChange={(e) => handleChange('joining_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctc" className="text-xs font-semibold">
                Annual CTC / Compensation Structure
              </Label>
              <Input
                id="ctc"
                className="rounded-lg"
                placeholder="e.g. ₹12,00,000 PA"
                value={formData.ctc}
                onChange={(e) => handleChange('ctc', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probation_period" className="text-xs font-semibold">
                Probation Duration
              </Label>
              <Select
                value={formData.probation_period}
                onValueChange={(val) => handleChange('probation_period', val)}
              >
                <SelectTrigger id="probation_period" className="rounded-lg">
                  <SelectValue placeholder="Select Probation" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="3 Months">3 Months</SelectItem>
                  <SelectItem value="6 Months">6 Months</SelectItem>
                  <SelectItem value="None (Direct Confirmation)">None (Direct Confirmation)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notice_period" className="text-xs font-semibold">
                Notice Period Duration
              </Label>
              <Select
                value={formData.notice_period}
                onValueChange={(val) => handleChange('notice_period', val)}
              >
                <SelectTrigger id="notice_period" className="rounded-lg">
                  <SelectValue placeholder="Select Notice" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="1 Month">1 Month</SelectItem>
                  <SelectItem value="2 Months">2 Months</SelectItem>
                  <SelectItem value="3 Months">3 Months</SelectItem>
                  <SelectItem value="15 Days">15 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="role_responsibilities" className="text-xs font-semibold">
                Key Roles & Responsibilities Description
              </Label>
              <Textarea
                id="role_responsibilities"
                rows={3}
                className="rounded-lg"
                placeholder="Describe key duties, deliverables, and team expectations..."
                value={formData.role_responsibilities}
                onChange={(e) => handleChange('role_responsibilities', e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/manage/onboarding')}
              disabled={submitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="secondary"
                disabled={submitting}
                className="gap-1.5 rounded-lg"
              >
                <FileText className="size-4" />
                <span>Save as Draft</span>
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
              >
                <Send className="size-4" />
                <span>Create & Send Onboarding</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
