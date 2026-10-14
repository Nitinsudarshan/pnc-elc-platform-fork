import { NextRequest, NextResponse } from 'next/server';
import { getAuditTrail, recordAuditEvent, summarizeByModule } from '@/lib/audit/service';
import { backfillAuditTrail } from '@/lib/audit/seed';
import type { AuditActorType, AuditModule, AuditSeverity } from '@/lib/audit/types';

/**
 * GET /api/audit
 *
 * Reads the unified employee audit trail. Pass `employee_id` and/or
 * `employee_email` to scope it to one person; both together stitch the
 * candidate-stage and post-exit halves of a history into one stream.
 */
export async function GET(req: NextRequest) {
  try {
    // Project pre-existing module activity logs into the trail on first read.
    await backfillAuditTrail();

    const sp = req.nextUrl.searchParams;

    const events = await getAuditTrail({
      employee_id: sp.get('employee_id') || undefined,
      employee_email: sp.get('employee_email') || undefined,
      module: (sp.get('module') as AuditModule | 'all') || undefined,
      actor_type: (sp.get('actor_type') as AuditActorType | 'all') || undefined,
      severity: (sp.get('severity') as AuditSeverity | 'all') || undefined,
      entity_id: sp.get('entity_id') || undefined,
      search: sp.get('search') || undefined,
      from_date: sp.get('from_date') || undefined,
      to_date: sp.get('to_date') || undefined,
      limit: sp.get('limit') ? Number(sp.get('limit')) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: events,
      summary: { total: events.length, by_module: summarizeByModule(events) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/audit
 *
 * Appends an event from a client-side action that has no server route of its
 * own (a letter download, a dossier export). Server-side flows should call
 * `recordAuditEvent` directly rather than round-tripping through this route.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.subject?.employee_id && !body?.subject?.employee_email) {
      return NextResponse.json(
        { success: false, error: 'An audit event requires an employee_id or employee_email subject.' },
        { status: 400 }
      );
    }
    if (!body.module || !body.action || !body.description) {
      return NextResponse.json(
        { success: false, error: 'module, action and description are required.' },
        { status: 400 }
      );
    }

    const event = await recordAuditEvent(body);
    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
