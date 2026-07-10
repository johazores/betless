'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import { FormActions, SectionHeader } from '@/components/admin/section-header';
import { formatNumber } from '@/components/admin/types';
import type { UserRow } from '@/components/admin/types';
import { adminApiRequest } from '@/lib/admin-api-client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';

type PointsSectionProps = {
  onSuccess: (title: string, message?: string) => void;
  onError: (title: string, message?: string) => void;
};

type AdjustModal = 'single' | 'bulk' | null;

export function PointsSection({ onSuccess, onError }: PointsSectionProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; type: string; points: number; description: string | null; userEmail: string | null; createdAt: string }>>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adjustModal, setAdjustModal] = useState<AdjustModal>(null);

  const [singleUserId, setSingleUserId] = useState('');
  const [singlePoints, setSinglePoints] = useState('');
  const [singleReason, setSingleReason] = useState('');

  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkPoints, setBulkPoints] = useState('');
  const [bulkReason, setBulkReason] = useState('');

  const loadUsers = useCallback(async () => {
    const result = await fetchTabData<{ users: UserRow[] }>('/api/admin/users?page=1');
    setUsers(result.users);
    if (result.users[0]) setSingleUserId((current) => current || result.users[0].id);
  }, []);

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

  const singleDirty = singlePoints.trim() !== '' || singleReason.trim() !== '';
  const bulkDirty = bulkEmails.trim() !== '' || bulkPoints.trim() !== '' || bulkReason.trim() !== '';

  function closeSingle() {
    setAdjustModal(null);
    setSinglePoints('');
    setSingleReason('');
  }

  function closeBulk() {
    setAdjustModal(null);
    setBulkEmails('');
    setBulkPoints('');
    setBulkReason('');
  }

  function openConfirmSingle(event: FormEvent) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  function openConfirmBulk(event: FormEvent) {
    event.preventDefault();
    setConfirmOpen(true);
  }

  async function confirmAdjustment() {
    setIsSubmitting(true);
    try {
      if (adjustModal === 'single') {
        const user = users.find((u) => u.id === singleUserId);
        await adminApiRequest('/api/admin/points/adjust', {
          method: 'POST',
          body: JSON.stringify({
            appUserId: singleUserId,
            points: Number(singlePoints),
            reason: singleReason.trim(),
          }),
        });
        onSuccess('Points adjusted', `${Number(singlePoints) > 0 ? '+' : ''}${singlePoints} for ${user?.email ?? singleUserId}`);
        closeSingle();
      } else if (adjustModal === 'bulk') {
        const result = await adminApiRequest<{ adjusted: number; missing: string[] }>('/api/admin/points/bulk', {
          method: 'POST',
          body: JSON.stringify({
            emails: bulkPreview.join('\n'),
            points: Number(bulkPoints),
            reason: bulkReason.trim(),
          }),
        });
        onSuccess('Bulk adjustment complete', `Adjusted ${result.adjusted}; missing ${result.missing.length}.`);
        closeBulk();
      }
      setConfirmOpen(false);
      await loadHistory();
    } catch (submitError) {
      onError('Adjustment failed', submitError instanceof Error ? submitError.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  const pendingSummary =
    adjustModal === 'single'
      ? (() => {
          const user = users.find((u) => u.id === singleUserId);
          return `Apply ${singlePoints} points to ${user?.email ?? singleUserId}? Reason: ${singleReason.trim()}`;
        })()
      : adjustModal === 'bulk'
        ? `Grant ${bulkPoints} points to ${bulkPreview.length} user(s)? Reason: ${bulkReason.trim()}`
        : '';

  if (isLoading) return <LoadingState label="Loading points..." variant="table" />;

  return (
    <div className="space-y-5">
      <SectionHeader
        badge="Rewards"
        title="Points"
        description="Review adjustment history and grant points when needed."
        actions={(
          <>
            <Button variant="secondary" onClick={() => setAdjustModal('single')}>Adjust points</Button>
            <Button onClick={() => setAdjustModal('bulk')}>Bulk adjust</Button>
          </>
        )}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <DataTable
          className="rounded-none border-0 shadow-none"
          headers={['User', 'Points', 'Description', 'Date']}
          rows={history.map((tx) => [
            tx.userEmail ?? '—',
            formatNumber(tx.points),
            tx.description ?? '—',
            new Date(tx.createdAt).toLocaleString(),
          ])}
          emptyMessage="No adjustment history yet"
        />
        <Pagination page={historyPage} pageSize={historyPageSize} total={historyTotal} onPageChange={setHistoryPage} />
      </div>

      <Modal
        open={adjustModal === 'single'}
        onClose={closeSingle}
        title="Adjust points"
        description="Apply a single point adjustment to one user."
        size="md"
        isDirty={singleDirty}
        footer={(
          <FormActions className="pt-0">
            <Button type="button" variant="ghost" onClick={closeSingle}>Cancel</Button>
            <Button type="submit" form="single-adjust-form">Review adjustment</Button>
          </FormActions>
        )}
      >
        <form id="single-adjust-form" onSubmit={openConfirmSingle} className="space-y-4">
          <Select
            label="User"
            value={singleUserId}
            onChange={(event) => setSingleUserId(event.target.value)}
            options={users.map((user) => ({ label: user.email ?? user.id, value: user.id }))}
          />
          <Input label="Points" type="number" value={singlePoints} onChange={(e) => setSinglePoints(e.target.value)} hint="Use negative to deduct" required />
          <Input label="Reason" value={singleReason} onChange={(e) => setSingleReason(e.target.value)} required />
        </form>
      </Modal>

      <Modal
        open={adjustModal === 'bulk'}
        onClose={closeBulk}
        title="Bulk adjust points"
        description="Grant points to multiple users by email."
        size="lg"
        isDirty={bulkDirty}
        footer={(
          <FormActions className="pt-0">
            <Button type="button" variant="ghost" onClick={closeBulk}>Cancel</Button>
            <Button type="submit" form="bulk-adjust-form">Review bulk grant</Button>
          </FormActions>
        )}
      >
        <form id="bulk-adjust-form" onSubmit={openConfirmBulk} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Emails</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="One email per line or comma-separated"
              required
            />
            <span className="mt-2 block text-xs font-medium text-ink-muted">{bulkPreview.length} unique email(s) detected</span>
          </label>
          <Input label="Points" type="number" value={bulkPoints} onChange={(e) => setBulkPoints(e.target.value)} required />
          <Input label="Reason" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} required />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title={adjustModal === 'bulk' ? 'Confirm bulk adjustment' : 'Confirm point adjustment'}
        description={pendingSummary}
        confirmLabel="Apply adjustment"
        isLoading={isSubmitting}
        onConfirm={() => void confirmAdjustment()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
