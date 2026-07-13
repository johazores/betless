'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CopyLinkButton } from '@/components/ui/copy-link-button';
import { LoadingState } from '@/components/ui/loading-state';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/api-client';
import { formatDateTime, formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { getVaultStatusLabel } from '@/lib/status-labels';
import type { CommitmentCertificateView } from '@/types/vault';

export function CertificatePageClient({ id }: { id: string }) {
  const [certificate, setCertificate] = useState<CommitmentCertificateView | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiRequest<CommitmentCertificateView>(`/api/certificate/vault/${id}`);
        setCertificate(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Certificate could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <LoadingState label="Preparing certificate…" />
        </div>
      </div>
    );
  }

  if (!certificate || error) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <h1 className="text-2xl font-black text-ink">Commitment certificate</h1>
            <p className="mt-2 text-sm text-ink-muted">{error || 'This certificate could not be found.'}</p>
          </Card>
        </div>
      </div>
    );
  }

  const isActive = certificate.status === 'ACTIVE';
  const title = certificate.goalLabel ?? 'Commitment savings vault';

  return (
    <div className="certificate-page px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="certificate-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <Badge tone="chain">Verifiable certificate</Badge>
            <h1 className="mt-3 text-2xl font-black text-ink sm:text-3xl">Commitment savings certificate</h1>
            <p className="mt-1 text-sm text-ink-muted">Reference {certificate.certificateRef}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={typeof window !== 'undefined' ? window.location.href : certificate.verifyUrl} />
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Print / save PDF
            </Button>
          </div>
        </div>

        <Card
          padding="lg"
          className="certificate-sheet overflow-hidden border-2 border-brand-200/80 bg-gradient-to-br from-surface via-brand-50/30 to-surface shadow-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Betless</p>
              <p className="mt-1 text-sm font-semibold text-ink-muted">Commitment savings · Philippines</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Issued</p>
              <p className="mt-1 text-sm font-black text-ink">{formatDateTime(certificate.issuedAt)}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-chain">Certificate of savings commitment</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h2>
            <p className="mt-3 text-4xl font-black tabular-nums text-brand-800 sm:text-5xl">
              {formatPeso(certificate.principal)}
            </p>
            <p className="mt-3 text-sm font-semibold text-ink-muted">
              {certificate.lockMonths}-month lock · {getVaultStatusLabel(certificate.status)}
            </p>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface/80 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Maturity date</dt>
              <dd className="mt-1 text-lg font-black text-ink">{formatShortDate(certificate.maturesAt)}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface/80 px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-muted">Progress</dt>
              <dd className="mt-1 text-lg font-black text-ink">
                {certificate.monthsCompleted} of {certificate.lockMonths} months
              </dd>
            </div>
          </dl>

          {isActive ? (
            <div className="mt-6">
              <Progress
                value={certificate.progressPercent}
                label="Commitment progress"
                showValue
              />
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-chain/20 bg-chain-surface/40 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-chain">On-chain verification</p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              This deposit is held in a Stellar claimable balance with a time predicate. The lock is
              independently verifiable — not just a database record.
            </p>
            {certificate.stellar?.status === 'LOCKED' ? (
              <p className="mt-3 text-sm font-bold text-success">Lock verified on Stellar</p>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink-muted">
                {certificate.stellar ? `Status: ${certificate.stellar.status}` : 'On-chain layer not active in this environment'}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
              <Link href={`/verify/${certificate.id}`} className="text-chain hover:underline">
                Public verification page →
              </Link>
              {certificate.stellar?.lockExplorerUrl ? (
                <a href={certificate.stellar.lockExplorerUrl} target="_blank" rel="noreferrer" className="text-chain hover:underline">
                  stellar.expert ↗
                </a>
              ) : null}
            </div>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-ink-muted">
            This certificate attests to an active Betless commitment vault. Principal is returned in full at maturity
            subject to product terms. Points and rewards are separate from the on-chain deposit lock.
          </p>
        </Card>

        <p className="certificate-footer text-center text-sm text-ink-muted print:hidden">
          <Link href="/trust" className="font-bold text-chain hover:underline">Platform reserves</Link>
          {' · '}
          <Link href="/" className="font-bold text-brand-800 hover:text-brand-900">About Betless</Link>
        </p>
      </div>
    </div>
  );
}
