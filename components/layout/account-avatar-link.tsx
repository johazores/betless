'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/class-names';

/**
 * White-labeled replacement for Clerk's UserButton: an avatar with the user's
 * initial that links to the in-app /account page. No Clerk UI is rendered.
 */
export function AccountAvatarLink({ className }: { className?: string }) {
  const { user } = useUser();

  const initial =
    user?.firstName?.[0] ??
    user?.primaryEmailAddress?.emailAddress?.[0] ??
    'A';

  return (
    <Link
      href="/account"
      aria-label="Your account"
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-black uppercase text-white ring-2 ring-line transition hover:ring-brand-300',
        className,
      )}
    >
      {initial}
    </Link>
  );
}
