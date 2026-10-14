import { NextRequest, NextResponse } from 'next/server';
import { getCandidateLetters, createCandidateLetter } from '@/lib/letter-templates/service';
import { auditLetters } from '@/lib/audit/events';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const candidate_id = searchParams.get('candidate_id') || undefined;
    const search = searchParams.get('search') || undefined;

    const letters = await getCandidateLetters({
      candidate_id,
      search,
    });

    return NextResponse.json({ success: true, data: letters });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.candidate_name || !body.letter_type || !body.employee_type_name || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Candidate name, letter type, employee type, and content are required' },
        { status: 400 }
      );
    }
    const letter = await createCandidateLetter(body);

    await auditLetters.generated({
      subject: {
        employee_email: body.candidate_email,
        employee_name: body.candidate_name,
      },
      entityId: letter?.id || body.candidate_id,
      entityType: 'candidate_letter',
      letterType: body.template_name || body.letter_type,
      metadata: {
        template_id: body.template_id,
        employee_type: body.employee_type_name,
        addendum_type: body.addendum_type,
      },
    });

    return NextResponse.json({ success: true, data: letter });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
