'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { AccountAvatarLink } from '@/components/layout/account-avatar-link';
import { buttonClassName } from '@/components/ui/button';

export function AuthNav() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-surface-sunken" aria-label="Loading account navigation" />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/sign-in" className={`hidden sm:inline-flex ${buttonClassName({ variant: 'ghost', size: 'sm' })}`}>
          Sign in
        </Link>
        <Link href="/sign-up" className={buttonClassName({ size: 'sm' })}>
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/create-vault" className={`hidden md:inline-flex ${buttonClassName({ size: 'sm' })}`}>
        New vault
      </Link>
      <AccountAvatarLink />
    </div>
  );
}
