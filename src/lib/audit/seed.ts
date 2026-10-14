import { recordAuditEvents } from './service';
import { hasMemoryAuditEvents } from './service';
import type { AuditEventInput, AuditActorType } from './types';

// ============================================================================
// BACKFILL FROM MODULE ACTIVITY LOGS
// ----------------------------------------------------------------------------
// The lifecycle modules kept their own per-record activity logs before the
// unified trail existed. On first read, those existing entries are projected
// into the audit log so a person's history does not appear to start the moment
// this feature shipped.
//
// This runs once per process and is a no-op as soon as anything has been
// recorded. It is called from the read paths (the audit page and API route),
// never from the audit service itself — that would create an import cycle,
// since the modules it reads from emit audit events of their own.
// ============================================================================

let backfilled = false;

function mapActorType(actor: string | undefined): AuditActorType {
  switch (actor) {
    case 'candidate':
      return 'candidate';
    case 'system':
      return 'system';
    case 'manager':
      return 'manager';
    case 'employee':
      return 'employee';
    case 'finance':
    case 'it_admin':
    case 'pnc':
      return 'pnc';
    default:
      return 'pnc';
  }
}

async function collectOnboardingEvents(): Promise<AuditEventInput[]> {
  try {
    const { getAllFullOnboardingData } = await import('@/lib/onboarding/service');
    const records = await getAllFullOnboardingData();

    return records.flatMap((item) =>
      (item.activityLogs || []).map<AuditEventInput>((log) => ({
        subject: {
          employee_id: item.provisioning?.employee_id_code || item.record.employee_id || null,
          employee_email: item.record.personal_email,
          employee_name: item.record.candidate_name,
        },
        actor: { actor_type: mapActorType(log.actor_type) },
        module: 'onboarding',
        // Derived from a pre-existing log line, so the verb is generic.
        action: 'onboarding.activity.logged',
        description: `${log.action}: ${log.description}`,
        severity: 'info',
        entity_type: 'onboarding',
        entity_id: item.record.id,
        metadata: { backfilled: true, source_log_id: log.id },
        occurred_at: log.created_at,
      }))
    );
  } catch {
    return [];
  }
}

async function collectOffboardingEvents(): Promise<AuditEventInput[]> {
  try {
    const { getAllOffboardingCases, getOffboardingById } = await import('@/lib/offboarding/service');
    const cases = await getAllOffboardingCases();

    const perCase = await Promise.all(
      cases.map(async (c) => {
        const full = await getOffboardingById(c.id);
        return (full?.activityLogs || []).map<AuditEventInput>((log) => ({
          subject: {
            employee_id: c.employee_id,
            employee_email: c.employee_email,
            employee_name: c.employee_name,
          },
          actor: {
            actor_type: mapActorType(log.actor_role),
            actor_name: log.actor_name,
          },
          module: 'offboarding',
          action: 'offboarding.activity.logged',
          description: `${log.action}: ${log.description}`,
          severity: 'info',
          entity_type: 'offboarding_case',
          entity_id: c.id,
          metadata: { backfilled: true, source_log_id: log.id },
          occurred_at: log.created_at,
        }));
      })
    );

    return perCase.flat();
  } catch {
    return [];
  }
}

/**
 * Project existing module activity logs into the unified trail, once.
 * Safe to call on every read: it returns immediately after the first run or as
 * soon as the trail has any content of its own.
 */
export async function backfillAuditTrail(): Promise<number> {
  if (backfilled || hasMemoryAuditEvents()) {
    backfilled = true;
    return 0;
  }
  backfilled = true;

  const [onboarding, offboarding] = await Promise.all([
    collectOnboardingEvents(),
    collectOffboardingEvents(),
  ]);

  const all = [...onboarding, ...offboarding];
  if (all.length === 0) return 0;

  await recordAuditEvents(all);
  return all.length;
}
