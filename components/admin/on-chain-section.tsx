'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import { FilterToolbar } from '@/components/admin/filter-toolbar';
import { StatusBadge } from '@/components/admin/status-badge';
import { SectionHeader } from '@/components/admin/section-header';
import { formatPeso } from '@/components/admin/types';
import { AdminPermission } from '@/lib/admin-permissions';
import { adminApiRequest } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/ui/kpi-card';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';

type OnChainSectionProps = {
  can: (permission: string) => boolean;
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

type ChainData = {
  health: Record<string, unknown>;
  operations: Array<{
    id: string;
    kind: string;
    vaultId: string;
    userEmail: string | null;
    state: string;
    amount: number;
    explorerUrl: string | null;
    errorMessage: string | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export function OnChainSection({ can, onSuccess, onError }: OnChainSectionProps) {
  const [data, setData] = useState<ChainData | null>(null);
  const [state, setState] = useState('ALL');
  const [kind, setKind] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [retryId, setRetryId] = useState<string | null>(null);
  const [retryReason, setRetryReason] = useState('');
  const [retryConfirm, setRetryConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await fetchTabData<ChainData>(`/api/admin/on-chain${buildQuery({ state, kind, q: query || undefined, page })}`));
    } catch (loadError) {
      onError('On-chain data could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [state, kind, query, page, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitRetry() {
    if (!retryId) return;
    setIsSubmitting(true);
    try {
      await adminApiRequest(`/api/admin/on-chain/${retryId}/retry`, {
        method: 'POST',
        body: JSON.stringify({ confirmation: 'RETRY', reason: retryReason }),
      });
      onSuccess('Retry submitted');
      setRetryId(null);
      setRetryReason('');
      setRetryConfirm('');
      await load();
    } catch (submitError) {
      onError('Retry failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        badge="Stellar"
        title="On-chain"
        description="Monitor Stellar operations and retry failed transactions."
      />

      {data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.health).map(([key, value]) => (
            <KpiCard
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
              value={String(value)}
            />
          ))}
        </div>
      ) : null}

      <FilterToolbar
        layout="wide"
        onSubmit={(event) => { event.preventDefault(); setPage(1); void load(); }}
      >
        <Input label="User email" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select label="State" value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} options={[
          { label: 'All states', value: 'ALL' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Confirmed', value: 'CONFIRMED' },
          { label: 'Failed', value: 'FAILED' },
        ]} />
        <Select label="Kind" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} options={[
          { label: 'All kinds', value: 'ALL' },
          { label: 'Lock', value: 'LOCK' },
          { label: 'Claim', value: 'CLAIM' },
          { label: 'Early withdraw', value: 'EARLY_WITHDRAW' },
        ]} />
        <Button type="submit" variant="secondary" className="w-full lg:w-auto">Filter</Button>
      </FilterToolbar>

      {isLoading ? <LoadingState label="Loading operations..." /> : data ? (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <DataTable
            className="rounded-none border-0 shadow-none"
            headers={['Operation', 'User', 'Amount', 'State', 'Transaction', '']}
            rows={data.operations.map((op) => [
              <span key={`${op.id}-kind`} className="font-medium">{op.kind}</span>,
              op.userEmail ?? 'Unknown',
              formatPeso(op.amount),
              <StatusBadge key={`${op.id}-state`} status={op.state} />,
              op.explorerUrl ? (
                <a key={op.id} className="font-medium text-ink underline-offset-2 hover:text-brand-700 hover:underline" href={op.explorerUrl} target="_blank" rel="noreferrer">
                  View tx
                </a>
              ) : op.errorMessage ?? '—',
              can(AdminPermission.RETRY_ON_CHAIN) && op.state !== 'CONFIRMED'
                ? <Button key={`retry-${op.id}`} size="sm" variant="ghost" onClick={() => setRetryId(op.id)}>Retry</Button>
                : null,
            ])}
            emptyMessage="No on-chain operations found"
          />
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
        </div>
      ) : null}

      <ConfirmDialog
        open={retryId !== null}
        title="Retry on-chain operation"
        description="This will re-submit the failed Stellar operation. Provide a reason for the audit log."
        confirmLabel="Retry operation"
        tone="danger"
        confirmationText="RETRY"
        confirmationValue={retryConfirm}
        onConfirmationValueChange={setRetryConfirm}
        reason={retryReason}
        onReasonChange={setRetryReason}
        isLoading={isSubmitting}
        onConfirm={() => void submitRetry()}
        onCancel={() => { setRetryId(null); setRetryReason(''); setRetryConfirm(''); }}
      />
    </div>
  );
}
