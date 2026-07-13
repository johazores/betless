'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { Progress } from '@/components/ui/progress';
import { CopyLinkButton } from '@/components/ui/copy-link-button';
import { apiRequest } from '@/lib/api-client';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { getVaultStatusLabel } from '@/lib/status-labels';
import type { VaultVerificationView } from '@/types/vault';

const stellarStatusCopy: Record<NonNullable<VaultVerificationView['stellar']>['status'], string> = {
  PENDING: 'Lock settling on Stellar',
  LOCKED: 'Locked on Stellar',
  RELEASED: 'Released on Stellar',
  FAILED: 'On-chain lock unavailable',
};

export function VerifyVaultClient({ id }: { id: string }) {
  const [vault, setVault] = useState<VaultVerificationView | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/verify/${id}`);
  }, [id]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiRequest<VaultVerificationView>(`/api/verify/vault/${id}`);
        setVault(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Vault could not be verified.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <LoadingState label="Loading verification…" />
        </div>
      </div>
    );
  }

  if (!vault || error) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <h1 className="text-2xl font-black text-ink">Vault verification</h1>
            <p className="mt-2 text-sm text-ink-muted">{error || 'This vault could not be found.'}</p>
            <Link href="/trust" className="mt-4 inline-flex text-sm font-bold text-chain hover:underline">
              View platform reserves →
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const isActive = vault.status === 'ACTIVE';

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Badge tone="chain">Public verification</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">Vault verification</h1>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Independent proof of a Betless commitment vault. No account required — verify the on-chain lock on stellar.expert.
          </p>
        </div>

        <Card padding="lg">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{getVaultStatusLabel(vault.status)}</Badge>
            {vault.stellar ? <Badge tone="chain">{stellarStatusCopy[vault.stellar.status]}</Badge> : null}
          </div>

          <h2 className="mt-4 text-2xl font-black text-ink">
            {vault.goalLabel ?? `${vault.lockMonths}-month vault`}
          </h2>
          <p className="mt-1 text-3xl font-black tabular-nums text-ink">{formatPeso(vault.principal)}</p>
          <p className="mt-2 text-sm font-semibold text-ink-muted">
            {isActive
              ? `Matures ${formatShortDate(vault.maturesAt)}`
              : `Closed ${formatShortDate(vault.closedAt ?? vault.maturesAt)}`}
          </p>

          {isActive ? (
            <div className="mt-6">
              <Progress
                value={vault.progressPercent}
                label={`${vault.monthsCompleted} of ${vault.lockMonths} months completed`}
                showValue
              />
            </div>
          ) : null}
        </Card>

        {vault.stellar ? (
          <Card>
            <h2 className="text-xl font-black text-ink">On-chain proof</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              This vault&apos;s principal is held in a Stellar claimable balance. The network enforces the lock until maturity.
            </p>

            {vault.stellar.claimableBalanceId ? (
              <p className="mt-4 break-all rounded-2xl border border-line bg-surface-muted p-4 font-mono text-xs text-ink-muted">
                {vault.stellar.claimableBalanceId}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
              {vault.stellar.lockExplorerUrl ? (
                <a href={vault.stellar.lockExplorerUrl} target="_blank" rel="noreferrer" className="text-chain hover:underline">
                  View lock transaction ↗
                </a>
              ) : null}
              {vault.stellar.releaseExplorerUrl ? (
                <a href={vault.stellar.releaseExplorerUrl} target="_blank" rel="noreferrer" className="text-chain hover:underline">
                  View release transaction ↗
                </a>
              ) : null}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-ink-muted">On-chain verification is not available for this vault in this environment.</p>
          </Card>
        )}

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Reference</p>
          <p className="mt-2 break-all font-mono text-xs text-ink-muted">{vault.id}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {shareUrl ? <CopyLinkButton url={shareUrl} label="Copy verification link" /> : null}
            <Link href={`/certificate/${vault.id}`} className="text-sm font-bold text-chain hover:underline">
              View commitment certificate →
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            <Link href="/trust" className="font-bold text-chain hover:underline">
              Verify all platform reserves
            </Link>
            {' · '}
            <Link href="/" className="font-bold text-brand-800 hover:text-brand-900">
              About Betless
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
