'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api-client';
import { formatPeso } from '@/lib/money';
import { onSummaryRefresh } from '@/lib/summary-events';
import type { SummaryView } from '@/types/vault';

function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9L12 2.5z" />
    </svg>
  );
}

/**
 * Locked Balance and Available Points pills. Always visible in the top-right
 * navigation for signed-in users, refreshed on navigation and after mutations.
 */
export function NavSummary() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const [summary, setSummary] = useState<SummaryView | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;

    const load = () => {
      apiRequest<SummaryView>('/api/summary')
        .then((data) => {
          if (!cancelled) setSummary(data);
        })
        .catch(() => {
          // Keep the last known values; the pills are informational.
        });
    };

    load();
    const unsubscribe = onSummaryRefresh(load);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isLoaded, isSignedIn, pathname]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted"
        title="Locked balance"
      >
        <span className="text-brand-700"><LockIcon /></span>
        <span className="tabular-nums">{summary ? formatPeso(summary.lockedBalance) : '—'}</span>
        <span className="hidden text-ink-muted md:inline">locked</span>
      </Link>
      <Link
        href="/rewards"
        className="flex items-center gap-1.5 rounded-xl border border-brand-200/80 bg-brand-50/80 px-2.5 py-1.5 text-xs font-medium text-brand-900 transition-colors hover:border-brand-300 hover:bg-brand-50"
        title="Available points"
      >
        <span className="text-brand-600"><StarIcon /></span>
        <span className="tabular-nums">{summary ? summary.availablePoints.toLocaleString('en-PH') : '—'}</span>
        <span className="hidden text-brand-700/80 md:inline">pts</span>
      </Link>
    </div>
  );
}
