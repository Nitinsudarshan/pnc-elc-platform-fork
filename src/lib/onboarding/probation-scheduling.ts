import {
  calendarAvailabilityService,
  type BusyBlock,
} from '@/lib/integrations/calendar-availability';
import type { ProbationMilestone, EmployeeProbationMilestones } from './types';

// ============================================================================
// PROBATION CHECK-IN AUTO-SCHEDULING
// ----------------------------------------------------------------------------
// The 30-day check-in and 60-day review are booked with the reporting manager
// automatically — P&C should never have to chase them. The rules:
//
//   * target is joining date + 30 / + 60 calendar days;
//   * the meeting always lands Monday–Friday (a weekend target rolls forward to
//     the next Monday, since a check-in should not happen early);
//   * it is placed in the first half of the working day (09:00–13:00);
//   * the manager's calendar is consulted and the first genuinely open slot in
//     that window is taken;
//   * if the whole morning is booked, the search walks forward day by day.
//
// Everything produced here is a proposal. Both parties can move the meeting
// afterwards — `auto_scheduled` records that ELC placed it, and `rescheduled`
// records that a human has since moved it, so a later re-run leaves it alone.
//
// NOTE: the 90-day confirmation is deliberately NOT scheduled here. Employment
// confirmation is a separate process with its own rules and lives in the
// Confirmation module.
// ============================================================================

/** Earliest a check-in may start (24h clock, local time). */
export const WORKDAY_START_HOUR = 9;
/** "First half of the day" — the last slot must finish by this hour. */
export const FIRST_HALF_END_HOUR = 13;
/** Meeting length in minutes. */
export const CHECKIN_DURATION_MINUTES = 45;
/** Slot granularity used when walking the morning. */
const SLOT_STEP_MINUTES = 30;
/** How many days forward to search before giving up and taking the target date. */
const MAX_SEARCH_DAYS = 14;

export type MilestoneKey = 'day_30' | 'day_60';

export const MILESTONE_DEFINITIONS: Record<
  MilestoneKey,
  { key: MilestoneKey; offsetDays: number; label: string; purpose: string }
> = {
  day_30: {
    key: 'day_30',
    offsetDays: 30,
    label: '30-Day Check-in',
    purpose: 'Early settling-in conversation: ramp-up, clarity of role, and any blockers.',
  },
  day_60: {
    key: 'day_60',
    offsetDays: 60,
    label: '60-Day Review',
    purpose: 'Mid-probation review against the first-90-days plan and agreed goals.',
  },
};

export const MILESTONE_KEYS: MilestoneKey[] = ['day_30', 'day_60'];

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Roll a date forward to the next weekday. A Saturday or Sunday becomes Monday. */
function toNextWeekday(date: Date): Date {
  const d = new Date(date);
  while (isWeekend(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function overlaps(startMs: number, endMs: number, busy: BusyBlock[]): boolean {
  return busy.some((b) => {
    const bStart = new Date(b.start).getTime();
    const bEnd = new Date(b.end).getTime();
    return startMs < bEnd && endMs > bStart;
  });
}

/** Candidate start times in the first half of one working day, earliest first. */
function morningSlots(day: Date): Date[] {
  const slots: Date[] = [];
  const cursor = new Date(day);
  cursor.setHours(WORKDAY_START_HOUR, 0, 0, 0);

  const lastAcceptableEnd = new Date(day);
  lastAcceptableEnd.setHours(FIRST_HALF_END_HOUR, 0, 0, 0);

  while (cursor.getTime() + CHECKIN_DURATION_MINUTES * 60000 <= lastAcceptableEnd.getTime()) {
    slots.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + SLOT_STEP_MINUTES);
  }

  return slots;
}

export interface ScheduledSlot {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** ISO 8601 start of the meeting. */
  startsAt: string;
  /** ISO 8601 end of the meeting. */
  endsAt: string;
  /** True when every morning slot on the target day was taken and we moved on. */
  movedFromTarget: boolean;
  /** Why the slot ended up where it did — surfaced in the UI and audit trail. */
  reason: string;
}

function toLocalDateKey(d: Date) {
  // Local calendar date, not UTC: a 09:00 IST slot must not report as the previous day.
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Find the first open Mon–Fri morning slot at or after `targetDate`.
 * Falls back to the earliest morning slot on the target weekday when the
 * manager has no free window in the search horizon — a booked proposal the
 * manager can move beats no meeting at all.
 */
export function findOpenMorningSlot(targetDate: Date, busy: BusyBlock[]): ScheduledSlot {
  const start = toNextWeekday(targetDate);
  const rolledForWeekend = start.getTime() !== new Date(targetDate).setHours(0, 0, 0, 0)
    && isWeekend(targetDate);

  for (let offset = 0; offset < MAX_SEARCH_DAYS; offset++) {
    const day = new Date(start);
    day.setDate(day.getDate() + offset);
    if (isWeekend(day)) continue;

    for (const slotStart of morningSlots(day)) {
      const startMs = slotStart.getTime();
      const endMs = startMs + CHECKIN_DURATION_MINUTES * 60000;
      if (overlaps(startMs, endMs, busy)) continue;

      const movedDays = offset > 0;
      let reason: string;
      if (movedDays) {
        reason = `Target day was fully booked; moved to the next weekday with an open morning slot.`;
      } else if (rolledForWeekend) {
        reason = `Target fell on a weekend; moved to the following Monday morning.`;
      } else {
        reason = `First open slot in the manager's morning on the target day.`;
      }

      return {
        date: toLocalDateKey(slotStart),
        startsAt: slotStart.toISOString(),
        endsAt: new Date(endMs).toISOString(),
        movedFromTarget: movedDays || rolledForWeekend,
        reason,
      };
    }
  }

  // Nothing open in the horizon — propose the first morning slot on the target
  // weekday anyway and let the participants move it.
  const fallbackStart = morningSlots(start)[0] || (() => {
    const d = new Date(start);
    d.setHours(WORKDAY_START_HOUR, 0, 0, 0);
    return d;
  })();

  return {
    date: toLocalDateKey(fallbackStart),
    startsAt: fallbackStart.toISOString(),
    endsAt: new Date(fallbackStart.getTime() + CHECKIN_DURATION_MINUTES * 60000).toISOString(),
    movedFromTarget: rolledForWeekend,
    reason: "No open morning slot found in the next two weeks; proposed the manager's first morning slot to be moved manually.",
  };
}

export interface ProbationScheduleInput {
  /** `YYYY-MM-DD` joining date. */
  joiningDate: string;
  managerName?: string | null;
  /** Manager's calendar id — their work email. */
  managerEmail?: string | null;
  /** Existing milestones; anything already moved by a human is preserved. */
  existing?: EmployeeProbationMilestones;
}

export interface ScheduledMilestone extends ProbationMilestone {
  starts_at?: string;
  ends_at?: string;
  auto_scheduled?: boolean;
  rescheduled?: boolean;
  scheduling_note?: string;
}

export interface ProbationScheduleResult {
  day_30: ScheduledMilestone;
  day_60: ScheduledMilestone;
  /** Milestones this run actually placed, for audit and notification. */
  newlyScheduled: MilestoneKey[];
}

/**
 * Build (or refresh) the 30- and 60-day check-in schedule for one employee.
 *
 * Idempotent by design: a milestone that is already completed, or that a human
 * has rescheduled, is returned untouched. Only pending/unscheduled milestones
 * are placed, so this is safe to call on every provisioning save.
 */
export async function buildProbationSchedule(
  input: ProbationScheduleInput
): Promise<ProbationScheduleResult> {
  const joining = new Date(input.joiningDate);
  const existing = input.existing || {};
  const newlyScheduled: MilestoneKey[] = [];

  // One free/busy read covers both milestones.
  const windowStart = new Date(joining);
  windowStart.setDate(windowStart.getDate() + MILESTONE_DEFINITIONS.day_30.offsetDays - 1);
  const windowEnd = new Date(joining);
  windowEnd.setDate(windowEnd.getDate() + MILESTONE_DEFINITIONS.day_60.offsetDays + MAX_SEARCH_DAYS);

  let busy: BusyBlock[] = [];
  if (input.managerEmail) {
    try {
      const freeBusy = await calendarAvailabilityService.getFreeBusy(
        input.managerEmail,
        windowStart.toISOString(),
        windowEnd.toISOString()
      );
      busy = freeBusy.busy;
    } catch {
      // No calendar reachable — schedule on the rules alone.
    }
  }

  const bookedInThisRun: BusyBlock[] = [];
  const result: Partial<ProbationScheduleResult> = {};

  for (const key of MILESTONE_KEYS) {
    const def = MILESTONE_DEFINITIONS[key];
    const current = (existing[key] || {}) as ScheduledMilestone;

    // Leave completed or human-moved milestones exactly as they are.
    if (current.status === 'completed' || current.rescheduled) {
      result[key] = current;
      continue;
    }
    // Already auto-scheduled with a slot: keep it, so re-saving does not shuffle
    // a meeting the manager may already have in their calendar.
    if (current.status === 'scheduled' && current.starts_at) {
      result[key] = current;
      bookedInThisRun.push({ start: current.starts_at, end: current.ends_at || current.starts_at });
      continue;
    }

    const target = new Date(joining);
    target.setDate(target.getDate() + def.offsetDays);

    const slot = findOpenMorningSlot(target, [...busy, ...bookedInThisRun]);
    bookedInThisRun.push({ start: slot.startsAt, end: slot.endsAt });
    newlyScheduled.push(key);

    result[key] = {
      ...current,
      status: 'scheduled',
      due_date: slot.date,
      starts_at: slot.startsAt,
      ends_at: slot.endsAt,
      reviewer_name: current.reviewer_name || input.managerName || 'Reporting Manager',
      auto_scheduled: true,
      rescheduled: false,
      scheduling_note: slot.reason,
      notes: current.notes || def.purpose,
    };
  }

  return {
    day_30: result.day_30!,
    day_60: result.day_60!,
    newlyScheduled,
  };
}

/** Human-readable time range for a scheduled milestone, e.g. "10:00 – 10:45 AM". */
export function formatSlotTime(milestone?: ScheduledMilestone | null): string | null {
  if (!milestone?.starts_at) return null;
  const start = new Date(milestone.starts_at);
  const end = milestone.ends_at ? new Date(milestone.ends_at) : null;

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

/** Weekday + date label for a scheduled milestone, e.g. "Mon, 10 Nov 2026". */
export function formatSlotDate(milestone?: ScheduledMilestone | null): string | null {
  const iso = milestone?.starts_at || milestone?.due_date;
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
