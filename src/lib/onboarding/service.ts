import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  OnboardingRecord,
  OnboardingPersonalDetails,
  OnboardingEmploymentDetails,
  OnboardingDocument,
  OnboardingPolicy,
  OnboardingGeneratedDocument,
  OnboardingActivityLog,
  EmployeeAccountProvisioning,
  EmployeeOrientationChecklist,
  ProbationMilestone,
  EmployeeProbationMilestones,
  FullOnboardingData,
  OnboardingStatus,
  DocumentStatus,
} from './types';
import { DEFAULT_PREJOINING_POLICIES } from './default-policies';
import { generateOfferLetterData, generateAppointmentLetterData } from './templates';
import { auditOnboarding, auditLetters } from '@/lib/audit/events';
import {
  buildProbationSchedule,
  MILESTONE_DEFINITIONS,
  MILESTONE_KEYS,
  type MilestoneKey,
} from './probation-scheduling';

/**
 * Audit subject for an onboarding record.
 *
 * A candidate has no employee ID until provisioning mints one, so the personal
 * email is the durable join key that links pre-hire events to the rest of the
 * person's history. Once provisioned, the official employee code is carried too.
 */
function auditSubject(record: OnboardingRecord) {
  return {
    employee_id: record.employee_id || null,
    employee_email: record.personal_email,
    employee_name: record.candidate_name,
  };
}

/**
 * A 10:00–10:45 local-time slot on the given date, as ISO instants.
 * Used by the seed data so demo check-ins read as morning slots regardless of
 * the server's timezone, the same way the auto-scheduler builds real ones.
 */
function localMorningSlot(date: string, hour = 10, durationMinutes = 45) {
  const start = new Date(`${date}T00:00:00`);
  start.setHours(hour, 0, 0, 0);
  return {
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + durationMinutes * 60000).toISOString(),
  };
}

export function generateInvitationToken(candidateName: string): string {
  // Generate 8-character unique alphanumeric token (e.g., "k7m3p9q2")
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let tokenPrefix = '';
  for (let i = 0; i < 8; i++) {
    tokenPrefix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const slug = (candidateName || 'candidate')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${tokenPrefix}-${slug}`;
}

// In-Memory fallback store populated with realistic seed data
let MEMORY_ONBOARDING_STORE: Map<string, FullOnboardingData> = new Map();

function initSeedData() {
  if (MEMORY_ONBOARDING_STORE.size > 0) return;

  // 1. Draft Record: Kavita Rao
  const kavitaId = '11111111-1111-1111-1111-111111111111';
  const kavitaRecord: OnboardingRecord = {
    id: kavitaId,
    candidate_name: 'Kavita Rao',
    personal_email: 'kavita.rao@example.com',
    phone: '+91 98765 43210',
    designation: 'UI/UX Designer',
    department: 'Design',
    team_name: 'Design',
    manager_name: 'Rohit Verma',
    buddy_name: 'Priya Nair',
    location: 'Bangalore / Hybrid',
    employee_type_name: 'Full-Time Employee',
    joining_date: '2026-10-15',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹8,50,000 PA',
    is_alumni: false,
    role_responsibilities: 'Responsible for creating user-centric design systems, web wireframes, and design specs for student-facing educational platforms.',
    status: 'draft',
    progress_percentage: 0,
    invitation_token: 'k8m2q7x1-kavita-rao',
    created_by: 'Sharmistha Mazumdar',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  };

  const kavitaGeneratedDocs: OnboardingGeneratedDocument[] = [
    {
      id: 'doc-gen-1',
      onboarding_id: kavitaId,
      document_type: 'offer_letter',
      document_name: 'Offer Letter - Kavita Rao',
      status: 'generated',
      generated_content: generateOfferLetterData(kavitaRecord),
      created_at: new Date().toISOString(),
    },
    {
      id: 'doc-gen-2',
      onboarding_id: kavitaId,
      document_type: 'appointment_letter',
      document_name: 'Appointment Letter - Kavita Rao',
      status: 'generated',
      generated_content: generateAppointmentLetterData(kavitaRecord),
      created_at: new Date().toISOString(),
    },
  ];

  const kavitaPolicies: OnboardingPolicy[] = DEFAULT_PREJOINING_POLICIES.map((p, idx) => ({
    id: `pol-kavita-${idx}`,
    onboarding_id: kavitaId,
    ...p,
  }));

  const kavitaDocs: OnboardingDocument[] = [
    { id: 'k-doc-1', onboarding_id: kavitaId, document_type: 'Resume / CV', file_name: '', status: 'pending' },
    { id: 'k-doc-2', onboarding_id: kavitaId, document_type: 'Identity Proof (Aadhaar/PAN/Passport)', file_name: '', status: 'pending' },
    { id: 'k-doc-3', onboarding_id: kavitaId, document_type: 'Address Proof (Electricity/Rent Agreement)', file_name: '', status: 'pending' },
    { id: 'k-doc-4', onboarding_id: kavitaId, document_type: 'Highest Educational Certificate', file_name: '', status: 'pending' },
    { id: 'k-doc-5', onboarding_id: kavitaId, document_type: 'Bank Account Proof (Cancelled Cheque/Passbook)', file_name: '', status: 'pending' },
  ];

  MEMORY_ONBOARDING_STORE.set(kavitaId, {
    record: kavitaRecord,
    documents: kavitaDocs,
    policies: kavitaPolicies,
    generatedDocuments: kavitaGeneratedDocs,
    activityLogs: [
      {
        id: 'log-k-1',
        onboarding_id: kavitaId,
        actor_type: 'pnc',
        action: 'Onboarding Draft Created',
        description: 'P&C created initial onboarding draft for Kavita Rao (UI/UX Designer).',
        created_at: kavitaRecord.created_at,
      },
    ],
  });

  // 2. In Progress Record: Aarav Sharma (Discrepancy: Phone + Is Alumni = true)
  const aaravId = '22222222-2222-2222-2222-222222222222';
  const aaravRecord: OnboardingRecord = {
    id: aaravId,
    candidate_name: 'Aarav Sharma',
    personal_email: 'aarav.sharma@example.com',
    phone: '+91 98111 22334',
    designation: 'Software Engineer',
    department: 'Engineering',
    team_name: 'Engineering',
    manager_name: 'Nitin Sudarshan',
    buddy_name: 'Rohit Verma',
    location: 'Delhi / Remote',
    employee_type_name: 'Full-Time Employee',
    joining_date: '2026-10-01',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹10,00,000 PA',
    is_alumni: true,
    role_responsibilities: 'Develop scalable backend microservices and maintain core student management pipelines in Next.js and Supabase.',
    status: 'in_progress',
    progress_percentage: 85,
    invitation_token: 'k7m3p9q2-aarav-sharma',
    invited_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    first_visited_at: new Date(Date.now() - 86400000 * 2.8).toISOString(),
    last_visited_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    visit_count: 3,
    created_by: 'Nitin Sudarshan',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  const aaravPersonal: OnboardingPersonalDetails = {
    id: 'pers-aarav-1',
    onboarding_id: aaravId,
    full_name: 'Aarav Sharma',
    preferred_name: 'Aaru',
    date_of_birth: '1999-04-12',
    gender: 'Male',
    blood_group: 'O+',
    phone: '+91 98999 88776', // Discrepancy from initial '+91 98111 22334'
    personal_email: 'aarav.sharma@example.com',
    is_alumni: true,
    current_address: 'Flat 402, Sunshine Apartments, Indiranagar',
    permanent_address: 'House 12, Gandhi Road, Jaipur',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    emergency_contact_name: 'Suresh Sharma',
    emergency_contact_relation: 'Father',
    emergency_contact_phone: '+91 94140 12345',
    emergency_contact_email: 'suresh.sharma@example.com',
  };

  const aaravEmployment: OnboardingEmploymentDetails = {
    id: 'emp-aarav-1',
    onboarding_id: aaravId,
    designation: 'Software Engineer',
    department: 'Engineering',
    team_name: 'Engineering',
    manager_name: 'Nitin Sudarshan',
    buddy_name: 'Rohit Verma',
    location: 'Delhi / Remote',
    joining_date: '2026-10-01',
    employee_type_name: 'Full-Time Employee',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹10,00,000 PA',
    is_alumni: true,
    role_responsibilities: aaravRecord.role_responsibilities,
    candidate_confirmed: true,
    candidate_confirmed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  };

  const aaravDocs: OnboardingDocument[] = [
    {
      id: 'a-doc-1',
      onboarding_id: aaravId,
      document_type: 'Resume / CV',
      file_name: 'Aarav_Sharma_Resume_2026.pdf',
      file_size: '245 KB',
      status: 'verified',
      uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      verified_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      verified_by: 'Sharmistha Mazumdar',
    },
    {
      id: 'a-doc-2',
      onboarding_id: aaravId,
      document_type: 'Identity Proof (Aadhaar/PAN/Passport)',
      file_name: 'Aadhaar_Card_Aarav.pdf',
      file_size: '1.2 MB',
      status: 'verified',
      uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      verified_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      verified_by: 'Sharmistha Mazumdar',
    },
    {
      id: 'a-doc-3',
      onboarding_id: aaravId,
      document_type: 'Address Proof (Electricity/Rent Agreement)',
      file_name: 'Electricity_Bill_Bangalore.pdf',
      file_size: '890 KB',
      status: 'rejected',
      rejection_reason: 'Address proof is blurry and older than 3 months. Please upload a recent electricity bill or registered rent agreement.',
      uploaded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      verified_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      verified_by: 'Sharmistha Mazumdar',
    },
    {
      id: 'a-doc-4',
      onboarding_id: aaravId,
      document_type: 'Highest Educational Certificate',
      file_name: 'BTech_Degree_Certificate.pdf',
      file_size: '3.4 MB',
      status: 'uploaded',
      uploaded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'a-doc-5',
      onboarding_id: aaravId,
      document_type: 'Bank Account Proof (Cancelled Cheque/Passbook)',
      file_name: 'HDFC_Passbook_Front.pdf',
      file_size: '1.1 MB',
      status: 'uploaded',
      uploaded_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const aaravPolicies: OnboardingPolicy[] = DEFAULT_PREJOINING_POLICIES.map((p, idx) => ({
    id: `pol-aarav-${idx}`,
    onboarding_id: aaravId,
    ...p,
    status: idx < 4 ? 'completed' : 'in_progress',
    completed_at: idx < 4 ? new Date(Date.now() - 86400000 * 2).toISOString() : undefined,
  }));

  const aaravGeneratedDocs: OnboardingGeneratedDocument[] = [
    {
      id: 'doc-gen-a1',
      onboarding_id: aaravId,
      document_type: 'offer_letter',
      document_name: 'Offer Letter - Aarav Sharma',
      status: 'signed',
      signed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      signed_by: 'Aarav Sharma',
      generated_content: generateOfferLetterData(aaravRecord),
      created_at: aaravRecord.created_at,
    },
    {
      id: 'doc-gen-a2',
      onboarding_id: aaravId,
      document_type: 'appointment_letter',
      document_name: 'Appointment Letter - Aarav Sharma',
      status: 'viewed',
      generated_content: generateAppointmentLetterData(aaravRecord),
      created_at: aaravRecord.created_at,
    },
  ];

  MEMORY_ONBOARDING_STORE.set(aaravId, {
    record: aaravRecord,
    personalDetails: aaravPersonal,
    employmentDetails: aaravEmployment,
    documents: aaravDocs,
    policies: aaravPolicies,
    generatedDocuments: aaravGeneratedDocs,
    activityLogs: [
      {
        id: 'log-a-1',
        onboarding_id: aaravId,
        actor_type: 'pnc',
        action: 'Onboarding Created',
        description: 'P&C created onboarding record for Aarav Sharma.',
        created_at: aaravRecord.created_at,
      },
      {
        id: 'log-a-2',
        onboarding_id: aaravId,
        actor_type: 'pnc',
        action: 'Invitation Sent',
        description: 'Onboarding invitation link sent to candidate personal email.',
        created_at: aaravRecord.invited_at!,
      },
      {
        id: 'log-a-visit-1',
        onboarding_id: aaravId,
        actor_type: 'candidate',
        action: 'Candidate Portal First Accessed',
        description: 'Candidate accessed self-service onboarding portal for the first time.',
        created_at: aaravRecord.first_visited_at!,
      },
      {
        id: 'log-a-3',
        onboarding_id: aaravId,
        actor_type: 'candidate',
        action: 'Personal Details Updated',
        description: 'Candidate completed and saved personal details form.',
        created_at: new Date(Date.now() - 86400000 * 2.5).toISOString(),
      },
      {
        id: 'log-a-visit-2',
        onboarding_id: aaravId,
        actor_type: 'candidate',
        action: 'Candidate Portal Accessed',
        description: 'Candidate revisited onboarding portal (Visit #2) to sign documents.',
        created_at: new Date(Date.now() - 86400000 * 2.1).toISOString(),
      },
      {
        id: 'log-a-4',
        onboarding_id: aaravId,
        actor_type: 'candidate',
        action: 'Offer Letter Accepted & Signed',
        description: 'Candidate digitally reviewed and signed Offer Letter.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'log-a-5',
        onboarding_id: aaravId,
        actor_type: 'pnc',
        action: 'Document Rejected',
        description: 'Address proof rejected: Blurry copy older than 3 months.',
        created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      },
      {
        id: 'log-a-visit-3',
        onboarding_id: aaravId,
        actor_type: 'candidate',
        action: 'Candidate Portal Accessed',
        description: 'Candidate accessed portal (Visit #3) to review rejected address proof feedback.',
        created_at: aaravRecord.last_visited_at!,
      },
    ],
  });

  // 3. Submitted Record: Priya Singh (100% complete, awaiting P&C review)
  const priyaId = '33333333-3333-3333-3333-333333333333';
  const priyaRecord: OnboardingRecord = {
    id: priyaId,
    candidate_name: 'Priya Singh',
    personal_email: 'priya.singh@example.com',
    phone: '+91 97777 66554',
    designation: 'Program Associate',
    department: 'Programs',
    team_name: 'PnC',
    manager_name: 'Ananya Sen',
    buddy_name: 'Sharmistha Mazumdar',
    location: 'Pune / Campus',
    employee_type_name: 'Full-Time Employee',
    joining_date: '2026-10-06',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹6,50,000 PA',
    is_alumni: true,
    role_responsibilities: 'Coordinate residential campus learning programs, student mentorship cohorts, and track academic outcomes.',
    status: 'submitted',
    progress_percentage: 100,
    invitation_token: 'p9x4b1m7-priya-singh',
    invited_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    first_visited_at: new Date(Date.now() - 86400000 * 4.8).toISOString(),
    last_visited_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    visit_count: 4,
    submitted_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    created_by: 'Sharmistha Mazumdar',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  };

  const priyaPersonal: OnboardingPersonalDetails = {
    id: 'pers-priya-1',
    onboarding_id: priyaId,
    full_name: 'Priya Singh',
    preferred_name: 'Priya',
    date_of_birth: '2001-08-20',
    gender: 'Female',
    blood_group: 'B+',
    phone: '+91 97777 66554',
    personal_email: 'priya.singh@example.com',
    is_alumni: true,
    current_address: 'NavGurukul Campus, Village Sarole',
    permanent_address: 'Qtr 4B, Sector 2, Bokaro Steel City',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '412205',
    emergency_contact_name: 'Rajesh Singh',
    emergency_contact_relation: 'Father',
    emergency_contact_phone: '+91 98351 99887',
    emergency_contact_email: 'rajesh.singh@example.com',
  };

  const priyaEmployment: OnboardingEmploymentDetails = {
    id: 'emp-priya-1',
    onboarding_id: priyaId,
    designation: 'Program Associate',
    department: 'Programs',
    team_name: 'PnC',
    manager_name: 'Ananya Sen',
    buddy_name: 'Sharmistha Mazumdar',
    location: 'Pune / Campus',
    joining_date: '2026-10-06',
    employee_type_name: 'Full-Time Employee',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹6,50,000 PA',
    is_alumni: true,
    role_responsibilities: priyaRecord.role_responsibilities,
    candidate_confirmed: true,
    candidate_confirmed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  const priyaDocs: OnboardingDocument[] = [
    { id: 'p-doc-1', onboarding_id: priyaId, document_type: 'Resume / CV', file_name: 'Priya_Singh_CV.pdf', file_size: '310 KB', status: 'uploaded', uploaded_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'p-doc-2', onboarding_id: priyaId, document_type: 'Identity Proof (Aadhaar/PAN/Passport)', file_name: 'Priya_Passport.pdf', file_size: '1.5 MB', status: 'uploaded', uploaded_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'p-doc-3', onboarding_id: priyaId, document_type: 'Address Proof (Electricity/Rent Agreement)', file_name: 'Voter_ID_Card.pdf', file_size: '750 KB', status: 'uploaded', uploaded_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'p-doc-4', onboarding_id: priyaId, document_type: 'Highest Educational Certificate', file_name: 'BA_Degree_Final.pdf', file_size: '2.1 MB', status: 'uploaded', uploaded_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'p-doc-5', onboarding_id: priyaId, document_type: 'Bank Account Proof (Cancelled Cheque/Passbook)', file_name: 'Cancelled_Cheque_HDFC.pdf', file_size: '600 KB', status: 'uploaded', uploaded_at: new Date(Date.now() - 86400000).toISOString() },
  ];

  const priyaPolicies: OnboardingPolicy[] = DEFAULT_PREJOINING_POLICIES.map((p, idx) => ({
    id: `pol-priya-${idx}`,
    onboarding_id: priyaId,
    ...p,
    status: 'completed',
    completed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  }));

  const priyaGeneratedDocs: OnboardingGeneratedDocument[] = [
    {
      id: 'doc-gen-p1',
      onboarding_id: priyaId,
      document_type: 'offer_letter',
      document_name: 'Offer Letter - Priya Singh',
      status: 'signed',
      signed_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      signed_by: 'Priya Singh',
      generated_content: generateOfferLetterData(priyaRecord),
      created_at: priyaRecord.created_at,
    },
    {
      id: 'doc-gen-p2',
      onboarding_id: priyaId,
      document_type: 'appointment_letter',
      document_name: 'Appointment Letter - Priya Singh',
      status: 'signed',
      signed_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      signed_by: 'Priya Singh',
      generated_content: generateAppointmentLetterData(priyaRecord),
      created_at: priyaRecord.created_at,
    },
  ];

  MEMORY_ONBOARDING_STORE.set(priyaId, {
    record: priyaRecord,
    personalDetails: priyaPersonal,
    employmentDetails: priyaEmployment,
    documents: priyaDocs,
    policies: priyaPolicies,
    generatedDocuments: priyaGeneratedDocs,
    activityLogs: [
      { id: 'log-p-1', onboarding_id: priyaId, actor_type: 'pnc', action: 'Onboarding Created', description: 'P&C created onboarding record.', created_at: priyaRecord.created_at },
      { id: 'log-p-2', onboarding_id: priyaId, actor_type: 'pnc', action: 'Invitation Sent', description: 'Invitation sent to candidate.', created_at: priyaRecord.invited_at! },
      { id: 'log-p-visit-1', onboarding_id: priyaId, actor_type: 'candidate', action: 'Candidate Portal First Accessed', description: 'Candidate opened self-service portal for the first time.', created_at: priyaRecord.first_visited_at! },
      { id: 'log-p-visit-2', onboarding_id: priyaId, actor_type: 'candidate', action: 'Candidate Portal Accessed', description: 'Candidate revisited portal (Visit #2) to upload documents.', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'log-p-3', onboarding_id: priyaId, actor_type: 'candidate', action: 'Policies Completed', description: 'Candidate read and acknowledged all pre-joining policies.', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'log-p-visit-3', onboarding_id: priyaId, actor_type: 'candidate', action: 'Candidate Portal Accessed', description: 'Candidate revisited portal (Visit #3) for digital signing.', created_at: new Date(Date.now() - 3600000 * 6).toISOString() },
      { id: 'log-p-4', onboarding_id: priyaId, actor_type: 'candidate', action: 'Offer & Appointment Letters Signed', description: 'Candidate accepted and signed employment documents.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'log-p-5', onboarding_id: priyaId, actor_type: 'candidate', action: 'Onboarding Submitted to P&C', description: 'Candidate submitted complete onboarding dossier for verification.', created_at: priyaRecord.submitted_at! },
      { id: 'log-p-visit-4', onboarding_id: priyaId, actor_type: 'candidate', action: 'Candidate Portal Accessed', description: 'Candidate revisited portal (Visit #4) to check verification status.', created_at: priyaRecord.last_visited_at! },
    ],
  });

  // 4. Completed Record: Rahul Kumar (Fully completed + Official Account Provisioned + Employee Record Linked)
  const rahulId = '44444444-4444-4444-4444-444444444444';
  const rahulRecord: OnboardingRecord = {
    id: rahulId,
    candidate_name: 'Rahul Kumar',
    personal_email: 'rahul.personal@example.com',
    phone: '+91 91234 56789',
    designation: 'Operations Associate',
    department: 'Operations',
    team_name: 'Operations',
    manager_name: 'Rohit Verma',
    buddy_name: 'Vikram Patel',
    location: 'Dharamshala / Campus',
    employee_type_name: 'Full-Time Consultant',
    joining_date: '2026-10-10',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹6,00,000 PA',
    is_alumni: false,
    role_responsibilities: 'Oversee campus facility logistics, food supply procurement, vendor settlements, and student residential safety protocols.',
    status: 'completed',
    progress_percentage: 100,
    invitation_token: 'r2m8q4x9-rahul-kumar',
    invited_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    first_visited_at: new Date(Date.now() - 86400000 * 9.5).toISOString(),
    last_visited_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    visit_count: 5,
    submitted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    approved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_by: 'Nitin Sudarshan',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  const rahulPersonal: OnboardingPersonalDetails = {
    id: 'pers-rahul-1',
    onboarding_id: rahulId,
    full_name: 'Rahul Kumar',
    preferred_name: 'Rahul',
    date_of_birth: '1998-11-15',
    gender: 'Male',
    blood_group: 'A+',
    phone: '+91 91234 56789',
    personal_email: 'rahul.personal@example.com',
    is_alumni: false,
    current_address: 'NavGurukul Campus, Dharamshala',
    permanent_address: 'Flat 101, Green Heights, Lucknow',
    city: 'Dharamshala',
    state: 'Himachal Pradesh',
    pincode: '176215',
    emergency_contact_name: 'Manoj Kumar',
    emergency_contact_relation: 'Brother',
    emergency_contact_phone: '+91 94150 77889',
    emergency_contact_email: 'manoj.kumar@example.com',
  };

  const rahulEmployment: OnboardingEmploymentDetails = {
    id: 'emp-rahul-1',
    onboarding_id: rahulId,
    designation: 'Operations Associate',
    department: 'Operations',
    team_name: 'Operations',
    manager_name: 'Rohit Verma',
    buddy_name: 'Vikram Patel',
    location: 'Dharamshala / Campus',
    joining_date: '2026-10-10',
    employee_type_name: 'Full-Time Consultant',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹6,00,000 PA',
    is_alumni: false,
    role_responsibilities: rahulRecord.role_responsibilities,
    candidate_confirmed: true,
    candidate_confirmed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  };

  const rahulDocs: OnboardingDocument[] = [
    { id: 'r-doc-1', onboarding_id: rahulId, document_type: 'Resume / CV', file_name: 'Rahul_Kumar_Operations.pdf', file_size: '280 KB', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(), verified_at: new Date(Date.now() - 86400000 * 2).toISOString(), verified_by: 'Nitin Sudarshan' },
    { id: 'r-doc-2', onboarding_id: rahulId, document_type: 'Identity Proof (Aadhaar/PAN/Passport)', file_name: 'Aadhaar_Rahul.pdf', file_size: '950 KB', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(), verified_at: new Date(Date.now() - 86400000 * 2).toISOString(), verified_by: 'Nitin Sudarshan' },
    { id: 'r-doc-3', onboarding_id: rahulId, document_type: 'Address Proof (Electricity/Rent Agreement)', file_name: 'Rent_Agreement_Dharamshala.pdf', file_size: '1.8 MB', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(), verified_at: new Date(Date.now() - 86400000 * 2).toISOString(), verified_by: 'Nitin Sudarshan' },
    { id: 'r-doc-4', onboarding_id: rahulId, document_type: 'Highest Educational Certificate', file_name: 'BCom_Final_Degree.pdf', file_size: '2.5 MB', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(), verified_at: new Date(Date.now() - 86400000 * 2).toISOString(), verified_by: 'Nitin Sudarshan' },
    { id: 'r-doc-5', onboarding_id: rahulId, document_type: 'Bank Account Proof (Cancelled Cheque/Passbook)', file_name: 'SBI_Passbook.pdf', file_size: '720 KB', status: 'verified', uploaded_at: new Date(Date.now() - 86400000 * 4).toISOString(), verified_at: new Date(Date.now() - 86400000 * 2).toISOString(), verified_by: 'Nitin Sudarshan' },
  ];

  const rahulPolicies: OnboardingPolicy[] = DEFAULT_PREJOINING_POLICIES.map((p, idx) => ({
    id: `pol-rahul-${idx}`,
    onboarding_id: rahulId,
    ...p,
    status: 'completed',
    completed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }));

  const rahulGeneratedDocs: OnboardingGeneratedDocument[] = [
    {
      id: 'doc-gen-r1',
      onboarding_id: rahulId,
      document_type: 'offer_letter',
      document_name: 'Offer Letter - Rahul Kumar',
      status: 'signed',
      signed_at: new Date(Date.now() - 86400000 * 3.5).toISOString(),
      signed_by: 'Rahul Kumar',
      generated_content: generateOfferLetterData(rahulRecord),
      created_at: rahulRecord.created_at,
    },
    {
      id: 'doc-gen-r2',
      onboarding_id: rahulId,
      document_type: 'appointment_letter',
      document_name: 'Appointment Letter - Rahul Kumar',
      status: 'signed',
      signed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      signed_by: 'Rahul Kumar',
      generated_content: generateAppointmentLetterData(rahulRecord),
      created_at: rahulRecord.created_at,
    },
  ];

  const rahulProvisioning: EmployeeAccountProvisioning = {
    id: 'prov-rahul-1',
    onboarding_id: rahulId,
    official_email: 'rahul.kumar@navgurukul.org',
    employee_id_code: 'NG-2026-00124',
    status: 'active',
    credentials_delivery_status: 'sent',
    provisioned_at: rahulRecord.completed_at!,
    created_at: rahulRecord.approved_at!,
    orientation_checklist: {
      welcome_email_sent: true,
      welcome_email_sent_at: rahulRecord.completed_at,
      it_assets_assigned: true,
      it_assets_notes: 'MacBook Air M2 (Asset ID: NG-LAP-2026-042) + Headset issued',
      slack_access_granted: true,
      buddy_introduced: true,
      manager_1on1_done: true,
      pnc_induction_done: true,
      posh_training_completed: true,
    },
    probation_milestones: {
      day_30: {
        status: 'completed',
        due_date: '2026-11-10',
        completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        reviewer_name: 'Rohit Verma',
        notes: 'Great culture fit and strong ownership in campus ops.',
      },
      day_60: {
        status: 'scheduled',
        due_date: '2026-12-10',
        // Built from a local 10:00 so the demo slot reads as a morning slot in
        // whatever timezone the app runs in, matching what the scheduler produces.
        starts_at: localMorningSlot('2026-12-10').startsAt,
        ends_at: localMorningSlot('2026-12-10').endsAt,
        reviewer_name: 'Rohit Verma',
        auto_scheduled: true,
        notes: 'Mid-probation review against the first-90-days plan and agreed goals.',
        scheduling_note: "First open slot in the manager's morning on the target day.",
      },
    },
  };

  MEMORY_ONBOARDING_STORE.set(rahulId, {
    record: rahulRecord,
    personalDetails: rahulPersonal,
    employmentDetails: rahulEmployment,
    documents: rahulDocs,
    policies: rahulPolicies,
    generatedDocuments: rahulGeneratedDocs,
    provisioning: rahulProvisioning,
    activityLogs: [
      { id: 'log-r-1', onboarding_id: rahulId, actor_type: 'pnc', action: 'Onboarding Created', description: 'P&C created onboarding record for Rahul Kumar.', created_at: rahulRecord.created_at },
      { id: 'log-r-2', onboarding_id: rahulId, actor_type: 'pnc', action: 'Invitation Sent', description: 'Invitation link sent.', created_at: rahulRecord.invited_at! },
      { id: 'log-r-visit-1', onboarding_id: rahulId, actor_type: 'candidate', action: 'Candidate Portal First Accessed', description: 'Candidate opened portal for the first time.', created_at: rahulRecord.first_visited_at! },
      { id: 'log-r-visit-2', onboarding_id: rahulId, actor_type: 'candidate', action: 'Candidate Portal Accessed', description: 'Candidate revisited portal (Visit #2) and submitted all personal details.', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 'log-r-3', onboarding_id: rahulId, actor_type: 'candidate', action: 'Onboarding Submitted', description: 'Candidate completed all onboarding steps and submitted dossier.', created_at: rahulRecord.submitted_at! },
      { id: 'log-r-4', onboarding_id: rahulId, actor_type: 'pnc', action: 'Documents Verified', description: 'P&C verified all 5 required documents.', created_at: rahulRecord.approved_at! },
      { id: 'log-r-5', onboarding_id: rahulId, actor_type: 'pnc', action: 'Onboarding Approved', description: 'P&C completed final review and approved onboarding dossier.', created_at: rahulRecord.approved_at! },
      { id: 'log-r-6', onboarding_id: rahulId, actor_type: 'system', action: 'Official Account Provisioned', description: 'Created rahul.kumar@navgurukul.org (Employee Code: NG-2026-00124) and sent credentials to candidate personal email.', created_at: rahulRecord.completed_at! },
      { id: 'log-r-7', onboarding_id: rahulId, actor_type: 'system', action: 'Employee Record Linked', description: 'Onboarding record linked to permanent Employee Directory entity.', created_at: rahulRecord.completed_at! },
    ],
  });

  // 5. Approved Record (Ready for IT Provisioning): Ananya Mishra
  const ananyaId = '55555555-5555-5555-5555-555555555555';
  const ananyaRecord: OnboardingRecord = {
    id: ananyaId,
    candidate_name: 'Ananya Mishra',
    personal_email: 'ananya.mishra.work@gmail.com',
    phone: '+91 98222 11223',
    designation: 'Curriculum Specialist',
    department: 'Academia',
    team_name: 'Academia',
    manager_name: 'Ananya Sen',
    buddy_name: 'Rohit Verma',
    location: 'Bangalore / Hybrid',
    employee_type_name: 'Full-Time Employee',
    joining_date: '2026-10-05',
    probation_period: '3 Months',
    notice_period: '1 Month',
    ctc: '₹9,00,000 PA',
    is_alumni: false,
    role_responsibilities: 'Design and review Python & web engineering curriculum modules for undergraduate fellowship learners.',
    status: 'approved',
    progress_percentage: 100,
    invitation_token: 'm4q8z2x1-ananya-mishra',
    invited_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    submitted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    approved_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    created_by: 'Sharmistha Mazumdar',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  };

  MEMORY_ONBOARDING_STORE.set(ananyaId, {
    record: ananyaRecord,
    documents: [],
    policies: [],
    generatedDocuments: [],
    activityLogs: [
      { id: 'log-an-1', onboarding_id: ananyaId, actor_type: 'pnc', action: 'Onboarding Approved', description: 'P&C approved all documents. Awaiting IT Account Provisioning.', created_at: ananyaRecord.approved_at! },
    ],
  });
}

// Ensure seed data initialized
initSeedData();

// Service Layer Methods

export async function getAllOnboardingRecords(): Promise<OnboardingRecord[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('onboarding_records')
      .select('*, teams(name), employees!manager_id(name), employee_types(name)')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        ...row,
        team_name: row.teams?.name,
        manager_name: row.employees?.name,
        employee_type_name: row.employee_types?.name,
      }));
    }
  } catch (err) {
    // Fallback to memory store
  }

  return Array.from(MEMORY_ONBOARDING_STORE.values())
    .map((item) => item.record)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOnboardingById(idOrToken: string): Promise<FullOnboardingData | null> {
  try {
    const supabase = await createServerSupabaseClient();
    let { data: record, error } = await supabase
      .from('onboarding_records')
      .select('*, teams(name), employees!manager_id(name), employee_types(name)')
      .eq('id', idOrToken)
      .maybeSingle();

    if (!record) {
      const tokenRes = await supabase
        .from('onboarding_records')
        .select('*, teams(name), employees!manager_id(name), employee_types(name)')
        .eq('invitation_token', idOrToken)
        .maybeSingle();
      record = tokenRes.data;
    }

    if (!error && record) {
      const id = record.id;
      const [pers, emp, docs, pols, genDocs, logs, prov] = await Promise.all([
        supabase.from('onboarding_personal_details').select('*').eq('onboarding_id', id).maybeSingle(),
        supabase.from('onboarding_employment_details').select('*').eq('onboarding_id', id).maybeSingle(),
        supabase.from('onboarding_documents').select('*').eq('onboarding_id', id).order('created_at'),
        supabase.from('onboarding_policies').select('*').eq('onboarding_id', id).order('created_at'),
        supabase.from('onboarding_documents_generated').select('*').eq('onboarding_id', id),
        supabase.from('onboarding_activity_log').select('*').eq('onboarding_id', id).order('created_at', { ascending: false }),
        supabase.from('employee_account_provisioning').select('*').eq('onboarding_id', id).maybeSingle(),
      ]);

      return {
        record: {
          ...record,
          team_name: record.teams?.name,
          manager_name: record.employees?.name,
          employee_type_name: record.employee_types?.name,
        },
        personalDetails: pers.data || undefined,
        employmentDetails: emp.data || undefined,
        documents: docs.data || [],
        policies: pols.data || [],
        generatedDocuments: genDocs.data || [],
        activityLogs: logs.data || [],
        provisioning: prov.data || undefined,
      };
    }
  } catch (err) {
    // Fallback to memory store
  }

  const existing = MEMORY_ONBOARDING_STORE.get(idOrToken);
  if (existing) return JSON.parse(JSON.stringify(existing));

  for (const item of MEMORY_ONBOARDING_STORE.values()) {
    if (item.record.invitation_token === idOrToken || item.record.id === idOrToken) {
      return JSON.parse(JSON.stringify(item));
    }
  }
  return null;
}

export async function getOnboardingByToken(token: string): Promise<FullOnboardingData | null> {
  return getOnboardingById(token);
}

export async function recordPortalVisit(
  tokenOrId: string,
  metadata?: { ip?: string; userAgent?: string }
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(tokenOrId);
  if (!data) return null;

  const now = new Date().toISOString();
  const isFirstVisit = !data.record.first_visited_at || !data.record.visit_count;

  if (isFirstVisit) {
    data.record.first_visited_at = now;
    data.record.last_visited_at = now;
    data.record.visit_count = 1;
    if (data.record.status === 'invited') {
      data.record.status = 'in_progress';
    }
    data.activityLogs.unshift({
      id: `log-visit-${Date.now()}`,
      onboarding_id: data.record.id,
      actor_type: 'candidate',
      action: 'Candidate Portal First Accessed',
      description: `Candidate accessed self-service onboarding portal for the first time (${data.record.personal_email}).`,
      created_at: now,
      metadata,
    });
    await auditOnboarding.portalVisited({
      subject: auditSubject(data.record),
      actorType: 'candidate',
      actorName: data.record.candidate_name,
      actorEmail: data.record.personal_email,
      entityId: data.record.id,
      visitCount: 1,
      metadata,
    });
  } else {
    // Only log if previous visit was > 1 minute ago to avoid duplicate logs on rapid re-renders
    const lastVisitTime = data.record.last_visited_at ? new Date(data.record.last_visited_at).getTime() : 0;
    const nowTime = new Date(now).getTime();
    if (nowTime - lastVisitTime > 60 * 1000) {
      data.record.visit_count = (data.record.visit_count || 1) + 1;
      data.record.last_visited_at = now;
      data.activityLogs.unshift({
        id: `log-visit-${Date.now()}`,
        onboarding_id: data.record.id,
        actor_type: 'candidate',
        action: 'Candidate Portal Accessed',
        description: `Candidate visited the onboarding portal (Visit #${data.record.visit_count}).`,
        created_at: now,
        metadata,
      });
      await auditOnboarding.portalVisited({
        subject: auditSubject(data.record),
        actorType: 'candidate',
        actorName: data.record.candidate_name,
        actorEmail: data.record.personal_email,
        entityId: data.record.id,
        visitCount: data.record.visit_count,
        metadata,
      });
    }
  }

  MEMORY_ONBOARDING_STORE.set(data.record.id, data);
  return data;
}

export async function createOnboardingRecord(
  payload: Omit<OnboardingRecord, 'id' | 'status' | 'progress_percentage' | 'invitation_token' | 'created_at' | 'updated_at'>
): Promise<FullOnboardingData> {
  const newId = `onb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const token = generateInvitationToken(payload.candidate_name);
  const now = new Date().toISOString();

  const record: OnboardingRecord = {
    ...payload,
    id: newId,
    status: 'draft',
    progress_percentage: 0,
    invitation_token: token,
    created_at: now,
    updated_at: now,
  };

  const generatedDocs: OnboardingGeneratedDocument[] = [
    {
      id: `gen-${newId}-offer`,
      onboarding_id: newId,
      document_type: 'offer_letter',
      document_name: `Offer Letter - ${record.candidate_name}`,
      status: 'generated',
      generated_content: generateOfferLetterData(record),
      created_at: now,
    },
    {
      id: `gen-${newId}-appt`,
      onboarding_id: newId,
      document_type: 'appointment_letter',
      document_name: `Appointment Letter - ${record.candidate_name}`,
      status: 'generated',
      generated_content: generateAppointmentLetterData(record),
      created_at: now,
    },
  ];

  const policies: OnboardingPolicy[] = DEFAULT_PREJOINING_POLICIES.map((p, idx) => ({
    id: `pol-${newId}-${idx}`,
    onboarding_id: newId,
    ...p,
  }));

  const docs: OnboardingDocument[] = [
    { id: `doc-${newId}-1`, onboarding_id: newId, document_type: 'Resume / CV', file_name: '', status: 'pending' },
    { id: `doc-${newId}-2`, onboarding_id: newId, document_type: 'Identity Proof (Aadhaar/PAN/Passport)', file_name: '', status: 'pending' },
    { id: `doc-${newId}-3`, onboarding_id: newId, document_type: 'Address Proof (Electricity/Rent Agreement)', file_name: '', status: 'pending' },
    { id: `doc-${newId}-4`, onboarding_id: newId, document_type: 'Highest Educational Certificate', file_name: '', status: 'pending' },
    { id: `doc-${newId}-5`, onboarding_id: newId, document_type: 'Bank Account Proof (Cancelled Cheque/Passbook)', file_name: '', status: 'pending' },
  ];

  const fullData: FullOnboardingData = {
    record,
    documents: docs,
    policies,
    generatedDocuments: generatedDocs,
    activityLogs: [
      {
        id: `log-${Date.now()}`,
        onboarding_id: newId,
        actor_type: 'pnc',
        action: 'Onboarding Draft Created',
        description: `P&C created initial onboarding record for ${record.candidate_name} (${record.designation}).`,
        created_at: now,
      },
    ],
  };

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from('onboarding_records').insert({
      id: newId,
      candidate_name: record.candidate_name,
      personal_email: record.personal_email,
      phone: record.phone,
      designation: record.designation,
      department: record.department,
      location: record.location,
      joining_date: record.joining_date,
      probation_period: record.probation_period,
      notice_period: record.notice_period,
      ctc: record.ctc,
      ctc_amount: record.ctc_amount ?? null,
      ctc_frequency: record.ctc_frequency ?? null,
      is_alumni: record.is_alumni,
      role_responsibilities: record.role_responsibilities,
      status: 'draft',
      progress_percentage: 0,
      invitation_token: token,
      created_by: record.created_by,
    });
  } catch (err) {
    // Suppress in-memory fallback
  }

  await auditOnboarding.created({
    subject: auditSubject(record),
    actorName: record.created_by,
    entityId: newId,
    designation: record.designation,
    metadata: {
      joining_date: record.joining_date,
      employee_type: record.employee_type_name,
      manager: record.manager_name,
      team: record.team_name || record.department,
    },
  });

  MEMORY_ONBOARDING_STORE.set(newId, fullData);
  return fullData;
}

export async function sendOnboardingInvitation(id: string): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  data.record.status = 'invited';
  data.record.invited_at = now;
  data.record.updated_at = now;

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'pnc',
    action: 'Invitation Sent to Candidate',
    description: `Onboarding invitation sent to ${data.record.personal_email}. Access link generated.`,
    created_at: now,
  });

  await auditOnboarding.invitationSent({
    subject: auditSubject(data.record),
    actorType: 'system',
    entityId: id,
    to: data.record.personal_email,
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function updatePersonalDetails(
  id: string,
  details: Omit<OnboardingPersonalDetails, 'id' | 'onboarding_id'>
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  data.personalDetails = {
    ...details,
    id: data.personalDetails?.id || `pers-${id}`,
    onboarding_id: id,
    updated_at: now,
  };

  if (['draft', 'invited'].includes(data.record.status)) {
    data.record.status = 'in_progress';
  }

  // Recalculate progress
  recalculateProgress(data);

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'candidate',
    action: 'Personal Information Updated',
    description: 'Candidate submitted personal & emergency contact information.',
    created_at: now,
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function confirmEmploymentDetails(
  id: string,
  confirmed: boolean,
  correctionRequested: boolean,
  correctionNotes?: string
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  data.employmentDetails = {
    ...data.employmentDetails,
    onboarding_id: id,
    designation: data.record.designation,
    department: data.record.department,
    team_name: data.record.team_name,
    manager_name: data.record.manager_name,
    buddy_name: data.record.buddy_name,
    location: data.record.location,
    joining_date: data.record.joining_date,
    employee_type_name: data.record.employee_type_name,
    probation_period: data.record.probation_period,
    notice_period: data.record.notice_period,
    ctc: data.record.ctc,
    is_alumni: data.record.is_alumni,
    role_responsibilities: data.record.role_responsibilities,
    candidate_confirmed: confirmed,
    candidate_confirmed_at: confirmed ? now : null,
    correction_requested: correctionRequested,
    correction_notes: correctionNotes,
    updated_at: now,
  };

  if (['draft', 'invited'].includes(data.record.status)) {
    data.record.status = 'in_progress';
  }

  recalculateProgress(data);

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'candidate',
    action: confirmed ? 'Employment Information Confirmed' : 'Employment Correction Requested',
    description: confirmed
      ? 'Candidate confirmed all proposed employment terms and roles & responsibilities.'
      : `Candidate requested correction: "${correctionNotes}"`,
    created_at: now,
  });

  const confirmOpts = {
    subject: auditSubject(data.record),
    actorType: 'candidate' as const,
    actorName: data.record.candidate_name,
    actorEmail: data.record.personal_email,
    entityId: id,
  };
  if (confirmed) {
    await auditOnboarding.detailsConfirmed(confirmOpts);
  } else if (correctionRequested) {
    await auditOnboarding.correctionRequested({ ...confirmOpts, notes: correctionNotes });
  }

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function uploadCandidateDocument(
  id: string,
  docType: string,
  fileName: string,
  fileSize: string
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  let existingDoc = data.documents.find((d) => d.document_type === docType);
  if (existingDoc) {
    existingDoc.file_name = fileName;
    existingDoc.file_size = fileSize;
    existingDoc.status = 'uploaded';
    existingDoc.rejection_reason = undefined;
    existingDoc.uploaded_at = now;
  } else {
    data.documents.push({
      id: `doc-${Date.now()}`,
      onboarding_id: id,
      document_type: docType,
      file_name: fileName,
      file_size: fileSize,
      status: 'uploaded',
      uploaded_at: now,
    });
  }

  if (['draft', 'invited'].includes(data.record.status)) {
    data.record.status = 'in_progress';
  }

  recalculateProgress(data);

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'candidate',
    action: 'Document Uploaded',
    description: `Candidate uploaded ${docType} (${fileName}).`,
    created_at: now,
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function togglePolicyStatus(
  id: string,
  policyType: string,
  status: 'not_started' | 'completed'
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  const policy = data.policies.find((p) => p.policy_type === policyType);
  if (policy) {
    policy.status = status;
    policy.completed_at = status === 'completed' ? now : undefined;
  }

  if (['draft', 'invited'].includes(data.record.status)) {
    data.record.status = 'in_progress';
  }

  recalculateProgress(data);

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'candidate',
    action: status === 'completed' ? 'Policy Marked as Read' : 'Policy Reset',
    description: `Candidate completed policy: ${policy?.title || policyType}.`,
    created_at: now,
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function signGeneratedDocument(
  id: string,
  docType: 'offer_letter' | 'appointment_letter',
  signerName: string,
  signatureDataUrl?: string,
  signatureMetadata?: {
    ip_address?: string;
    user_agent?: string;
    timestamp?: string;
    method?: string;
    auth_token?: string;
  }
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  let doc = data.generatedDocuments.find((d) => d.document_type === docType);
  if (doc) {
    doc.status = 'signed';
    doc.signed_at = now;
    doc.signed_by = signerName;
    if (signatureDataUrl) doc.signature_data_url = signatureDataUrl;
    if (signatureMetadata) doc.signature_metadata = signatureMetadata;
  }

  if (['draft', 'invited'].includes(data.record.status)) {
    data.record.status = 'in_progress';
  }

  recalculateProgress(data);

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'candidate',
    action: `${docType === 'offer_letter' ? 'Offer Letter' : 'Appointment Letter'} Signed`,
    description: `Candidate (${signerName}) signed the ${docType.replace('_', ' ')} with verified signature metadata.`,
    created_at: now,
  });

  await auditLetters.signed({
    subject: auditSubject(data.record),
    actorType: 'candidate',
    actorName: signerName,
    actorEmail: data.record.personal_email,
    entityId: doc?.id || id,
    letterType: docType === 'offer_letter' ? 'Offer Letter' : 'Appointment Letter',
    metadata: signatureMetadata as Record<string, unknown> | undefined,
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function submitCandidateOnboarding(id: string): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  data.record.status = 'submitted';
  data.record.submitted_at = now;
  data.record.progress_percentage = 100;
  data.record.updated_at = now;

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'candidate',
    action: 'Onboarding Submitted to P&C',
    description: 'Candidate submitted all personal details, verified documents, policy confirmations, and signed letters.',
    created_at: now,
  });

  await auditOnboarding.detailsSubmitted({
    subject: auditSubject(data.record),
    actorType: 'candidate',
    actorName: data.record.candidate_name,
    actorEmail: data.record.personal_email,
    entityId: id,
    severity: 'notice',
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function verifyOrRejectDocument(
  id: string,
  documentId: string,
  status: 'verified' | 'rejected',
  rejectionReason?: string,
  reviewerName: string = 'P&C Reviewer'
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  const doc = data.documents.find((d) => d.id === documentId);
  if (doc) {
    doc.status = status;
    doc.rejection_reason = status === 'rejected' ? rejectionReason : undefined;
    doc.verified_at = now;
    doc.verified_by = reviewerName;
  }

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'pnc',
    action: status === 'verified' ? 'Document Verified' : 'Document Rejected',
    description: status === 'verified'
      ? `P&C verified ${doc?.document_type || 'document'}.`
      : `P&C rejected ${doc?.document_type || 'document'}: "${rejectionReason}"`,
    created_at: now,
  });

  await auditOnboarding.documentReviewed({
    subject: auditSubject(data.record),
    actorName: reviewerName,
    entityId: documentId,
    documentType: doc?.document_type || 'Document',
    status,
    reason: status === 'rejected' ? rejectionReason : undefined,
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function updateOnboardingStatus(
  id: string,
  status: OnboardingStatus,
  reviewerNote?: string
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  const previousStatus = data.record.status;
  data.record.status = status;
  data.record.updated_at = now;
  if (status === 'approved') {
    data.record.approved_at = now;
  } else if (status === 'completed') {
    data.record.completed_at = now;
  }

  data.activityLogs.unshift({
    id: `log-${Date.now()}`,
    onboarding_id: id,
    actor_type: 'pnc',
    action: `Status Changed to ${status.replace('_', ' ').toUpperCase()}`,
    description: reviewerNote || `P&C updated onboarding lifecycle state to ${status}.`,
    created_at: now,
  });

  await auditOnboarding.statusChanged({
    subject: auditSubject(data.record),
    entityId: id,
    from: previousStatus,
    to: status,
    note: reviewerNote,
    severity: status === 'approved' || status === 'completed' ? 'notice' : 'info',
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function provisionOfficialAccount(id: string): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const now = new Date().toISOString();
  const names = data.record.candidate_name.trim().toLowerCase().split(/\s+/);
  const firstName = names[0] || 'employee';
  const lastName = names.slice(1).join('') || 'ng';
  const officialEmail = `${firstName}.${lastName}@navgurukul.org`;
  const employeeCode = `NG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  data.provisioning = {
    id: `prov-${id}`,
    onboarding_id: id,
    official_email: officialEmail,
    employee_id_code: employeeCode,
    status: 'active',
    credentials_delivery_status: 'sent',
    provisioned_at: now,
    created_at: now,
  };

  data.record.status = 'completed';
  data.record.completed_at = now;
  data.record.updated_at = now;

  data.activityLogs.unshift({
    id: `log-${Date.now()}-prov`,
    onboarding_id: id,
    actor_type: 'system',
    action: 'Official Account Provisioned',
    description: `Generated ${officialEmail} (${employeeCode}). Welcome credentials securely dispatched to ${data.record.personal_email}.`,
    created_at: now,
  });

  data.activityLogs.unshift({
    id: `log-${Date.now()}-emp`,
    onboarding_id: id,
    actor_type: 'system',
    action: 'Employee Record Linked',
    description: `Candidate officially activated and linked in the central NG workforce directory.`,
    created_at: now,
  });

  await auditOnboarding.accountProvisioned({
    subject: { ...auditSubject(data.record), employee_id: employeeCode },
    actorType: 'system',
    entityId: id,
    officialEmail,
    employeeCode,
  });

  // Probation check-ins are booked the moment the account exists, so nobody has
  // to remember to arrange them later.
  await autoScheduleProbationCheckins(data);

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

function recalculateProgress(data: FullOnboardingData) {
  let score = 0;
  const totalWeight = 6; // 6 core checkpoints

  // 1. Personal Info
  if (data.personalDetails?.full_name && data.personalDetails?.current_address && data.personalDetails?.emergency_contact_name) {
    score += 1;
  }
  // 2. Documents
  const uploadedDocs = data.documents.filter((d) => ['uploaded', 'verified'].includes(d.status)).length;
  if (uploadedDocs >= 3) score += 1;

  // 3. Employment Confirmed
  if (data.employmentDetails?.candidate_confirmed) score += 1;

  // 4. Policies Read
  const completedPolicies = data.policies.filter((p) => p.status === 'completed').length;
  if (completedPolicies >= 4) score += 1;

  // 5. Offer Letter Signed
  const offerSigned = data.generatedDocuments.some((d) => d.document_type === 'offer_letter' && d.status === 'signed');
  if (offerSigned) score += 0.5;

  // 6. Appointment Letter Signed
  const apptSigned = data.generatedDocuments.some((d) => d.document_type === 'appointment_letter' && d.status === 'signed');
  if (apptSigned) score += 0.5;

  data.record.progress_percentage = Math.min(100, Math.round((score / totalWeight) * 100));
}

export async function getAllFullOnboardingData(): Promise<FullOnboardingData[]> {
  try {
    const records = await getAllOnboardingRecords();
    const fullList = await Promise.all(
      records.map(async (r) => {
        const full = await getOnboardingById(r.id);
        return (
          full || {
            record: r,
            documents: [],
            policies: [],
            generatedDocuments: [],
            activityLogs: [],
          }
        );
      })
    );
    return fullList;
  } catch (e) {
    return Array.from(MEMORY_ONBOARDING_STORE.values());
  }
}

export async function updateOrientationChecklist(
  id: string,
  checklist: Partial<EmployeeOrientationChecklist>
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const previousChecklist = data.provisioning?.orientation_checklist;

  if (!data.provisioning) {
    data.provisioning = {
      id: `prov-${id}`,
      onboarding_id: id,
      official_email: `${data.record.candidate_name.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`,
      employee_id_code: `NG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'active',
      credentials_delivery_status: 'sent',
      created_at: new Date().toISOString(),
    };
  }

  data.provisioning.orientation_checklist = {
    welcome_email_sent: false,
    it_assets_assigned: false,
    slack_access_granted: false,
    buddy_introduced: false,
    manager_1on1_done: false,
    pnc_induction_done: false,
    posh_training_completed: false,
    ...(data.provisioning.orientation_checklist || {}),
    ...checklist,
  };

  const now = new Date().toISOString();
  data.activityLogs.unshift({
    id: `log-${Date.now()}-orient`,
    onboarding_id: id,
    actor_type: 'pnc',
    action: 'Orientation Checklist Updated',
    description: `P&C updated onboarding orientation items for ${data.record.candidate_name}.`,
    created_at: now,
  });

  const checklistFlags = [
    'welcome_email_sent',
    'it_assets_assigned',
    'slack_access_granted',
    'buddy_introduced',
    'manager_1on1_done',
    'pnc_induction_done',
    'posh_training_completed',
  ] as const;
  const current = data.provisioning.orientation_checklist;

  await auditOnboarding.orientationUpdated({
    subject: auditSubject(data.record),
    entityId: id,
    completed: checklistFlags.filter((f) => current?.[f]).length,
    total: checklistFlags.length,
    changes: checklistFlags
      .filter((f) => f in checklist && checklist[f] !== previousChecklist?.[f])
      .map((f) => ({
        field: f,
        label: f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        from: previousChecklist?.[f] ?? false,
        to: checklist[f],
      })),
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

export async function updateProbationMilestone(
  id: string,
  milestoneKey: MilestoneKey,
  milestoneData: Partial<ProbationMilestone>
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  if (!data.provisioning) {
    data.provisioning = {
      id: `prov-${id}`,
      onboarding_id: id,
      official_email: `${data.record.candidate_name.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`,
      employee_id_code: `NG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'active',
      credentials_delivery_status: 'sent',
      created_at: new Date().toISOString(),
    };
  }

  if (!data.provisioning.probation_milestones) {
    data.provisioning.probation_milestones = {};
  }

  const previous = data.provisioning.probation_milestones[milestoneKey];
  const label = MILESTONE_DEFINITIONS[milestoneKey].label;

  // A human touching the date takes the slot out of the auto-scheduler's hands,
  // so a later provisioning save will not move it back.
  const dateMoved =
    (milestoneData.due_date !== undefined && milestoneData.due_date !== previous?.due_date) ||
    (milestoneData.starts_at !== undefined && milestoneData.starts_at !== previous?.starts_at);

  data.provisioning.probation_milestones[milestoneKey] = {
    status: 'pending',
    ...(previous || {}),
    ...milestoneData,
    ...(dateMoved ? { rescheduled: true, auto_scheduled: false } : {}),
  };

  const now = new Date().toISOString();
  data.activityLogs.unshift({
    id: `log-${Date.now()}-prob`,
    onboarding_id: id,
    actor_type: 'pnc',
    action: `Probation Milestone Updated (${label})`,
    description: `Updated milestone status to ${milestoneData.status || 'updated'}: ${milestoneData.notes || 'No notes'}`,
    created_at: now,
  });

  await auditOnboarding.milestoneUpdated({
    subject: auditSubject(data.record),
    entityId: `${id}:${milestoneKey}`,
    milestone: label,
    status: milestoneData.status || previous?.status || 'updated',
    notes: milestoneData.notes,
    changes: [
      ...(milestoneData.status && milestoneData.status !== previous?.status
        ? [{ field: 'status', label: 'Status', from: previous?.status, to: milestoneData.status }]
        : []),
      ...(dateMoved
        ? [{ field: 'due_date', label: 'Scheduled For', from: previous?.due_date, to: milestoneData.due_date }]
        : []),
    ],
  });

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

/**
 * Place (or refresh) the 30- and 60-day check-ins on the manager's calendar and
 * record each newly-booked slot in the audit trail.
 *
 * Called whenever provisioning is saved. Idempotent: completed and
 * human-rescheduled milestones are left alone.
 */
async function autoScheduleProbationCheckins(data: FullOnboardingData): Promise<void> {
  if (!data.provisioning) return;

  const schedule = await buildProbationSchedule({
    joiningDate: data.record.joining_date,
    managerName: data.record.manager_name,
    // The manager's official mailbox is their calendar id.
    managerEmail: data.record.manager_name
      ? `${data.record.manager_name.trim().toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`
      : null,
    existing: data.provisioning.probation_milestones,
  });

  data.provisioning.probation_milestones = {
    day_30: schedule.day_30,
    day_60: schedule.day_60,
  };

  if (schedule.newlyScheduled.length === 0) return;

  const now = new Date().toISOString();
  for (const key of schedule.newlyScheduled) {
    const milestone = schedule[key];
    const def = MILESTONE_DEFINITIONS[key];
    const when = milestone.starts_at
      ? new Date(milestone.starts_at).toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : milestone.due_date || 'TBC';

    data.activityLogs.unshift({
      id: `log-${Date.now()}-sched-${key}`,
      onboarding_id: data.record.id,
      actor_type: 'system',
      action: `${def.label} Auto-Scheduled`,
      description: `${def.label} booked with ${milestone.reviewer_name} for ${when}. ${milestone.scheduling_note || ''}`.trim(),
      created_at: now,
    });

    await auditOnboarding.milestoneScheduled({
      subject: auditSubject(data.record),
      actorType: 'system',
      entityId: `${data.record.id}:${key}`,
      milestone: def.label,
      dueDate: when,
      reviewer: milestone.reviewer_name,
      metadata: {
        starts_at: milestone.starts_at,
        ends_at: milestone.ends_at,
        scheduling_note: milestone.scheduling_note,
        auto_scheduled: true,
      },
    });
  }
}

/** Exposed so callers can re-run scheduling without a provisioning save. */
export async function scheduleProbationCheckins(id: string): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data?.provisioning) return data;

  await autoScheduleProbationCheckins(data);
  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}

/**
 * Save the official email and employee code for a joiner.
 *
 * IT hardware is deliberately NOT part of this payload. Laptops and other
 * assets are requested and allocated in the external Asset Management System,
 * which is the source of truth; ELC reads that allocation over the integration
 * boundary and never records it locally.
 */
export async function updateProvisioningDetails(
  id: string,
  details: { official_email?: string; employee_id_code?: string }
): Promise<FullOnboardingData | null> {
  const data = await getOnboardingById(id);
  if (!data) return null;

  const previousEmail = data.provisioning?.official_email;
  const previousCode = data.provisioning?.employee_id_code;

  if (!data.provisioning) {
    data.provisioning = {
      id: `prov-${id}`,
      onboarding_id: id,
      official_email: details.official_email || `${data.record.candidate_name.toLowerCase().replace(/\s+/g, '.')}@navgurukul.org`,
      employee_id_code: details.employee_id_code || `NG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'active',
      credentials_delivery_status: 'sent',
      created_at: new Date().toISOString(),
    };
  } else {
    if (details.official_email) data.provisioning.official_email = details.official_email;
    if (details.employee_id_code) data.provisioning.employee_id_code = details.employee_id_code;
  }

  data.record.status = 'completed';
  const now = new Date().toISOString();
  data.record.completed_at = now;
  data.record.updated_at = now;

  data.activityLogs.unshift({
    id: `log-${Date.now()}-prov-edit`,
    onboarding_id: id,
    actor_type: 'pnc',
    action: 'Employee Account Provisioning Updated',
    description: `Configured official email: ${data.provisioning.official_email}, Employee ID: ${data.provisioning.employee_id_code}`,
    created_at: now,
  });

  await auditOnboarding.accountProvisioned({
    subject: { ...auditSubject(data.record), employee_id: data.provisioning.employee_id_code },
    entityId: id,
    officialEmail: data.provisioning.official_email,
    employeeCode: data.provisioning.employee_id_code,
    changes: [
      ...(previousEmail && previousEmail !== data.provisioning.official_email
        ? [{ field: 'official_email', label: 'Official Email', from: previousEmail, to: data.provisioning.official_email }]
        : []),
      ...(previousCode && previousCode !== data.provisioning.employee_id_code
        ? [{ field: 'employee_id_code', label: 'Employee ID', from: previousCode, to: data.provisioning.employee_id_code }]
        : []),
    ],
  });

  // Keep the probation check-ins in step with the account being set up.
  await autoScheduleProbationCheckins(data);

  MEMORY_ONBOARDING_STORE.set(id, data);
  return data;
}
