'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';

export function AccountClient() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  }

  if (!isLoaded) {
    return (
      <PublicLayout>
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl"><LoadingState /></div>
        </section>
      </PublicLayout>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const name = user?.fullName || user?.firstName || 'Saver';
  const initial = (user?.firstName?.[0] ?? email[0] ?? 'A').toUpperCase();
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
    : null;

  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <Badge>Account</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-ink">Your account</h1>
          </div>

          <Card>
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-2xl font-black text-white">
                {initial}
              </span>
              <div>
                <p className="text-xl font-black text-ink">{name}</p>
                <p className="mt-0.5 text-sm font-semibold text-ink-muted">{email}</p>
                {joined ? <p className="mt-0.5 text-xs font-semibold text-ink-muted">Saving since {joined}</p> : null}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-black text-ink">Quick links</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Link href="/dashboard"><Button variant="secondary" className="w-full">Dashboard</Button></Link>
              <Link href="/rewards"><Button variant="secondary" className="w-full">Rewards</Button></Link>
              <Link href="/create-vault"><Button variant="secondary" className="w-full">New vault</Button></Link>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-black text-ink">Session</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Signing out ends your session on this device. Your vaults and points stay safely in your account.
            </p>
            <Button variant="secondary" className="mt-5" onClick={handleSignOut} isLoading={isSigningOut}>
              Sign out
            </Button>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
