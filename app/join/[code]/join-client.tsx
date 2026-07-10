'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { LoadingState } from '@/components/ui/loading-state';
import { REFERRAL_STORAGE_KEY, isValidReferralCodeShape } from '@/lib/referrals';

export function JoinClient({ code }: { code: string }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const normalized = decodeURIComponent(code).trim().toUpperCase();

    if (isValidReferralCodeShape(normalized)) {
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
    }

    // Signed-in users land on Rewards where the code is claimed automatically;
    // everyone else goes straight into sign-up.
    router.replace(isSignedIn ? '/rewards' : '/sign-up');
  }, [code, isLoaded, isSignedIn, router]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <LoadingState label="Preparing your invite…" />
    </div>
  );
}
