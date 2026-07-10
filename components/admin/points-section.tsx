'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import { formatNumber } from '@/components/admin/types';
import type { UserRow } from '@/components/admin/types';
import { adminApiRequest } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';

type PointsSectionProps = {
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

type PendingAdjustment = {
  kind: 'single' | 'bulk';
  appUserId?: string;
  userLabel?: string;
  emails?: string[];
  points: number;
  reason: string;
};

export function PointsSection({ onSuccess, onError }: PointsSectionProps) {
  const [subTab, setSubTab] = useState<'adjust' | 'history'>('adjust');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; type: string; points: number; description: string | null; userEmail: string | null; createdAt: string }>>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<PendingAdjustment | null>(null);

  const [singleUserId, setSingleUserId] = useState('');
  const [singlePoints, setSinglePoints] = useState('');
  const [singleReason, setSingleReason] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkPoints, setBulkPoints] = useState('');
  const [bulkReason, setBulkReason] = useState('');

  const loadUsers = useCallback(async () => {
    const result = await fetchTabData<{ users: UserRow[] }>('/api/admin/users?page=1');
    setUsers(result.users);
    if (result.users[0] && !singleUserId) setSingleUserId(result.users[0].id);
  }, [singleUserId]);

  const loadHistory = useCallback(async () => {
    const result = await fetchTabData<{ transactions: typeof history; total: number; page: number; pageSize: number }>(
      `/api/admin/points${buildQuery({ page: historyPage, type: 'ADMIN_ADJUSTMENT' })}`,
    );
    setHistory(result.transactions);
    setHistoryTotal(result.total);
    setHistoryPage(result.page);
    setHistoryPageSize(result.pageSize);
  }, [historyPage]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadUsers(), loadHistory()])
      .catch((error) => onError('Points data could not be loaded', error instanceof Error ? error.message : undefined))
      .finally(() => setIsLoading(false));
  }, [loadUsers, loadHistory, onError]);

  const bulkPreview = useMemo(() => {
    const emails = bulkEmails.split(/[\n,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    return Array.from(new Set(emails));
  }, [bulkEmails]);

  function queueSingle(event: FormEvent) {
    event.preventDefault();
    const user = users.find((u) => u.id === singleUserId);
    setPending({
      kind: 'single',
      appUserId: singleUserId,
      userLabel: user?.email ?? singleUserId,
      points: Number(singlePoints),
      reason: singleReason.trim(),
    });
    setConfirmOpen(true);
  }

  function queueBulk(event: FormEvent) {
    event.preventDefault();
    setPending({
      kind: 'bulk',
      emails: bulkPreview,
      points: Number(bulkPoints),
      reason: bulkReason.trim(),
    });
    setConfirmOpen(true);
  }

  async function confirmAdjustment() {
    if (!pending) return;
    setIsSubmitting(true);
    try {
      if (pending.kind === 'single') {
        await adminApiRequest('/api/admin/points/adjust', {
          method: 'POST',
          body: JSON.stringify({ appUserId: pending.appUserId, points: pending.points, reason: pending.reason }),
        });
        onSuccess('Points adjusted', `${pending.points > 0 ? '+' : ''}${pending.points} for ${pending.userLabel}`);
      } else {
        const result = await adminApiRequest<{ adjusted: number; missing: string[] }>('/api/admin/points/bulk', {
          method: 'POST',
          body: JSON.stringify({ emails: pending.emails?.join('\n'), points: pending.points, reason: pending.reason }),
        });
        onSuccess('Bulk adjustment complete', `Adjusted ${result.adjusted}; missing ${result.missing.length}.`);
      }
      setConfirmOpen(false);
      setPending(null);
      await loadHistory();
    } catch (submitError) {
      onError('Adjustment failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading points..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-ink">Points management</h2>
          <p className="mt-1 text-sm text-ink-muted">Adjust balances with full audit trail.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={subTab === 'adjust' ? 'primary' : 'secondary'} size="sm" onClick={() => setSubTab('adjust')}>Adjust</Button>
          <Button variant={subTab === 'history' ? 'primary' : 'secondary'} size="sm" onClick={() => setSubTab('history')}>History</Button>
        </div>
      </div>

      {subTab === 'adjust' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding="lg">
            <form onSubmit={queueSingle} className="space-y-4">
              <h3 className="font-black text-ink">Single adjustment</h3>
              <Select
                label="User"
                value={singleUserId}
                onChange={(event) => setSingleUserId(event.target.value)}
                options={users.map((user) => ({ label: user.email ?? user.id, value: user.id }))}
              />
              <Input label="Points" type="number" value={singlePoints} onChange={(e) => setSinglePoints(e.target.value)} hint="Use negative to deduct" required />
              <Input label="Reason" value={singleReason} onChange={(e) => setSingleReason(e.target.value)} required />
              <Button type="submit">Review adjustment</Button>
            </form>
          </Card>

          <Card padding="lg">
            <form onSubmit={queueBulk} className="space-y-4">
              <h3 className="font-black text-ink">Bulk adjustment</h3>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Emails</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="One email per line or comma-separated"
                  required
                />
                <span className="mt-2 block text-xs font-medium text-ink-muted">{bulkPreview.length} unique email(s) detected</span>
              </label>
              <Input label="Points" type="number" value={bulkPoints} onChange={(e) => setBulkPoints(e.target.value)} required />
              <Input label="Reason" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} required />
              <Button type="submit">Review bulk grant</Button>
            </form>
          </Card>
        </div>
      ) : (
        <>
          <DataTable
            headers={['User', 'Points', 'Description', 'Date']}
            rows={history.map((tx) => [
              tx.userEmail ?? '—',
              formatNumber(tx.points),
              tx.description ?? '—',
              new Date(tx.createdAt).toLocaleString(),
            ])}
          />
          <Pagination page={historyPage} pageSize={historyPageSize} total={historyTotal} onPageChange={setHistoryPage} />
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={pending?.kind === 'bulk' ? 'Confirm bulk adjustment' : 'Confirm point adjustment'}
        description={
          pending?.kind === 'bulk'
            ? `Grant ${pending.points} points to ${pending.emails?.length ?? 0} user(s)? Reason: ${pending.reason}`
            : `Apply ${pending?.points} points to ${pending?.userLabel}? Reason: ${pending?.reason}`
        }
        confirmLabel="Apply adjustment"
        isLoading={isSubmitting}
        onConfirm={() => void confirmAdjustment()}
        onCancel={() => { setConfirmOpen(false); setPending(null); }}
      />
    </div>
  );
}
