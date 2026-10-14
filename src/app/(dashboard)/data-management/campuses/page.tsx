'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CampusesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/data-management/locations');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-xs text-muted-foreground animate-pulse">Redirecting to Locations Management...</p>
    </div>
  );
}
