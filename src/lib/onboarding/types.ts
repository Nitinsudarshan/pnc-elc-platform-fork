export type OnboardingStatus =
  | 'draft'
  | 'invited'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'account_provisioning'
  | 'completed';

export type DocumentStatus = 'pending' | 'uploaded' | 'verified' | 'rejected';
export type GeneratedDocStatus = 'generated' | 'viewed' | 'signed';
export type PolicyStatus = 'not_started' | 'in_progress' | 'completed';
export type ProvisioningStatus = 'pending' | 'generating' | 'active';
export type DeliveryStatus = 'pending' | 'sent' | 'failed';

export interface OnboardingRecord {
  id: string;
  employee_id?: string | null;
  candidate_name: string;
  personal_email: string;
  phone?: string;
  designation: string;
  department?: string;
  team_id?: string | null;
  team_name?: string;
  manager_id?: string | null;
  manager_name?: string;
  buddy_id?: string | null;
  buddy_name?: string;
  location?: string;
  employee_type_id?: string | null;
  employee_type_name?: string;
  joining_date: string;
  probation_period?: string;
  notice_period?: string;
  ctc?: string;
  is_alumni: boolean;
  role_responsibilities?: string;
  status: OnboardingStatus;
  progress_percentage: number;
  invitation_token: string;
  invited_at?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  completed_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPersonalDetails {
  id?: string;
  onboarding_id: string;
  full_name: string;
  preferred_name?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  phone?: string;
  personal_email?: string;
  is_alumni: boolean;
  current_address?: string;
  permanent_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
  profile_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingEmploymentDetails {
  id?: string;
  onboarding_id: string;
  designation: string;
  department?: string;
  team_id?: string | null;
  team_name?: string;
  manager_id?: string | null;
  manager_name?: string;
  buddy_id?: string | null;
  buddy_name?: string;
  location?: string;
  joining_date: string;
  employee_type_id?: string | null;
  employee_type_name?: string;
  probation_period?: string;
  notice_period?: string;
  ctc?: string;
  is_alumni: boolean;
  role_responsibilities?: string;
  candidate_confirmed?: boolean;
  candidate_confirmed_at?: string | null;
  correction_requested?: boolean;
  correction_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingDocument {
  id: string;
  onboarding_id: string;
  document_type: string;
  file_name: string;
  file_size?: string;
  storage_reference?: string;
  status: DocumentStatus;
  rejection_reason?: string;
  uploaded_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingPolicy {
  id: string;
  onboarding_id: string;
  policy_type: string;
  title: string;
  description?: string;
  content?: string;
  status: PolicyStatus;
  completed_at?: string | null;
  created_at?: string;
}

export interface OnboardingGeneratedDocument {
  id: string;
  onboarding_id: string;
  document_type: 'offer_letter' | 'appointment_letter';
  document_name: string;
  template_id?: string;
  template_version?: string;
  generated_content?: any;
  status: GeneratedDocStatus;
  signed_at?: string | null;
  signed_by?: string | null;
  signature_data_url?: string | null;
  signature_metadata?: {
    ip_address?: string;
    user_agent?: string;
    timestamp?: string;
    method?: string;
    auth_token?: string;
  } | null;
  created_at: string;
}

export interface OnboardingActivityLog {
  id: string;
  onboarding_id: string;
  actor_id?: string;
  actor_type: 'pnc' | 'candidate' | 'system';
  action: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface EmployeeAccountProvisioning {
  id: string;
  onboarding_id: string;
  employee_id?: string | null;
  official_email: string;
  employee_id_code: string;
  status: ProvisioningStatus;
  credentials_delivery_status: DeliveryStatus;
  provisioned_at?: string | null;
  created_at: string;
}

export interface FullOnboardingData {
  record: OnboardingRecord;
  personalDetails?: OnboardingPersonalDetails;
  employmentDetails?: OnboardingEmploymentDetails;
  documents: OnboardingDocument[];
  policies: OnboardingPolicy[];
  generatedDocuments: OnboardingGeneratedDocument[];
  activityLogs: OnboardingActivityLog[];
  provisioning?: EmployeeAccountProvisioning | null;
}
