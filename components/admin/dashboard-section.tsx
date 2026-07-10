'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { Stat } from '@/components/ui/stat';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import type { AnalyticsData } from '@/components/admin/types';
import { formatNumber, formatPeso } from '@/components/admin/types';

export function DashboardSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await fetchTabData<AnalyticsData>('/api/admin/analytics'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading || !data) return <LoadingState label="Loading dashboard..." />;

  const maxRegistrations = Math.max(...data.userGrowth.map((d) => d.registrations), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-ink">Analytics dashboard</h2>
        <p className="mt-1 text-sm text-ink-muted">Platform metrics and environment health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Total users" value={formatNumber(data.metrics.totalUsers)} />
        <Stat label="Active users" value={formatNumber(data.metrics.activeUsers)} />
        <Stat label="Locked balance" value={formatPeso(data.metrics.lockedBalance)} />
        <Stat label="Points issued" value={formatNumber(data.metrics.pointsIssued)} />
        <Stat label="Points redeemed" value={formatNumber(data.metrics.pointsRedeemed)} />
        <Stat label="Vaults" value={formatNumber(data.metrics.allVaults)} />
        <Stat label="Active vaults" value={formatNumber(data.metrics.activeVaults)} />
        <Stat label="On-chain ops" value={formatNumber(data.metrics.stellarOps)} />
        <Stat label="Failed ops" value={formatNumber(data.metrics.failedOps)} />
      </div>

      <Card padding="lg">
        <h3 className="text-lg font-black text-ink">Registrations, last 30 days</h3>
        <div className="mt-4 flex h-32 items-end gap-1">
          {data.userGrowth.map((day) => (
            <div key={day.date} title={`${day.date}: ${day.registrations}`} className="flex flex-1 items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-brand-500 to-brand-400"
                style={{ height: `${Math.max(4, (day.registrations / maxRegistrations) * 100)}%` }}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-lg font-black text-ink">Environment</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Object.entries(data.environment).map(([key, value]) => (
            <Stat key={key} label={key} value={String(value ?? '—')} mono />
          ))}
        </div>
      </Card>
    </div>
  );
}
