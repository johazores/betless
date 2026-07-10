'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/class-names';

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function VaultIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function GiftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13" />
      <path d="M12 8c-1.5-3-6-3.5-6-1s4.5 1.5 6 1zm0 0c1.5-3 6-3.5 6-1s-4.5 1.5-6 1z" />
    </svg>
  );
}

function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function useIsActive() {
  const pathname = usePathname() ?? '/';
  return (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
}

function TabLink({ href, label, icon, active }: { href: string; label: string; icon: ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
        active ? 'text-brand-600' : 'text-ink-muted hover:text-ink',
      )}
    >
      <span className={cn('grid h-6 w-6 place-items-center', active && 'scale-105')}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function AccountTab() {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && isSignedIn) {
    return (
      <span className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-ink-muted">
        <span className="grid h-6 w-6 place-items-center">
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'h-6 w-6' } }} />
        </span>
        <span>Account</span>
      </span>
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <span className="grid h-6 w-6 place-items-center">
          <UserIcon className="h-[22px] w-[22px]" />
        </span>
        <span>Sign in</span>
      </button>
    </SignInButton>
  );
}

export function BottomNav() {
  const isActive = useIsActive();
  const createActive = isActive('/create-vault');

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-2">
        <TabLink href="/" label="Home" active={isActive('/')} icon={<HomeIcon className="h-[22px] w-[22px]" />} />
        <TabLink href="/dashboard" label="Vaults" active={isActive('/dashboard') || isActive('/vaults')} icon={<VaultIcon className="h-[22px] w-[22px]" />} />

        <Link
          href="/create-vault"
          aria-label="Create vault"
          aria-current={createActive ? 'page' : undefined}
          className="flex flex-col items-center gap-1"
        >
          <span className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-elevated ring-4 ring-surface transition-transform active:scale-95">
            <PlusIcon className="h-6 w-6" />
          </span>
          <span className={cn('text-[11px] font-semibold', createActive ? 'text-brand-600' : 'text-ink-muted')}>Create</span>
        </Link>

        <TabLink href="/rewards" label="Rewards" active={isActive('/rewards')} icon={<GiftIcon className="h-[22px] w-[22px]" />} />
        <AccountTab />
      </div>
    </nav>
  );
}
