import { NextRequest, NextResponse } from 'next/server';
import { getLetterTemplates, createLetterTemplate } from '@/lib/letter-templates/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const employee_type = searchParams.get('employee_type') || undefined;
    const letter_type = searchParams.get('letter_type') || undefined;

    const templates = await getLetterTemplates({
      status: status || 'all',
      employee_type,
      letter_type,
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.letter_type || !body.employee_type_name || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Name, letter type, employee type, and content are required' },
        { status: 400 }
      );
    }
    const template = await createLetterTemplate(body);
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
