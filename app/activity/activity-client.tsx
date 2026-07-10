'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { apiRequest } from '@/lib/api-client';
import { formatDateTime, formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { getGuestSessionToken } from '@/lib/vault-session';
import type { ActivityItemView } from '@/types/vault';

type StatusTone = 'slate' | 'blue' | 'emerald' | 'red';

const statusStyle: Record<string, { label: string; tone: StatusTone; className: string }> = {
  PENDING: { label: 'Pending', tone: 'slate', className: 'border-slate-200 bg-slate-50 text-slate-700' },
  PROCESSING: { label: 'Processing', tone: 'blue', className: 'border-blue-200 bg-blue-50 text-blue-800' },
  COMPLETED: { label: 'Completed', tone: 'emerald', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  FAILED: { label: 'Failed', tone: 'red', className: 'border-red-200 bg-red-50 text-red-800' },
};

function shortValue(value: string | null) {
  if (!value) return null;
  if (value.length <= 24) return value;
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

function groupByDay(items: ActivityItemView[]) {
  return items.reduce<Record<string, ActivityItemView[]>>((groups, item) => {
    const label = formatShortDate(item.createdAt);
    groups[label] = groups[label] ?? [];
    groups[label].push(item);
    return groups;
  }, {});
}

export function ActivityClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [items, setItems] = useState<ActivityItemView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadActivity() {
      setIsLoading(true);
      setError('');

      try {
        const token = isSignedIn ? await getToken() : null;
        const vaultAccessToken = isSignedIn ? null : getGuestSessionToken();

        if (!isSignedIn && !vaultAccessToken) {
          setItems([]);
          return;
        }

        const activity = await apiRequest<ActivityItemView[]>('/api/activity', undefined, { token, vaultAccessToken });
        setItems(activity);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Activity could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoaded) void loadActivity();
  }, [getToken, isLoaded, isSignedIn]);

  const groupedItems = useMemo(() => groupByDay(items), [items]);

  if (isLoading) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><LoadingState /></div></section></PublicLayout>;
  }

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge>{isSignedIn ? 'Account activity' : 'Browser activity'}</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Activity</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                A clear timeline of vault actions, rewards, receipts, and Stellar network records.
              </p>
            </div>
            <Link href="/dashboard"><Button variant="secondary">Dashboard</Button></Link>
          </div>

          {!isSignedIn && items.length > 0 ? (
            <Card className="border-amber-200 bg-amber-50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold leading-6 text-amber-950">Create an account to keep this activity across devices.</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SignInButton mode="modal"><Button type="button" variant="secondary">Sign in</Button></SignInButton>
                  <SignUpButton mode="modal"><Button type="button">Create account</Button></SignUpButton>
                </div>
              </div>
            </Card>
          ) : null}

          {error ? <EmptyState title="Activity could not be loaded" message={error} /> : null}

          {items.length === 0 && !error ? (
            <EmptyState title="No activity yet" message="Create a vault to start your timeline." />
          ) : null}

          <div className="space-y-8">
            {Object.entries(groupedItems).map(([day, dayItems]) => (
              <div key={day} className="space-y-4">
                <div className="sticky top-2 z-10 w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                  {day}
                </div>
                <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-slate-200">
                  {dayItems.map((item) => {
                    const status = statusStyle[item.status] ?? statusStyle.COMPLETED;
                    const primaryRef = item.transactionHash ?? item.operationId ?? item.reference;
                    const explorerUrl = item.explorerUrl ?? item.accountExplorerUrl;
                    return (
                      <article key={item.id} className="relative grid gap-3 pl-10">
                        <span className="absolute left-[9px] top-6 z-10 h-3 w-3 rounded-full border-2 border-white bg-slate-900 shadow" />
                        <Card className="transition hover:border-slate-300 hover:shadow-md">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600">
                                  {item.rail === 'STELLAR' ? (item.network ?? 'Stellar') : 'App'}
                                </span>
                              </div>
                              <h2 className="mt-3 text-xl font-black text-slate-950">{item.title}</h2>
                              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{item.description}</p>
                            </div>
                            <p className="shrink-0 text-sm font-bold text-slate-500">{formatDateTime(item.createdAt)}</p>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {item.amount !== null ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Amount</p>
                                <p className="mt-1 font-black text-slate-950">
                                  {item.assetCode === 'PHP' ? formatPeso(item.amount) : `${item.amount} ${item.assetCode ?? ''}`}
                                </p>
                              </div>
                            ) : null}
                            {item.network ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Network</p>
                                <p className="mt-1 font-black text-slate-950">{item.network}</p>
                              </div>
                            ) : null}
                            {item.walletAddress ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Wallet</p>
                                <p className="mt-1 break-all font-mono text-xs font-black text-slate-950">{shortValue(item.walletAddress)}</p>
                              </div>
                            ) : null}
                            {primaryRef ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Reference</p>
                                <p className="mt-1 break-all font-mono text-xs font-black text-slate-950">{primaryRef}</p>
                              </div>
                            ) : null}
                          </div>

                          <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                            <summary className="cursor-pointer text-sm font-black text-slate-900">Details</summary>
                            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                              <div>
                                <dt className="font-bold text-slate-500">Status</dt>
                                <dd className="mt-1 font-black text-slate-950">{status.label}</dd>
                              </div>
                              <div>
                                <dt className="font-bold text-slate-500">Network</dt>
                                <dd className="mt-1 font-black text-slate-950">{item.network ?? (item.rail === 'STELLAR' ? 'Stellar' : 'Betless app')}</dd>
                              </div>
                              {item.sourceAccount ? <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Source account</dt><dd className="mt-1 break-all font-mono text-xs font-black text-slate-950">{item.sourceAccount}</dd></div> : null}
                              {item.destinationAccount ? <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Destination account</dt><dd className="mt-1 break-all font-mono text-xs font-black text-slate-950">{item.destinationAccount}</dd></div> : null}
                              {item.ledger ? <div><dt className="font-bold text-slate-500">Ledger</dt><dd className="mt-1 font-black text-slate-950">{item.ledger}</dd></div> : null}
                              {item.operationId ? <div><dt className="font-bold text-slate-500">Operation ID</dt><dd className="mt-1 break-all font-mono text-xs font-black text-slate-950">{item.operationId}</dd></div> : null}
                              {item.transactionHash ? <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Transaction hash</dt><dd className="mt-1 break-all font-mono text-xs font-black text-slate-950">{item.transactionHash}</dd></div> : null}
                            </dl>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                              <Link href={item.href}><Button variant="secondary">Open record</Button></Link>
                              {explorerUrl ? <a href={explorerUrl} target="_blank" rel="noreferrer"><Button>View on Stellar Explorer</Button></a> : null}
                            </div>
                          </details>
                        </Card>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
