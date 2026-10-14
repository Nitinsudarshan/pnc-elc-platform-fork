-- Seed Data for Onboarding Module
-- 4 Realistic Candidates across all stages

-- 1. Draft: Kavita Rao
INSERT INTO onboarding_records (
  id,
  candidate_name,
  personal_email,
  phone,
  designation,
  department,
  location,
  joining_date,
  probation_period,
  notice_period,
  ctc,
  is_alumni,
  role_responsibilities,
  status,
  progress_percentage,
  invitation_token,
  created_by
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Kavita Rao',
  'kavita.rao@example.com',
  '+91 98765 43210',
  'UI/UX Designer',
  'Design',
  'Bangalore / Hybrid',
  '2026-10-15',
  '3 Months',
  '1 Month',
  '₹8,50,000 PA',
  false,
  'Responsible for creating user-centric design systems, web wireframes, and design specs for student-facing educational platforms.',
  'draft',
  0,
  'k8m2q7x1-kavita-rao',
  'Sharmistha Mazumdar'
) ON CONFLICT (id) DO NOTHING;

-- 2. In Progress: Aarav Sharma (Has discrepancy in phone and address, is_alumni = true)
INSERT INTO onboarding_records (
  id,
  candidate_name,
  personal_email,
  phone,
  designation,
  department,
  location,
  joining_date,
  probation_period,
  notice_period,
  ctc,
  is_alumni,
  role_responsibilities,
  status,
  progress_percentage,
  invitation_token,
  invited_at,
  created_by
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Aarav Sharma',
  'aarav.sharma@example.com',
  '+91 98111 22334',
  'Software Engineer',
  'Engineering',
  'Delhi / Remote',
  '2026-10-01',
  '3 Months',
  '1 Month',
  '₹10,00,000 PA',
  true,
  'Develop scalable backend microservices and maintain core student management pipelines in Next.js and Supabase.',
  'in_progress',
  85,
  'k7m3p9q2-aarav-sharma',
  NOW() - INTERVAL '3 days',
  'Nitin Sudarshan'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO onboarding_personal_details (
  id,
  onboarding_id,
  full_name,
  preferred_name,
  date_of_birth,
  gender,
  blood_group,
  phone,
  personal_email,
  is_alumni,
  current_address,
  permanent_address,
  city,
  state,
  pincode,
  emergency_contact_name,
  emergency_contact_relation,
  emergency_contact_phone,
  emergency_contact_email
) VALUES (
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222222',
  'Aarav Sharma',
  'Aaru',
  '1999-04-12',
  'Male',
  'O+',
  '+91 98999 88776', -- Changed from initial +91 98111 22334 to simulate discrepancy
  'aarav.sharma@example.com',
  true,
  'Flat 402, Sunshine Apartments, Indiranagar',
  'House 12, Gandhi Road, Jaipur',
  'Bangalore',
  'Karnataka',
  '560038',
  'Suresh Sharma',
  'Father',
  '+91 94140 12345',
  'suresh.sharma@example.com'
) ON CONFLICT (onboarding_id) DO NOTHING;

-- Aarav's Documents
INSERT INTO onboarding_documents (id, onboarding_id, document_type, file_name, file_size, status, uploaded_at) VALUES
('22222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'resume', 'Aarav_Sharma_Resume_2026.pdf', '245 KB', 'verified', NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 'identity_proof', 'Aadhaar_Card_Aarav.pdf', '1.2 MB', 'verified', NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222226', '22222222-2222-2222-2222-222222222222', 'address_proof', 'Electricity_Bill_Bangalore.pdf', '890 KB', 'rejected', NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222227', '22222222-2222-2222-2222-222222222222', 'education_certificate', 'BTech_Degree_Certificate.pdf', '3.4 MB', 'uploaded', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

UPDATE onboarding_documents
SET rejection_reason = 'Address proof is blurry and older than 3 months. Please upload a recent electricity bill or rental agreement.'
WHERE id = '22222222-2222-2222-2222-222222222226';

-- 3. Submitted: Priya Singh (Ready for PNC Review)
INSERT INTO onboarding_records (
  id,
  candidate_name,
  personal_email,
  phone,
  designation,
  department,
  location,
  joining_date,
  probation_period,
  notice_period,
  ctc,
  is_alumni,
  role_responsibilities,
  status,
  progress_percentage,
  invitation_token,
  invited_at,
  submitted_at,
  created_by
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Priya Singh',
  'priya.singh@example.com',
  '+91 97777 66554',
  'Program Associate',
  'Programs',
  'Pune / Campus',
  '2026-10-06',
  '3 Months',
  '1 Month',
  '₹6,50,000 PA',
  true,
  'Coordinate residential campus learning programs, student mentorship cohorts, and track academic outcomes.',
  'submitted',
  100,
  'p9x4b1m7-priya-singh',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 hours',
  'Sharmistha Mazumdar'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO onboarding_personal_details (
  id,
  onboarding_id,
  full_name,
  preferred_name,
  date_of_birth,
  gender,
  blood_group,
  phone,
  personal_email,
  is_alumni,
  current_address,
  permanent_address,
  city,
  state,
  pincode,
  emergency_contact_name,
  emergency_contact_relation,
  emergency_contact_phone,
  emergency_contact_email
) VALUES (
  '33333333-3333-3333-3333-333333333334',
  '33333333-3333-3333-3333-333333333333',
  'Priya Singh',
  'Priya',
  '2001-08-20',
  'Female',
  'B+',
  '+91 97777 66554',
  'priya.singh@example.com',
  true,
  'NavGurukul Campus, Village Sarole',
  'Qtr 4B, Sector 2, Bokaro Steel City',
  'Pune',
  'Maharashtra',
  '412205',
  'Rajesh Singh',
  'Father',
  '+91 98351 99887',
  'rajesh.singh@example.com'
) ON CONFLICT (onboarding_id) DO NOTHING;

INSERT INTO onboarding_documents (id, onboarding_id, document_type, file_name, file_size, status, uploaded_at) VALUES
('33333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'resume', 'Priya_Singh_CV.pdf', '310 KB', 'uploaded', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333336', '33333333-3333-3333-3333-333333333333', 'identity_proof', 'Priya_Passport.pdf', '1.5 MB', 'uploaded', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333337', '33333333-3333-3333-3333-333333333333', 'address_proof', 'Voter_ID_Card.pdf', '750 KB', 'uploaded', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333338', '33333333-3333-3333-3333-333333333333', 'education_certificate', 'BA_Degree_Final.pdf', '2.1 MB', 'uploaded', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333339', '33333333-3333-3333-3333-333333333333', 'bank_details', 'Cancelled_Cheque_HDFC.pdf', '600 KB', 'uploaded', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO onboarding_documents_generated (id, onboarding_id, document_type, document_name, status, signed_at, signed_by) VALUES
('33333333-3333-3333-3333-333333333340', '33333333-3333-3333-3333-333333333333', 'offer_letter', 'Offer Letter - Priya Singh', 'signed', NOW() - INTERVAL '6 hours', 'Priya Singh'),
('33333333-3333-3333-3333-333333333341', '33333333-3333-3333-3333-333333333333', 'appointment_letter', 'Appointment Letter - Priya Singh', 'signed', NOW() - INTERVAL '5 hours', 'Priya Singh')
ON CONFLICT (id) DO NOTHING;

-- 4. Completed: Rahul Kumar
INSERT INTO onboarding_records (
  id,
  candidate_name,
  personal_email,
  phone,
  designation,
  department,
  location,
  joining_date,
  probation_period,
  notice_period,
  ctc,
  is_alumni,
  role_responsibilities,
  status,
  progress_percentage,
  invitation_token,
  invited_at,
  submitted_at,
  approved_at,
  completed_at,
  created_by
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Rahul Kumar',
  'rahul.personal@example.com',
  '+91 91234 56789',
  'Operations Associate',
  'Operations',
  'Dharamshala / Campus',
  '2026-10-10',
  '3 Months',
  '1 Month',
  '₹6,00,000 PA',
  false,
  'Oversee campus facility logistics, food supply procurement, vendor settlements, and student residential safety protocols.',
  'completed',
  100,
  'r2m8q4x9-rahul-kumar',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  'Nitin Sudarshan'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO employee_account_provisioning (
  id,
  onboarding_id,
  official_email,
  employee_id_code,
  status,
  credentials_delivery_status,
  provisioned_at
) VALUES (
  '44444444-4444-4444-4444-444444444445',
  '44444444-4444-4444-4444-444444444444',
  'rahul.kumar@navgurukul.org',
  'NG-2026-00124',
  'active',
  'sent',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;
