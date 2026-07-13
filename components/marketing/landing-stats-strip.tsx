'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api-client';
import { formatPeso } from '@/lib/money';
import type { PublicStatsView } from '@/types/transparency';

export function LandingStatsStrip() {
  const [stats, setStats] = useState<PublicStatsView | null>(null);

  useEffect(() => {
    void apiRequest<PublicStatsView>('/api/stats/public')
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats || stats.activeVaults === 0) return null;

  return (
    <div className="border-b border-line/70 bg-brand-50/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-ink">
          <span className="font-black tabular-nums">{formatPeso(stats.lockedPrincipal)}</span>
          {' '}locked across{' '}
          <span className="font-black tabular-nums">{stats.activeVaults}</span>
          {' '}active vault{stats.activeVaults === 1 ? '' : 's'}
          {stats.stellarEnabled ? (
            <>
              {' '}·{' '}
              <span className="font-black tabular-nums text-chain">{stats.verifiedOnChain}</span>
              {' '}verified on Stellar
            </>
          ) : null}
        </p>
        {stats.stellarEnabled ? (
          <Link href="/trust" className="text-sm font-bold text-chain hover:underline">
            Verify reserves →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
