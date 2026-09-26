import React from 'react';
import { notFound } from 'next/navigation';
import { getOffboardingById } from '@/lib/offboarding/service';
import { CaseDetailView } from './case-detail-view';

export const dynamic = 'force-dynamic';

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const data = await getOffboardingById(id);

  if (!data) {
    notFound();
  }

  return <CaseDetailView data={data} />;
}
