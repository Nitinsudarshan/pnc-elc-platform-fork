import React from 'react';
import { getAllOffboardingCases } from '@/lib/offboarding/service';
import { getEmployees } from '@/lib/employees/getEmployees';
import { OffboardingView } from './offboarding-view';

export const dynamic = 'force-dynamic';

export default async function OffboardingPage() {
  const [cases, employees] = await Promise.all([
    getAllOffboardingCases(),
    getEmployees(),
  ]);

  return <OffboardingView initialCases={cases} employees={employees} />;
}
