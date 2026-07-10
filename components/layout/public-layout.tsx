import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthNav } from '@/components/layout/auth-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Logo } from '@/components/layout/logo';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-xl transition-opacity hover:opacity-90" aria-label="Betless home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-muted lg:flex">
            <a href="/#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="/#stellar-proof" className="transition-colors hover:text-ink">Receipt</a>
            <Link href="/dashboard" className="transition-colors hover:text-ink">Dashboard</Link>
            <Link href="/activity" className="transition-colors hover:text-ink">Activity</Link>
          </nav>
          <AuthNav />
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-28 pt-10 sm:px-6 lg:px-8 lg:pb-10">
          <Logo showTagline={false} markClassName="h-8 w-8" />
          <div className="flex flex-col gap-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-ink">Betless helps users create commitment savings vaults.</p>
            <p>Funds, wallet custody, and reward fulfillment are handled through connected partners.</p>
          </div>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
