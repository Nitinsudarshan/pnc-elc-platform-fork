import { NextRequest, NextResponse } from 'next/server';
import { getAllOnboardingRecords, createOnboardingRecord } from '@/lib/onboarding/service';

export async function GET() {
  try {
    const records = await getAllOnboardingRecords();
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await createOnboardingRecord(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
