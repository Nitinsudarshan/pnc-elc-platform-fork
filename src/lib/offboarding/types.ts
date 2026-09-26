// ============================================================================
// OFFBOARDING & EXIT MANAGEMENT TYPES FOR PNC-ELC
// ============================================================================

export type ExitType =
  | 'resignation'
  | 'termination'
  | 'contract_completion'
  | 'immediate_relieving'
  | 'mutual_separation'
  | 'other';

export type OffboardingStatus =
  | 'initiated'
  | 'notice_period'
  | 'clearance_in_progress'
  | 'settlement_pending'
  | 'completed'
  | 'cancelled';

export type ChecklistCategory =
  | 'knowledge_transfer'
  | 'asset_return'
  | 'finance'
  | 'admin'
  | 'pnc'
  | 'exit_interview';

export type ChecklistOwner =
  | 'employee'
  | 'manager'
  | 'it_admin'
  | 'finance'
  | 'pnc';

export type ChecklistItemStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'waived'
  | 'blocked';

export type AssetType =
  | 'laptop'
  | 'monitor'
  | 'phone'
  | 'id_card'
  | 'access_key'
  | 'other';

export type AssetReturnStatus =
  | 'pending_return'
  | 'returned'
  | 'damaged'
  | 'lost'
  | 'cleared'
  | 'under_recovery'
  | 'waived';

export type AssetCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'damaged'
  | 'missing';

export type NDCDepartment =
  | 'manager'
  | 'it_admin'
  | 'finance'
  | 'pnc';

export type NDCStatus =
  | 'not_started'
  | 'pending'
  | 'under_review'
  | 'clarification_required'
  | 'cleared'
  | 'blocked';

export type FnFStatus =
  | 'not_started'
  | 'awaiting_clearance'
  | 'computation_pending'
  | 'under_review'
  | 'processing'
  | 'processed'
  | 'blocked';

export interface OffboardingCase {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_designation: string;
  employee_department: string;
  employee_type: string;
  manager_name?: string | null;
  exit_type: ExitType;
  initiated_date: string;
  initiated_by: string;
  proposed_lwd: string;
  actual_lwd?: string | null;
  notice_period_days: number;
  notice_period_waived: boolean;
  reason: string;
  reason_details?: string | null;
  status: OffboardingStatus;
  immediate_relieving: boolean;
  exception_notes?: string | null;
  exit_closed_at?: string | null;
  exit_closed_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OffboardingChecklistItem {
  id: string;
  offboarding_id: string;
  title: string;
  description?: string;
  category: ChecklistCategory;
  owner_role: ChecklistOwner;
  assigned_to_name?: string;
  status: ChecklistItemStatus;
  is_mandatory: boolean;
  due_date?: string | null;
  completed_at?: string | null;
  completed_by?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OffboardingAssetItem {
  id: string;
  offboarding_id: string;
  asset_name: string;
  asset_tag?: string;
  asset_type: AssetType;
  assigned_date?: string;
  return_status: AssetReturnStatus;
  condition?: AssetCondition;
  recovery_amount?: number;
  waiver_reason?: string | null;
  clearance_notes?: string;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OffboardingNDCDepartment {
  id: string;
  offboarding_id: string;
  department: NDCDepartment;
  department_label: string;
  status: NDCStatus;
  cleared_by?: string | null;
  cleared_at?: string | null;
  remarks?: string | null;
  blocker_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OffboardingFnF {
  id: string;
  offboarding_id: string;
  status: FnFStatus;
  payable_days: number;
  leave_encashment_days: number;
  gratuity_eligible: boolean;
  asset_recovery_amount: number;
  other_deductions: number;
  net_payable_estimate?: string;
  payment_reference?: string | null;
  payment_date?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  remarks?: string | null;
  blocked_reasons: string[];
  created_at: string;
  updated_at: string;
}

export interface OffboardingActivityLog {
  id: string;
  offboarding_id: string;
  actor_id?: string;
  actor_name: string;
  actor_role: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ExitDocument {
  id: string;
  offboarding_id: string;
  document_type: 'ndc' | 'experience_letter' | 'relieving_letter';
  document_name: string;
  file_url?: string;
  status: 'draft' | 'generated' | 'signed' | 'delivered';
  generated_at?: string;
  signed_at?: string;
}

export interface OffboardingSettings {
  id?: string;
  default_notice_period_days: number;
  standard_fnf_timeline_days: number;
  standard_hold_period_days: number;
  clearance_reminder_frequency_days: number;
  escalation_threshold_days: number;
  require_all_ndc_before_fnf: boolean;
  require_asset_clearance_before_closure: boolean;
  allow_immediate_relieving: boolean;
  updated_at?: string;
  updated_by?: string | null;
}

export const DEFAULT_OFFBOARDING_SETTINGS: OffboardingSettings = {
  default_notice_period_days: 30,
  standard_fnf_timeline_days: 30,
  standard_hold_period_days: 7,
  clearance_reminder_frequency_days: 2,
  escalation_threshold_days: 5,
  require_all_ndc_before_fnf: true,
  require_asset_clearance_before_closure: true,
  allow_immediate_relieving: true,
};

export interface FullOffboardingData {
  caseRecord: OffboardingCase;
  checklist: OffboardingChecklistItem[];
  assets: OffboardingAssetItem[];
  ndc: OffboardingNDCDepartment[];
  fnf: OffboardingFnF;
  activityLogs: OffboardingActivityLog[];
  documents: ExitDocument[];
  // External Integration Snapshots
  externalAssetsSummary?: any;
  externalAttendanceSummary?: any;
  externalLeaveSummary?: any;
}

export interface InitiateOffboardingInput {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_designation: string;
  employee_department: string;
  employee_type: string;
  manager_name?: string;
  exit_type: ExitType;
  initiated_date: string;
  initiated_by: string;
  proposed_lwd: string;
  notice_period_days?: number;
  notice_period_waived?: boolean;
  reason: string;
  reason_details?: string;
  immediate_relieving?: boolean;
  exception_notes?: string;
}

// ============================================================================
// STAGE 1: RESIGNATION REQUEST & DECISION WORKFLOW TYPES
// ============================================================================

export type ResignationSource = 'platform' | 'email' | 'pnc';

export type ReviewDecision = 'pending' | 'accepted' | 'retention_proposed' | 'on_hold';

export type EmployeeRetentionResponse = 'pending' | 'accepted_withdrawal' | 'declined_withdrawal';

export type ResignationRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'manager_pending'
  | 'pnc_pending'
  | 'on_hold'
  | 'retention_discussion'
  | 'decision_pending'
  | 'withdrawal_proposed'
  | 'withdrawn_by_employee'
  | 'resignation_accepted'
  | 'cancelled';

export interface ResignationRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_designation: string;
  employee_department: string;
  manager_name?: string | null;
  source: ResignationSource;
  resignation_date: string;
  proposed_lwd: string;
  notice_period_days: number;
  notice_period_waived?: boolean;
  reason: string;
  reason_details?: string | null;
  employee_comments?: string | null;

  // Email evidence fields (if source === 'email')
  email_subject?: string | null;
  email_sender?: string | null;
  email_body?: string | null;
  email_received_at?: string | null;

  // Manager Decision & Notes
  manager_decision: ReviewDecision;
  manager_decision_at?: string | null;
  manager_decision_by?: string | null;
  manager_notes?: string | null;

  // P&C Decision & Notes
  pnc_decision: ReviewDecision;
  pnc_decision_at?: string | null;
  pnc_decision_by?: string | null;
  pnc_notes?: string | null;

  // Hold / Retention Window
  hold_until_date?: string | null;
  retention_notes?: string | null;

  // Employee Retention Response
  employee_retention_response: EmployeeRetentionResponse;
  employee_response_at?: string | null;
  employee_response_notes?: string | null;

  // Lifecycle Status
  status: ResignationRequestStatus;

  // Link to Downstream Offboarding Case (only once accepted)
  offboarding_case_id?: string | null;

  created_at: string;
  updated_at: string;
}

export interface SubmitResignationInput {
  employee_id: string;
  source: ResignationSource;
  resignation_date: string;
  proposed_lwd: string;
  notice_period_days: number;
  reason: string;
  reason_details?: string;
  employee_comments?: string;
  // If email originated
  email_subject?: string;
  email_sender?: string;
  email_body?: string;
}

