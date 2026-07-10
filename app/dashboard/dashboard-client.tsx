'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Progress } from '@/components/ui/progress';
import { apiRequest, postJson } from '@/lib/api-client';
import { formatDateTime, formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { clearGuestSessionToken, getGuestSessionToken } from '@/lib/vault-session';
import type { AnalyticsView, DashboardVaultView, ProofReceiptView } from '@/types/vault';

function MetricCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <Card>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
      {helper ? <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{helper}</p> : null}
    </Card>
  );
}

function BarList({ items, valueFormatter = (value: number) => String(value) }: { items: { label: string; value: number }[]; valueFormatter?: (value: number) => string }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-bold text-slate-600">{item.label}</span>
            <span className="font-black text-slate-950">{valueFormatter(item.value)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [vaults, setVaults] = useState<DashboardVaultView[]>([]);
  const [receipts, setReceipts] = useState<ProofReceiptView[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingSession, setIsConnectingSession] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = isSignedIn ? await getToken() : null;
      const vaultAccessToken = getGuestSessionToken();

      if (isSignedIn && vaultAccessToken) {
        setIsConnectingSession(true);
        await postJson('/api/session/connect', {}, { token, vaultAccessToken });
        clearGuestSessionToken();
        setIsConnectingSession(false);
      }

      const accessOptions = isSignedIn
        ? { token, vaultAccessToken: null }
        : { token: null, vaultAccessToken };

      if (!isSignedIn && !vaultAccessToken) {
        setVaults([]);
        setReceipts([]);
        setAnalytics(null);
        return;
      }

      const [loadedVaults, loadedReceipts, loadedAnalytics] = await Promise.all([
        apiRequest<DashboardVaultView[]>('/api/vaults', undefined, accessOptions),
        apiRequest<ProofReceiptView[]>('/api/receipts', undefined, accessOptions),
        apiRequest<AnalyticsView>('/api/analytics', undefined, accessOptions),
      ]);
      setVaults(loadedVaults);
      setReceipts(loadedReceipts);
      setAnalytics(loadedAnalytics);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Dashboard could not be loaded.');
    } finally {
      setIsConnectingSession(false);
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isLoaded) void loadDashboard();
  }, [isLoaded, loadDashboard]);

  if (isLoading) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><LoadingState /></div></section></PublicLayout>;
  }

  if (error) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><EmptyState title="Dashboard could not be loaded" message={error} /></div></section></PublicLayout>;
  }

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge>{isSignedIn ? 'Account dashboard' : 'Saved in this browser'}</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Your vault overview</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Track savings, rewards, receipts, and network verification in one place.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/activity"><Button variant="secondary">View activity</Button></Link>
              <Link href="/create-vault"><Button>Create Vault</Button></Link>
            </div>
          </div>

          {isConnectingSession ? (
            <Card className="border-blue-200 bg-blue-50">
              <p className="text-sm font-black text-blue-800">Saving your progress</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-blue-950">Your vaults and receipts are being connected to your account.</p>
            </Card>
          ) : null}

          {!isSignedIn && (vaults.length > 0 || receipts.length > 0) ? (
            <Card className="border-amber-200 bg-amber-50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-amber-800">Keep this safe</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-amber-950">Your progress is saved in this browser. Create an account to access it anywhere.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SignInButton mode="modal"><Button type="button" variant="secondary">Sign in</Button></SignInButton>
                  <SignUpButton mode="modal"><Button type="button">Create account</Button></SignUpButton>
                </div>
              </div>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total balance" value={formatPeso(analytics?.totalBalance ?? 0)} helper="Across active vaults" />
            <MetricCard label="Total deposits" value={formatPeso(analytics?.totalDeposits ?? 0)} helper="Starting amounts plus recorded top-ups" />
            <MetricCard label="Rewards earned" value={formatPeso(analytics?.rewardsEarned ?? 0)} helper={`${analytics?.rewardsRedeemed ?? 0} rewards redeemed`} />
            <MetricCard label="Completed activity" value={analytics?.completedTransactions ?? 0} helper="Vault, reward, receipt, and Stellar records" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Savings progress</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Progress across all active vaults.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-800">{analytics?.savingsProgressPercent ?? 0}%</span>
              </div>
              <div className="mt-6"><Progress value={analytics?.savingsProgressPercent ?? 0} /></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Withdrawals</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{formatPeso(analytics?.totalWithdrawals ?? 0)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Network receipts</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{receipts.filter((receipt) => receipt.status === 'NETWORK_CONFIRMED').length}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-black text-slate-950">Monthly activity</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Completed actions by month.</p>
              <div className="mt-6">
                <BarList items={(analytics?.monthlyActivity ?? []).map((item) => ({ label: item.month, value: item.count }))} />
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
            <Card>
              <h2 className="text-2xl font-black text-slate-950">Vault growth</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Balance growth across recent vaults.</p>
              <div className="mt-6">
                <BarList items={analytics?.vaultGrowth ?? []} valueFormatter={formatPeso} />
              </div>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Recent account activity</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Latest saved records.</p>
                </div>
                <Link href="/activity" className="text-sm font-black text-orange-800 hover:text-orange-900">Open timeline →</Link>
              </div>
              <div className="mt-5 space-y-3">
                {(analytics?.recentActivity ?? []).length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">No activity yet. Create a vault to get started.</p>
                ) : analytics?.recentActivity.map((item) => {
                  const explorerUrl = item.explorerUrl ?? item.accountExplorerUrl;
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
                      <Link href={item.href} className="block">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-black text-slate-950">{item.title}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">{item.network ?? (item.rail === 'STELLAR' ? 'Stellar' : 'App')} · {item.status.replaceAll('_', ' ')}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-500">{formatDateTime(item.createdAt)}</p>
                        </div>
                      </Link>
                      {explorerUrl ? (
                        <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-black text-orange-800 hover:text-orange-900">
                          View on Stellar Explorer →
                        </a>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {vaults.length === 0 ? (
            <Card>
              <h2 className="text-2xl font-black text-slate-950">No vaults yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Create your first vault now. You can connect an account later.</p>
              <Link href="/create-vault" className="mt-5 inline-flex"><Button>Create Vault</Button></Link>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {vaults.map((vault) => (
                <Card key={vault.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-amber-700">{vault.mode === 'PERIODIC_TOP_UP' ? 'Recurring vault' : 'One-time vault'}</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950">{formatPeso(vault.currentAmount)} saved</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-600">Target: {formatPeso(vault.targetAmount)} · Unlock: {formatShortDate(vault.unlockAt)}</p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{vault.status.replaceAll('_', ' ')}</span>
                  </div>
                  <div className="mt-5"><Progress value={vault.progressPercent} /></div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/vaults/${vault.id}`}><Button variant="secondary" className="w-full sm:w-auto">Open vault</Button></Link>
                    {vault.latestReceipt ? (
                      <Link href={`/receipts/${vault.latestReceipt.id}`}><Button className="w-full sm:w-auto">View receipt</Button></Link>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Receipt history</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">Return later, verify, or export your receipts.</p>
              </div>
              <Link href="/activity" className="text-sm font-black text-orange-800 hover:text-orange-900">View activity →</Link>
            </div>
            <div className="mt-5 space-y-3">
              {receipts.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">No receipts yet. Create a vault to generate the first receipt.</p>
              ) : receipts.map((receipt) => (
                <div key={receipt.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{receipt.status === 'NETWORK_CONFIRMED' ? 'Network receipt' : 'Saved receipt'}</p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-600">{formatShortDate(receipt.createdAt)} · {receipt.proofReference}</p>
                  </div>
                  <Link href={`/receipts/${receipt.id}`} className="text-sm font-black text-orange-800 hover:text-orange-900">Open receipt →</Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
