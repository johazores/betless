'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { PrintReceiptButton } from '@/components/receipt/print-receipt-button';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { apiRequest } from '@/lib/api-client';
import { formatShortDate } from '@/lib/dates';
import type { ProofReceiptView } from '@/types/vault';

export function ReceiptClient({ id }: { id: string }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [receipt, setReceipt] = useState<ProofReceiptView | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      setIsLoading(true);
      setError('');

      try {
        const token = await getToken();
        const loadedReceipt = await apiRequest<ProofReceiptView>(`/api/receipts/${id}`, undefined, token);
        setReceipt(loadedReceipt);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Receipt could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded && isSignedIn) void loadReceipt();
    if (isLoaded && !isSignedIn) setIsLoading(false);
  }, [getToken, id, isLoaded, isSignedIn]);

  if (isLoaded && !isSignedIn) {
    return (
      <PublicLayout>
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card>
              <p className="text-sm font-black text-amber-700">Account required</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">Log in to view this receipt.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Receipts are private to the account that created the vault.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <SignInButton mode="modal"><Button type="button" variant="secondary">Log in</Button></SignInButton>
                <SignUpButton mode="modal"><Button type="button">Create account</Button></SignUpButton>
              </div>
            </Card>
          </div>
        </section>
      </PublicLayout>
    );
  }

  if (isLoading) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><LoadingState /></div></section></PublicLayout>;
  }

  if (!receipt) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><EmptyState title="Receipt could not be loaded" message={error || 'This receipt was not found.'} /></div></section></PublicLayout>;
  }

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/dashboard" className="text-sm font-bold text-orange-800 hover:text-orange-900">← Back to dashboard</Link>
            <Link href={`/vaults/${receipt.vaultId}`} className="text-sm font-bold text-slate-600 hover:text-slate-950">Open vault</Link>
          </div>

          <Card>
            <Badge>{receipt.status === 'NETWORK_CONFIRMED' ? 'Stellar network receipt' : 'Demo receipt'}</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">Commitment proof receipt</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">{receipt.message}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Created</p>
                <p className="mt-1 font-black text-slate-950">{formatShortDate(receipt.createdAt)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Network</p>
                <p className="mt-1 font-black text-slate-950">{receipt.network}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm font-bold text-slate-500">Public address</p>
                <p className="mt-1 break-all font-mono text-sm font-black text-slate-950">{receipt.publicAddress}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-sm font-bold text-slate-500">Proof reference</p>
                <p className="mt-1 break-all font-mono text-sm font-black text-slate-950">{receipt.proofReference}</p>
              </div>
              {receipt.transactionHash ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:col-span-2">
                  <p className="text-sm font-bold text-emerald-700">Transaction hash</p>
                  <p className="mt-1 break-all font-mono text-sm font-black text-emerald-950">{receipt.transactionHash}</p>
                </div>
              ) : null}
              {receipt.ledger ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Ledger</p>
                  <p className="mt-1 font-black text-slate-950">{receipt.ledger}</p>
                </div>
              ) : null}
              {receipt.memo ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Memo</p>
                  <p className="mt-1 font-black text-slate-950">{receipt.memo}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {receipt.explorerUrl ? (
                <a href={receipt.explorerUrl} target="_blank" rel="noreferrer"><Button>Verify on Stellar explorer</Button></a>
              ) : (
                <Button disabled>Explorer link available after network proof</Button>
              )}
              <PrintReceiptButton />
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
