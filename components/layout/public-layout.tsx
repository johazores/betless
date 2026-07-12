'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthNav } from '@/components/layout/auth-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Logo } from '@/components/layout/logo';
import { NavSummary } from '@/components/layout/nav-summary';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { PageContainer, pageGutterClass } from '@/components/layout/page-container';
import { cn } from '@/lib/class-names';

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isHash = href.includes('#');
  const active = isHash
    ? pathname === '/'
    : href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
        active ? 'bg-surface-sunken text-ink' : 'text-ink-muted hover:bg-surface-sunken/70 hover:text-ink',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

const footerLinks = {
  product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Create lock pot', href: '/create-vault' },
    { label: 'Proof of reserves', href: '/reserves' },
    { label: 'How it works', href: '/#how-it-works' },
  ],
};

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="sticky top-0 z-30 overflow-visible border-b border-line/70 bg-surface/85 backdrop-blur-md">
        <div className={pageGutterClass}>
          <PageContainer className="flex h-[4.25rem] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6 lg:gap-10">
              <Link
                href="/"
                className="shrink-0 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                aria-label="Betless home"
              >
                <Logo showTagline={false} markClassName="h-9 w-9" />
              </Link>
              <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/rewards">Rewards</NavLink>
                <NavLink href="/#how-it-works">How it works</NavLink>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <NavSummary />
              <NotificationBell />
              <AuthNav />
            </div>
          </PageContainer>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t border-line/70 bg-surface">
        <div className={cn(pageGutterClass, 'pb-28 pt-12 lg:pb-12')}>
          <PageContainer>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
              <div>
                <Logo showTagline markClassName="h-8 w-8" />
                <p className="mt-4 max-w-sm text-sm leading-6 text-ink-muted">
                  Auto-lock remittance on Stellar for named savings goals. Shareable verification for senders abroad.
                  100% returned at maturity.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Product</p>
                <ul className="mt-4 space-y-2.5">
                  {footerLinks.product.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Trust & compliance</p>
                <p className="mt-4 text-sm leading-6 text-ink-muted">
                  Funds are held through licensed custodial partners. Vault locks are independently verifiable on the Stellar network. Rewards are fulfilled by partner merchants.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-2 border-t border-line/70 pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Betless. All rights reserved.</p>
              <p className="sm:text-right">Stellar-verified locks · Partner-fulfilled rewards</p>
            </div>
          </PageContainer>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
