import { NextRequest, NextResponse } from 'next/server';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  toggleArchiveDepartment,
} from '@/lib/departments/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get('includeArchived') !== 'false';
    const departments = await getDepartments(includeArchived);
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Department name is required' },
        { status: 400 }
      );
    }

    const newDepartment = await createDepartment({
      name: body.name.trim(),
      head_of_department_id: body.head_of_department_id || null,
      head_of_department_name: body.head_of_department_name || null,
      description: body.description || null,
    });

    return NextResponse.json({ success: true, data: newDepartment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create department' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Department ID is required' },
        { status: 400 }
      );
    }

    if (action === 'toggle_archive') {
      const updated = await toggleArchiveDepartment(id, Boolean(body.is_archived));
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = await updateDepartment(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update department' },
      { status: 500 }
    );
  }
}
