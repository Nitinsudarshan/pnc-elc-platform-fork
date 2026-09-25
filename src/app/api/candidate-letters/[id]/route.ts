import { NextRequest, NextResponse } from 'next/server';
import { getCandidateLetterById } from '@/lib/letter-templates/service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const letter = await getCandidateLetterById(id);
    if (!letter) {
      return NextResponse.json({ success: false, error: 'Letter not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: letter });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
