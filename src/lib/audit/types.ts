// ============================================================================
// UNIFIED EMPLOYEE AUDIT TRAIL
// ============================================================================
// Every employee-affecting action across the platform — onboarding, appraisal,
// confirmation, peer feedback, offboarding, letters, directory and settings —
// lands in one append-only stream, keyed to the employee's ID *and* email so a
// record stays resolvable even before an employee ID exists (candidate stage)
// or after the directory row is archived (post-exit).
// ============================================================================

export type AuditModule =
  | 'onboarding'
  | 'employee'
  | 'appraisal'
  | 'confirmation'
  | 'peer_feedback'
  | 'offboarding'
  | 'letters'
  | 'documents'
  | 'access'
  | 'settings'
  | 'data_management';

export type AuditActorType = 'pnc' | 'manager' | 'employee' | 'candidate' | 'system' | 'integration';

export type AuditSeverity = 'info' | 'notice' | 'warning' | 'critical';

/**
 * The subject of an audit event. At least one of `employee_id` or
 * `employee_email` must be present — that pair is the join key that stitches a
 * person's history together across modules and across their lifecycle.
 */
export interface AuditSubject {
  employee_id?: string | null;
  employee_email?: string | null;
  employee_name?: string | null;
}

export interface AuditActor {
  actor_id?: string | null;
  actor_email?: string | null;
  actor_name?: string | null;
  actor_type: AuditActorType;
}

/** A single field-level change captured alongside an event. */
export interface AuditFieldChange {
  field: string;
  label?: string;
  from?: unknown;
  to?: unknown;
}

export interface AuditEvent {
  id: string;

  // --- Subject (who this is about) -----------------------------------------
  employee_id?: string | null;
  employee_email?: string | null;
  employee_name?: string | null;

  // --- Actor (who did it) ---------------------------------------------------
  actor_id?: string | null;
  actor_email?: string | null;
  actor_name?: string | null;
  actor_type: AuditActorType;

  // --- Event ----------------------------------------------------------------
  module: AuditModule;
  /** Machine-readable verb, e.g. `onboarding.document.verified`. */
  action: string;
  /** Human sentence rendered in the trail. */
  description: string;
  severity: AuditSeverity;

  // --- Context --------------------------------------------------------------
  /** The primary record this event hangs off (onboarding id, case id, cycle id…). */
  entity_type?: string | null;
  entity_id?: string | null;
  changes?: AuditFieldChange[] | null;
  metadata?: Record<string, unknown> | null;

  occurred_at: string;
  created_at: string;
}

/** Input shape callers use; the service fills ids, timestamps and defaults. */
export interface AuditEventInput {
  subject: AuditSubject;
  actor?: Partial<AuditActor>;
  module: AuditModule;
  action: string;
  description: string;
  severity?: AuditSeverity;
  entity_type?: string | null;
  entity_id?: string | null;
  changes?: AuditFieldChange[] | null;
  metadata?: Record<string, unknown> | null;
  occurred_at?: string;
}

export interface AuditQueryFilters {
  employee_id?: string;
  employee_email?: string;
  module?: AuditModule | 'all';
  actor_type?: AuditActorType | 'all';
  severity?: AuditSeverity | 'all';
  entity_id?: string;
  /** Free-text across description, action, actor and subject names. */
  search?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
}

export const AUDIT_MODULE_LABELS: Record<AuditModule, string> = {
  onboarding: 'Onboarding',
  employee: 'Employee Directory',
  appraisal: 'Appraisal',
  confirmation: 'Confirmation',
  peer_feedback: 'Peer Feedback',
  offboarding: 'Offboarding',
  letters: 'Letters & Documents',
  documents: 'Document Verification',
  access: 'Access & Accounts',
  settings: 'Platform Settings',
  data_management: 'Data Management',
};

export const AUDIT_ACTOR_LABELS: Record<AuditActorType, string> = {
  pnc: 'P&C Team',
  manager: 'Reporting Manager',
  employee: 'Employee',
  candidate: 'Candidate',
  system: 'System',
  integration: 'External Integration',
};
