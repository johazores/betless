import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthNav } from '@/components/layout/auth-nav';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-lg font-black text-white">B</span>
            <span>
              <span className="block text-base font-black tracking-tight text-slate-950">Betless</span>
              <span className="block text-xs font-bold text-slate-500">Commitment savings</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 lg:flex">
            <a href="/#how-it-works" className="hover:text-slate-950">How it works</a>
            <a href="/#stellar-proof" className="hover:text-slate-950">Receipt</a>
            <Link href="/dashboard" className="hover:text-slate-950">Dashboard</Link>
            <Link href="/activity" className="hover:text-slate-950">Activity</Link>
          </nav>
          <AuthNav />
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-bold text-slate-800">Betless helps users create commitment savings vaults.</p>
          <p>Funds, wallet custody, and reward fulfillment are handled through connected partners.</p>
        </div>
      </footer>
    </div>
  );
}
