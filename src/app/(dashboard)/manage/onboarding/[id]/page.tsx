'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyOnboardingDetailRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const res = await fetch(`/api/onboarding/${id}`);
        const json = await res.json();
        if (json.success && json.data?.record?.invitation_token) {
          router.replace(`/onboarding/review/${json.data.record.invitation_token}`);
        } else {
          router.replace(`/onboarding/review/${id}`);
        }
      } catch (err) {
        router.replace(`/onboarding/review/${id}`);
      }
    }
    redirect();
  }, [id, router]);

  return (
    <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground font-medium">
      Redirecting to candidate review console...
    </div>
  );
}
