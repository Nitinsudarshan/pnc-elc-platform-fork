'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/candidate');
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center p-8 text-xs text-muted-foreground">
      Redirecting to Candidate Onboarding...
    </div>
  );
}
