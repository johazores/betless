'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionHeader } from '@/components/admin/section-header';
import { fetchTabData } from '@/components/admin/admin-utils';
import type { AnalyticsData } from '@/components/admin/types';
import { formatNumber, formatPeso } from '@/components/admin/types';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-ink">{value}</p>
    </Card>
  );
}

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
      <SectionHeader
        badge="Overview"
        title="Dashboard"
        description="Platform metrics, user growth, and environment health at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total users" value={formatNumber(data.metrics.totalUsers)} />
        <MetricCard label="Active users" value={formatNumber(data.metrics.activeUsers)} />
        <MetricCard label="Locked balance" value={formatPeso(data.metrics.lockedBalance)} />
        <MetricCard label="Points issued" value={formatNumber(data.metrics.pointsIssued)} />
        <MetricCard label="Points redeemed" value={formatNumber(data.metrics.pointsRedeemed)} />
        <MetricCard label="Vaults" value={formatNumber(data.metrics.allVaults)} />
        <MetricCard label="Active vaults" value={formatNumber(data.metrics.activeVaults)} />
        <MetricCard label="On-chain ops" value={formatNumber(data.metrics.stellarOps)} />
        <MetricCard label="Failed ops" value={formatNumber(data.metrics.failedOps)} />
      </div>

      <Card padding="lg">
        <h3 className="text-lg font-black text-ink">Registrations — last 30 days</h3>
        <div className="mt-5 flex h-36 items-end gap-1.5">
          {data.userGrowth.map((day) => (
            <div key={day.date} title={`${day.date}: ${day.registrations}`} className="flex flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-200 hover:from-brand-600 hover:to-brand-500"
                style={{ height: `${Math.max(6, (day.registrations / maxRegistrations) * 100)}%` }}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="text-lg font-black text-ink">Environment</h3>
        <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
          {Object.entries(data.environment).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-sm font-semibold text-ink-muted">{key}</dt>
              <dd className="break-all text-sm font-medium text-ink">{String(value ?? '—')}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
