'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { AccountAvatarLink } from '@/components/layout/account-avatar-link';

export function AuthNav() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="h-10 w-28 rounded-full bg-surface-sunken" aria-label="Loading account navigation" />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="hidden rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-bold text-ink transition hover:bg-surface-muted sm:inline-flex"
        >
          Sign in
        </Link>
        <Link href="/sign-up" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-ink/90">
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/create-vault" className="hidden rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-ink/90 md:inline-flex">
        New vault
      </Link>
      <AccountAvatarLink />
    </div>
  );
}
