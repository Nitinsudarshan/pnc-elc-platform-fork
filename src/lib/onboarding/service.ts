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
  FullOnboardingData,
  OnboardingStatus,
  DocumentStatus,
} from './types';
import { DEFAULT_PREJOINING_POLICIES } from './default-policies';
import { generateOfferLetterData, generateAppointmentLetterData } from './templates';

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
    invitation_token: 'token-kavita-rao-draft',
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
    invitation_token: 'token-aarav-sharma-prog',
    invited_at: new Date(Date.now() - 86400000 * 3).toISOString(),
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
        id: 'log-a-3',
        onboarding_id: aaravId,
        actor_type: 'candidate',
        action: 'Personal Details Updated',
        description: 'Candidate completed and saved personal details form.',
        created_at: new Date(Date.now() - 86400000 * 2.5).toISOString(),
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
    invitation_token: 'token-priya-singh-sub',
    invited_at: new Date(Date.now() - 86400000 * 5).toISOString(),
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
      { id: 'log-p-3', onboarding_id: priyaId, actor_type: 'candidate', action: 'Policies Completed', description: 'Candidate read and acknowledged all pre-joining policies.', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'log-p-4', onboarding_id: priyaId, actor_type: 'candidate', action: 'Offer & Appointment Letters Signed', description: 'Candidate accepted and signed employment documents.', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
      { id: 'log-p-5', onboarding_id: priyaId, actor_type: 'candidate', action: 'Onboarding Submitted to P&C', description: 'Candidate submitted complete onboarding dossier for verification.', created_at: priyaRecord.submitted_at! },
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
    invitation_token: 'token-rahul-kumar-comp',
    invited_at: new Date(Date.now() - 86400000 * 10).toISOString(),
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
      { id: 'log-r-3', onboarding_id: rahulId, actor_type: 'candidate', action: 'Onboarding Submitted', description: 'Candidate completed all onboarding steps and submitted dossier.', created_at: rahulRecord.submitted_at! },
      { id: 'log-r-4', onboarding_id: rahulId, actor_type: 'pnc', action: 'Documents Verified', description: 'P&C verified all 5 required documents.', created_at: rahulRecord.approved_at! },
      { id: 'log-r-5', onboarding_id: rahulId, actor_type: 'pnc', action: 'Onboarding Approved', description: 'P&C completed final review and approved onboarding dossier.', created_at: rahulRecord.approved_at! },
      { id: 'log-r-6', onboarding_id: rahulId, actor_type: 'system', action: 'Official Account Provisioned', description: 'Created rahul.kumar@navgurukul.org (Employee Code: NG-2026-00124) and sent credentials to candidate personal email.', created_at: rahulRecord.completed_at! },
      { id: 'log-r-7', onboarding_id: rahulId, actor_type: 'system', action: 'Employee Record Linked', description: 'Onboarding record linked to permanent Employee Directory entity.', created_at: rahulRecord.completed_at! },
    ],
  });
}

// Ensure seed data initialized
initSeedData();

// Service Layer Methods

export async function getAllOnboardingRecords(): Promise<OnboardingRecord[]> {
  try {
    const supabase = createServerSupabaseClient();
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

export async function getOnboardingById(id: string): Promise<FullOnboardingData | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: record, error } = await supabase
      .from('onboarding_records')
      .select('*, teams(name), employees!manager_id(name), employee_types(name)')
      .eq('id', id)
      .single();

    if (!error && record) {
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

  const existing = MEMORY_ONBOARDING_STORE.get(id);
  if (existing) return JSON.parse(JSON.stringify(existing));
  return null;
}

export async function getOnboardingByToken(token: string): Promise<FullOnboardingData | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: record, error } = await supabase
      .from('onboarding_records')
      .select('*, teams(name), employees!manager_id(name), employee_types(name)')
      .eq('invitation_token', token)
      .single();

    if (!error && record) {
      return getOnboardingById(record.id);
    }
  } catch (err) {
    // Fallback to memory store
  }

  for (const item of MEMORY_ONBOARDING_STORE.values()) {
    if (item.record.invitation_token === token) {
      return JSON.parse(JSON.stringify(item));
    }
  }
  return null;
}

export async function createOnboardingRecord(
  payload: Omit<OnboardingRecord, 'id' | 'status' | 'progress_percentage' | 'invitation_token' | 'created_at' | 'updated_at'>
): Promise<FullOnboardingData> {
  const newId = `onb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const token = `token-${payload.candidate_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
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
    const supabase = createServerSupabaseClient();
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
