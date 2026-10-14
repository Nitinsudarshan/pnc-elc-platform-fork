// ============================================================================
// EXTERNAL LEAVE SYSTEM INTEGRATION BOUNDARY
// ============================================================================
// The external HRIS / Leave Management System is the sole source of truth.
// ELC offboarding queries it for earned leave, encashable balances, and leave deductions.
// ============================================================================

export interface ExternalLeaveRecord {
  leave_type: 'privilege_earned_leave' | 'casual_sick_leave' | 'compensatory_off' | 'unpaid_leave';
  total_accrued: number;
  consumed: number;
  available_balance: number;
  encashable: boolean;
  encashment_limit_days: number;
}

export interface ExternalLeaveSummary {
  source_system: 'Enterprise_HRMS_Leave_API';
  fetched_at: string;
  employee_id: string;
  total_available_leave_days: number;
  total_encashable_days: number;
  per_day_encashment_rate_inr: number;
  balances_by_type: ExternalLeaveRecord[];
  pending_leave_applications: {
    from_date: string;
    to_date: string;
    leave_type: string;
    days: number;
    approval_status: 'pending_manager' | 'approved' | 'rejected';
  }[];
}

export interface ILeaveIntegrationService {
  getEmployeeLeaveSummary(employeeId: string): Promise<ExternalLeaveSummary>;
}

// ----------------------------------------------------------------------------
// MOCK IMPLEMENTATION (Swappable with GreytHR, Keka, BambooHR, etc.)
// ----------------------------------------------------------------------------

const MOCK_LEAVE_DATA: Record<string, Partial<ExternalLeaveSummary>> = {
  'emp-vikram-patel': {
    total_available_leave_days: 14.5,
    total_encashable_days: 10,
    per_day_encashment_rate_inr: 2850,
    balances_by_type: [
      {
        leave_type: 'privilege_earned_leave',
        total_accrued: 18,
        consumed: 8,
        available_balance: 10,
        encashable: true,
        encashment_limit_days: 15,
      },
      {
        leave_type: 'casual_sick_leave',
        total_accrued: 12,
        consumed: 7.5,
        available_balance: 4.5,
        encashable: false,
        encashment_limit_days: 0,
      },
    ],
    pending_leave_applications: [],
  },
  'emp-rajesh-verma': {
    total_available_leave_days: 6,
    total_encashable_days: 4,
    per_day_encashment_rate_inr: 2100,
    balances_by_type: [
      {
        leave_type: 'privilege_earned_leave',
        total_accrued: 12,
        consumed: 8,
        available_balance: 4,
        encashable: true,
        encashment_limit_days: 15,
      },
      {
        leave_type: 'casual_sick_leave',
        total_accrued: 10,
        consumed: 8,
        available_balance: 2,
        encashable: false,
        encashment_limit_days: 0,
      },
    ],
    pending_leave_applications: [
      {
        from_date: '2026-09-28',
        to_date: '2026-09-29',
        leave_type: 'casual_sick_leave',
        days: 2,
        approval_status: 'pending_manager',
      },
    ],
  },
};

export class MockLeaveIntegrationService implements ILeaveIntegrationService {
  async getEmployeeLeaveSummary(employeeId: string): Promise<ExternalLeaveSummary> {
    const existing = MOCK_LEAVE_DATA[employeeId];

    return {
      source_system: 'Enterprise_HRMS_Leave_API',
      fetched_at: new Date().toISOString(),
      employee_id: employeeId,
      total_available_leave_days: existing?.total_available_leave_days ?? 12,
      total_encashable_days: existing?.total_encashable_days ?? 8,
      per_day_encashment_rate_inr: existing?.per_day_encashment_rate_inr ?? 2500,
      balances_by_type: existing?.balances_by_type || [
        {
          leave_type: 'privilege_earned_leave',
          total_accrued: 15,
          consumed: 7,
          available_balance: 8,
          encashable: true,
          encashment_limit_days: 15,
        },
        {
          leave_type: 'casual_sick_leave',
          total_accrued: 10,
          consumed: 6,
          available_balance: 4,
          encashable: false,
          encashment_limit_days: 0,
        },
      ],
      pending_leave_applications: existing?.pending_leave_applications || [],
    };
  }
}

export const leaveIntegrationService = new MockLeaveIntegrationService();
