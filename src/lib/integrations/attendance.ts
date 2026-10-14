// ============================================================================
// EXTERNAL ATTENDANCE SYSTEM INTEGRATION BOUNDARY
// ============================================================================
// The external Attendance/Biometric System is the source of truth.
// ELC offboarding queries it for last active attendance, anomalies, and payable days.
// ============================================================================

export interface AttendanceAnomaly {
  date: string;
  type: 'unapproved_absence' | 'half_day' | 'late_mark' | 'missing_punch';
  description: string;
}

export interface ExternalAttendanceSummary {
  source_system: 'Biometric_Attendance_Cloud_API';
  fetched_at: string;
  employee_id: string;
  last_recorded_swipe_date: string;
  total_working_days_in_month: number;
  days_present: number;
  approved_leaves: number;
  unauthorized_absences: number;
  calculated_payable_days: number;
  biometric_terminal: string;
  exceptions: AttendanceAnomaly[];
}

export interface IAttendanceIntegrationService {
  getEmployeeAttendanceSummary(
    employeeId: string,
    targetMonth?: string
  ): Promise<ExternalAttendanceSummary>;
}

// ----------------------------------------------------------------------------
// MOCK IMPLEMENTATION (Swappable with Keka, Darwinbox, ZingHR, etc.)
// ----------------------------------------------------------------------------

const MOCK_ATTENDANCE: Record<string, Partial<ExternalAttendanceSummary>> = {
  'emp-vikram-patel': {
    last_recorded_swipe_date: new Date().toISOString().split('T')[0],
    total_working_days_in_month: 22,
    days_present: 20,
    approved_leaves: 2,
    unauthorized_absences: 0,
    calculated_payable_days: 22,
    biometric_terminal: 'Sarjapur Campus - Academic Wing B',
    exceptions: [],
  },
  'emp-rajesh-verma': {
    last_recorded_swipe_date: '2026-09-24',
    total_working_days_in_month: 22,
    days_present: 18,
    approved_leaves: 1,
    unauthorized_absences: 3,
    calculated_payable_days: 19,
    biometric_terminal: 'Delhi Learning Center Terminal 1',
    exceptions: [
      {
        date: '2026-09-12',
        type: 'unapproved_absence',
        description: 'Absent without leave application on sprint delivery day',
      },
      {
        date: '2026-09-19',
        type: 'missing_punch',
        description: 'Missing evening punch-out swipe',
      },
    ],
  },
};

export class MockAttendanceIntegrationService implements IAttendanceIntegrationService {
  async getEmployeeAttendanceSummary(
    employeeId: string,
    _targetMonth?: string
  ): Promise<ExternalAttendanceSummary> {
    const existing = MOCK_ATTENDANCE[employeeId];
    const today = new Date().toISOString().split('T')[0];

    return {
      source_system: 'Biometric_Attendance_Cloud_API',
      fetched_at: new Date().toISOString(),
      employee_id: employeeId,
      last_recorded_swipe_date: existing?.last_recorded_swipe_date || today,
      total_working_days_in_month: existing?.total_working_days_in_month ?? 22,
      days_present: existing?.days_present ?? 21,
      approved_leaves: existing?.approved_leaves ?? 1,
      unauthorized_absences: existing?.unauthorized_absences ?? 0,
      calculated_payable_days: existing?.calculated_payable_days ?? 22,
      biometric_terminal: existing?.biometric_terminal || 'Main Campus Primary Biometric Gateway',
      exceptions: existing?.exceptions || [],
    };
  }
}

export const attendanceIntegrationService = new MockAttendanceIntegrationService();
