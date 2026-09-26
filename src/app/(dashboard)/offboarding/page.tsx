import React from 'react';
import { getAllOffboardingCases, getAllResignationRequests } from '@/lib/offboarding/service';
import { getEmployees } from '@/lib/employees/getEmployees';
import { OffboardingView } from './offboarding-view';

export const dynamic = 'force-dynamic';

export default async function OffboardingPage() {
  const [cases, resignationRequests, employees] = await Promise.all([
    getAllOffboardingCases(),
    getAllResignationRequests(),
    getEmployees(),
  ]);

  return (
    <OffboardingView
      initialCases={cases}
      initialResignationRequests={resignationRequests}
      employees={employees}
    />
  );
}

