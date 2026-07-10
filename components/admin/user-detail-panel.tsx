'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminPatchJson } from '@/lib/admin-api-client';
import { AppUserStatus, AppUserVerificationStatus } from '@/lib/domain';
import { enumToSelectOptions, getDisplayLabel } from '@/lib/display-labels';
import { fetchTabData } from '@/components/admin/admin-utils';
import { StatusBadge } from '@/components/admin/status-badge';
import { FormActions } from '@/components/admin/section-header';
import { formatNumber, formatPeso } from '@/components/admin/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { LoadingState } from '@/components/ui/loading-state';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

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
  open: boolean;
  userId: string | null;
  canManage: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onError: (title: string, message?: string) => void;
};

export function UserDetailPanel({ open, userId, canManage, onClose, onUpdated, onError }: UserDetailPanelProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [status, setStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setUser(null);
    try {
      const detail = await fetchTabData<UserDetail>(`/api/admin/users/${userId}`);
      setUser(detail);
      setStatus(detail.status);
      setVerificationStatus(detail.verificationStatus);
    } catch (loadError) {
      onError('User detail could not be loaded', loadError instanceof Error ? loadError.message : undefined);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [userId, onError, onClose]);

  useEffect(() => {
    if (open && userId) void load();
    if (!open) {
      setUser(null);
      setConfirmOpen(false);
    }
  }, [open, userId, load]);

  async function save() {
    if (!user || !userId) return;
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

  const stellarRows = user
    ? user.vaults.flatMap((vault) =>
        vault.stellarOperations.map((op) => [
          `${getDisplayLabel(op.kind, 'stellarOperationKind')} · ${vault.id.slice(0, 8)}…`,
          <StatusBadge key={`${op.id}-state`} status={op.state} context="stellarOperationState" />,
          formatPeso(op.amount),
          op.explorerUrl ? (
            <a key={op.id} className="font-medium text-ink underline-offset-2 hover:text-brand-700 hover:underline" href={op.explorerUrl} target="_blank" rel="noreferrer">
              View transaction
            </a>
          ) : '—',
        ]),
      )
    : [];

  if (isLoading || !user) {
    return (
      <Modal open={open && Boolean(userId)} onClose={onClose} title="User details" size="xl">
        <LoadingState label="Loading user detail..." />
      </Modal>
    );
  }

  const isDirty = status !== user.status || verificationStatus !== user.verificationStatus;

  return (
    <>
      <Modal
        open={open && Boolean(userId)}
        onClose={onClose}
        title={user.email ?? user.id}
        description={user.displayName ?? undefined}
        size="xl"
        isDirty={isDirty}
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card padding="md">
              <p className="text-sm font-medium text-ink-muted">Points</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-ink">{formatNumber(user.pointsBalance)}</p>
            </Card>
            <Card padding="md">
              <p className="text-sm font-medium text-ink-muted">Locked balance</p>
              <p className="mt-2 text-lg font-semibold text-ink">{formatPeso(user.lockedBalance)}</p>
            </Card>
            <Card padding="md">
              <p className="text-sm font-medium text-ink-muted">Account status</p>
              <div className="mt-2">
                <StatusBadge status={user.status} context="userStatus" />
              </div>
            </Card>
            <Card padding="md">
              <p className="text-sm font-medium text-ink-muted">Verification</p>
              <div className="mt-2">
                <StatusBadge status={user.verificationStatus} context="verificationStatus" />
              </div>
            </Card>
          </div>

          {canManage ? (
            <div className="space-y-4 rounded-xl border border-line bg-surface-muted/60 p-4">
              <p className="text-sm font-semibold text-ink">Update account</p>
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Account status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  options={enumToSelectOptions(Object.values(AppUserStatus), 'userStatus')}
                />
                <Select
                  label="Verification status"
                  value={verificationStatus}
                  onChange={(event) => setVerificationStatus(event.target.value)}
                  options={enumToSelectOptions(Object.values(AppUserVerificationStatus), 'verificationStatus')}
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
            <h4 className="text-sm font-medium text-ink-muted">Vaults</h4>
            <div className="mt-3">
              <DataTable
                headers={['Vault', 'Amount', 'Status', 'Matures', 'Claimable']}
                rows={user.vaults.map((vault) => [
                  `${vault.id.slice(0, 8)}…`,
                  formatPeso(vault.principal),
                  <StatusBadge key={`${vault.id}-status`} status={vault.status} context="vaultStatus" />,
                  new Date(vault.maturesAt).toLocaleDateString(),
                  vault.claimableBalanceId ? 'Yes' : 'No',
                ])}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-ink-muted">Points transactions</h4>
            <div className="mt-3">
              <DataTable
                headers={['Type', 'Points', 'Description', 'Date']}
                rows={user.pointsTransactions.map((tx) => [
                  getDisplayLabel(tx.type, 'pointsTransactionType'),
                  formatNumber(tx.points),
                  tx.description ?? '—',
                  new Date(tx.createdAt).toLocaleString(),
                ])}
              />
            </div>
          </div>

          {stellarRows.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-ink-muted">On-chain operations</h4>
              <div className="mt-3">
                <DataTable headers={['Operation', 'State', 'Amount', 'Link']} rows={stellarRows} />
              </div>
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Update user status"
        description={
          user
            ? `Set account status to "${getDisplayLabel(status, 'userStatus')}" and verification to "${getDisplayLabel(verificationStatus, 'verificationStatus')}" for ${user.email ?? user.id}?`
            : undefined
        }
        confirmLabel="Update user"
        tone="danger"
        isLoading={isSaving}
        onConfirm={() => void save()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
