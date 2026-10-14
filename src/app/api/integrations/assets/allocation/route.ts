import { NextRequest, NextResponse } from 'next/server';
import { assetIntegrationService } from '@/lib/integrations/assets';

/**
 * GET /api/integrations/assets/allocation?employee_reference=NG-2026-00124
 *
 * Read-only passthrough to the external Asset Management System, which owns
 * hardware allocation end to end. ELC neither raises nor fulfils these requests
 * — it only reports what that system says so P&C can see a joiner's laptop
 * status without leaving the onboarding view.
 */
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('employee_reference');

  if (!reference) {
    return NextResponse.json(
      { success: false, error: 'employee_reference is required.' },
      { status: 400 }
    );
  }

  try {
    const data = await assetIntegrationService.getOnboardingAllocationStatus(reference);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    // A failing upstream must not break the onboarding page — the UI renders an
    // "unavailable" state from this response.
    return NextResponse.json(
      { success: false, error: error?.message || 'Asset Management System unreachable.' },
      { status: 502 }
    );
  }
}
