'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/class-names';

/**
 * White-labeled replacement for Clerk's UserButton: avatar links to /account.
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
      aria-label="Your profile"
      className={cn(
        'relative grid h-9 w-9 place-items-center overflow-hidden rounded-full ring-2 ring-line transition hover:ring-brand-300',
        !user?.imageUrl && 'bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-black uppercase text-white',
        className,
      )}
    >
      {user?.imageUrl ? (
        <Image src={user.imageUrl} alt="" width={36} height={36} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </Link>
  );
}
