'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminPatchJson } from '@/lib/admin-api-client';
import { AppUserStatus, AppUserVerificationStatus } from '@/lib/domain';
import { buildQuery, fetchTabData } from '@/components/admin/admin-utils';
import { formatNumber, formatPeso } from '@/components/admin/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { LoadingState } from '@/components/ui/loading-state';
import { Select } from '@/components/ui/select';
import { FormActions } from '@/components/admin/section-header';

type UserDetail = {
  id: string;
  email: string | null;
  displayName: string | null;
  status: string;
  verificationStatus: string;
  pointsBalance: number;
  lockedBalance: number;
  vaults: Array<{
    id: string;
    principal: number;
    status: string;
    maturesAt: string;
    claimableBalanceId: string | null;
    stellarOperations: Array<{ id: string; kind: string; state: string; amount: number; explorerUrl: string | null }>;
  }>;
  pointsTransactions: Array<{ id: string; type: string; points: number; description: string | null; createdAt: string }>;
};

type UserDetailPanelProps = {
  userId: string;
  canManage: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onError: (title: string, message?: string) => void;
};

export function UserDetailPanel({ userId, canManage, onClose, onUpdated, onError }: UserDetailPanelProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [status, setStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const detail = await fetchTabData<UserDetail>(`/api/admin/users/${userId}`);
      setUser(detail);
      setStatus(detail.status);
      setVerificationStatus(detail.verificationStatus);
    } catch (loadError) {
      onError('User detail could not be loaded', loadError instanceof Error ? loadError.message : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [userId, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!user) return;
    setIsSaving(true);
    try {
      await adminPatchJson(`/api/admin/users/${userId}`, { status, verificationStatus });
      onUpdated();
      setConfirmOpen(false);
      await load();
    } catch (saveError) {
      onError('Update failed', saveError instanceof Error ? saveError.message : undefined);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !user) return <LoadingState label="Loading user detail..." />;

  const stellarRows = user.vaults.flatMap((vault) =>
    vault.stellarOperations.map((op) => [
      `${op.kind} (${vault.id.slice(0, 8)}…)`,
      op.state,
      formatPeso(op.amount),
      op.explorerUrl ? <a key={op.id} className="font-semibold text-ink transition-colors hover:text-brand-600" href={op.explorerUrl} target="_blank" rel="noreferrer">Explorer</a> : '—',
    ]),
  );

  return (
    <Card padding="lg" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-ink">{user.email ?? user.id}</h3>
          {user.displayName ? <p className="text-sm text-ink-muted">{user.displayName}</p> : null}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Points', formatNumber(user.pointsBalance)],
          ['Locked', formatPeso(user.lockedBalance)],
          ['Status', user.status],
          ['Verification', user.verificationStatus],
        ].map(([label, value]) => (
          <Card key={label} padding="md">
            <p className="text-sm font-bold text-ink-muted">{label}</p>
            <p className="mt-2 text-lg font-black text-ink">{value}</p>
          </Card>
        ))}
      </div>

      {canManage ? (
        <div className="space-y-4 rounded-2xl border border-line bg-surface-muted p-4">
          <p className="text-sm font-black text-ink">Update account</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Account status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={Object.values(AppUserStatus).map((value) => ({ label: value, value }))}
            />
            <Select
              label="Verification status"
              value={verificationStatus}
              onChange={(event) => setVerificationStatus(event.target.value)}
              options={Object.values(AppUserVerificationStatus).map((value) => ({ label: value, value }))}
            />
          </div>
          <FormActions className="pt-0">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={status === user.status && verificationStatus === user.verificationStatus}
            >
              Save changes
            </Button>
          </FormActions>
        </div>
      ) : null}

      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.12em] text-ink-muted">Vaults</h4>
        <div className="mt-3">
          <DataTable
            headers={['Vault', 'Amount', 'Status', 'Matures', 'Claimable']}
            rows={user.vaults.map((vault) => [
              vault.id,
              formatPeso(vault.principal),
              vault.status,
              new Date(vault.maturesAt).toLocaleDateString(),
              vault.claimableBalanceId ?? 'None',
            ])}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.12em] text-ink-muted">Points transactions</h4>
        <div className="mt-3">
          <DataTable
            headers={['Type', 'Points', 'Description', 'Date']}
            rows={user.pointsTransactions.map((tx) => [
              tx.type,
              formatNumber(tx.points),
              tx.description ?? '—',
              new Date(tx.createdAt).toLocaleString(),
            ])}
          />
        </div>
      </div>

      {stellarRows.length > 0 ? (
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.12em] text-ink-muted">Stellar operations</h4>
          <div className="mt-3">
            <DataTable headers={['Operation', 'State', 'Amount', 'Link']} rows={stellarRows} />
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Update user status"
        description={`Apply status "${status}" and verification "${verificationStatus}" to ${user.email ?? user.id}?`}
        confirmLabel="Update user"
        tone="danger"
        isLoading={isSaving}
        onConfirm={() => void save()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}
