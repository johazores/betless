'use client';

import Link from 'next/link';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { PrintReceiptButton } from '@/components/receipt/print-receipt-button';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Stat } from '@/components/ui/stat';
import { apiRequest } from '@/lib/api-client';
import { formatShortDate } from '@/lib/dates';
import { getGuestSessionToken, getVaultToken } from '@/lib/vault-session';
import type { ProofReceiptView } from '@/types/vault';

export function ReceiptClient({ id }: { id: string }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [receipt, setReceipt] = useState<ProofReceiptView | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const vaultIdFromUrl = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('vault');
  }, []);

  useEffect(() => {
    async function loadReceipt() {
      setIsLoading(true);
      setError('');

      try {
        const token = isSignedIn ? await getToken() : null;
        const vaultAccessToken = vaultIdFromUrl ? getVaultToken(vaultIdFromUrl) : getGuestSessionToken();
        const loadedReceipt = await apiRequest<ProofReceiptView>(`/api/receipts/${id}`, undefined, { token, vaultAccessToken });
        setReceipt(loadedReceipt);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Receipt could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded) void loadReceipt();
  }, [getToken, id, isLoaded, isSignedIn, vaultIdFromUrl]);

  if (isLoading) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><LoadingState /></div></section></PublicLayout>;
  }

  if (!receipt) {
    return (
      <PublicLayout>
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card>
              <p className="text-sm font-black text-amber-700">Receipt access</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">Open the saved vault link or sign in.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Receipts stay private to the vault owner. Open it from the same browser or connect the vault to an account.</p>
              {error ? <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p> : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <SignInButton mode="modal"><Button type="button" variant="secondary">Sign in</Button></SignInButton>
                <Link href="/create-vault"><Button type="button">Create Vault</Button></Link>
              </div>
            </Card>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const receiptLabel = receipt.status === 'NETWORK_CONFIRMED' ? 'Stellar transaction' : 'Wallet receipt';
  const explorerUrl = receipt.explorerUrl ?? receipt.accountExplorerUrl;
  const vaultHref = vaultIdFromUrl ? `/vaults/${receipt.vaultId}` : `/vaults/${receipt.vaultId}`;

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={isSignedIn ? '/dashboard' : vaultHref} className="text-sm font-bold text-orange-800 hover:text-orange-900">← Back</Link>
            <Link href={vaultHref} className="text-sm font-bold text-slate-600 hover:text-slate-950">Open vault</Link>
          </div>

          <Card>
            <Badge>{receiptLabel}</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Vault receipt</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">{receipt.message}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Stat label="Created" value={formatShortDate(receipt.createdAt)} />
              <Stat label="Network" value={receipt.network} />
              <Stat label="Status" value={receipt.status === 'NETWORK_CONFIRMED' ? 'Confirmed' : 'Saved'} />
              <Stat label="Wallet address" value={receipt.publicAddress} mono className="sm:col-span-2" />
              {receipt.sourceAccount ? (
                <Stat label="Source account" value={receipt.sourceAccount} mono className="sm:col-span-2" />
              ) : null}
              {receipt.destinationAccount ? (
                <Stat label="Destination account" value={receipt.destinationAccount} mono className="sm:col-span-2" />
              ) : null}
              <Stat label="Receipt reference" value={receipt.proofReference} mono className="sm:col-span-2" />
              {receipt.transactionHash ? (
                <div className="rounded-xl border border-success/20 bg-success-surface p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-success">Transaction hash</p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold text-ink">{receipt.transactionHash}</p>
                </div>
              ) : null}
              {receipt.operationId ? (
                <Stat label="Operation ID" value={receipt.operationId} mono className="sm:col-span-2" />
              ) : null}
              {receipt.ledger ? <Stat label="Ledger" value={receipt.ledger} /> : null}
              {receipt.memo ? <Stat label="Memo" value={receipt.memo} /> : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {explorerUrl ? (
                <a href={explorerUrl} target="_blank" rel="noreferrer"><Button>View on Stellar Explorer</Button></a>
              ) : (
                <Button disabled>Stellar Explorer unavailable</Button>
              )}
              <PrintReceiptButton />
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
