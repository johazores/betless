'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { apiRequest } from '@/lib/api-client';
import { formatShortDate } from '@/lib/dates';
import { getGuestSessionToken } from '@/lib/vault-session';
import type { ActivityItemView } from '@/types/vault';

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

  if (isLoading) {
    return <PublicLayout><section className="px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><LoadingState /></div></section></PublicLayout>;
  }

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge>{isSignedIn ? 'Account activity' : 'Browser activity'}</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Activity</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">Track vault creation, top-ups, rewards, and receipts in one place.</p>
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

          {!error && items.length === 0 ? (
            <Card>
              <h2 className="text-2xl font-black text-slate-950">No activity yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Create a vault to start your history.</p>
              <Link href="/create-vault" className="mt-5 inline-flex"><Button>Create Vault</Button></Link>
            </Card>
          ) : null}

          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{item.title}</p>
                    <p className="mt-1 break-all text-sm font-semibold leading-6 text-slate-600">{item.description}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-500">{formatShortDate(item.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
