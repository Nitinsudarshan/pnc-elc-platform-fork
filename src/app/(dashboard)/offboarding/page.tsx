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
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 pb-20 animate-in fade-in duration-300">
      <OffboardingView
        initialCases={cases}
        initialResignationRequests={resignationRequests}
        employees={employees}
      />
    </div>
  );
}
