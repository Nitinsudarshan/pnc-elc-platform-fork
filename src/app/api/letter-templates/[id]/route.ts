import { NextRequest, NextResponse } from 'next/server';
import {
  getLetterTemplateById,
  updateLetterTemplate,
  toggleTemplateArchive,
} from '@/lib/letter-templates/service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await getLetterTemplateById(id);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.action === 'archive') {
      const result = await toggleTemplateArchive(id, true);
      return NextResponse.json({ success: true, data: result });
    }

    if (body.action === 'restore') {
      const result = await toggleTemplateArchive(id, false);
      return NextResponse.json({ success: true, data: result });
    }

    const updated = await updateLetterTemplate(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Template not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await toggleTemplateArchive(id, true);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
