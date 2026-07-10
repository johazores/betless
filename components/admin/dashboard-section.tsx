'use client';

import { useCallback, useEffect, useState } from 'react';
import { SectionHeader } from '@/components/admin/section-header';
import { fetchTabData } from '@/components/admin/admin-utils';
import type { AnalyticsData } from '@/components/admin/types';
import { formatNumber, formatPeso } from '@/components/admin/types';
import { Card } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { LoadingState } from '@/components/ui/loading-state';
import { MiniBarChart } from '@/components/ui/mini-bar-chart';
import { Stat } from '@/components/ui/stat';

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

  const chartData = data.userGrowth.map((day) => ({
    label: day.date,
    value: day.registrations,
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        badge="Overview"
        title="Dashboard"
        description="Platform metrics, user growth, and environment health at a glance."
      />

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-ink-muted">Users & engagement</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total users" value={formatNumber(data.metrics.totalUsers)} />
          <KpiCard label="Active users (30d)" value={formatNumber(data.metrics.activeUsers)} tone="brand" />
          <KpiCard label="Points issued" value={formatNumber(data.metrics.pointsIssued)} />
          <KpiCard label="Points redeemed" value={formatNumber(data.metrics.pointsRedeemed)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-ink-muted">Vaults & on-chain</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Locked balance" value={formatPeso(data.metrics.lockedBalance)} />
          <KpiCard label="Total vaults" value={formatNumber(data.metrics.allVaults)} />
          <KpiCard label="Active vaults" value={formatNumber(data.metrics.activeVaults)} />
          <KpiCard
            label="Failed on-chain ops"
            value={formatNumber(data.metrics.failedOps)}
            tone={data.metrics.failedOps > 0 ? 'danger' : 'default'}
            hint={`${formatNumber(data.metrics.stellarOps)} total operations`}
          />
        </div>
      </section>

      <Card padding="lg" className="shadow-sm">
        <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">Registrations</h3>
            <p className="text-sm text-ink-muted">Daily sign-ups over the last 30 days</p>
          </div>
        </div>
        <div className="mt-5">
          <MiniBarChart
            data={chartData}
            valueLabel="registrations"
            emptyMessage="No registrations in the last 30 days"
          />
        </div>
      </Card>

      <Card padding="lg" className="shadow-sm">
        <h3 className="text-base font-semibold text-ink">Environment</h3>
        <p className="mt-1 text-sm text-ink-muted">Runtime configuration visible to administrators</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.environment).map(([key, value]) => (
            <Stat
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
              value={String(value ?? '—')}
              mono
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
