'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageOnboardingNewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/candidate/new');
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center p-8 text-xs text-muted-foreground">
      Redirecting to Create Candidate Onboarding...
    </div>
  );
}
