'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  AccountSettingsNav,
  SettingsSection,
  type AccountSection,
} from '@/components/account/account-settings-nav';
import { ProfileAvatar } from '@/components/account/profile-avatar';
import { PaymentMethodIcon } from '@/components/payment/payment-method-icon';
import { PublicLayout } from '@/components/layout/public-layout';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KpiCard } from '@/components/ui/kpi-card';
import { LoadingState } from '@/components/ui/loading-state';
import { SettingRow, Toggle } from '@/components/ui/setting-row';
import { apiRequest, patchJson } from '@/lib/api-client';
import { loadAccountPreferences, saveAccountPreferences } from '@/lib/account-preferences';
import { cn } from '@/lib/class-names';
import { formatDateTime } from '@/lib/dates';
import { getDisplayLabel } from '@/lib/display-labels';
import { formatPeso } from '@/lib/money';
import { paymentMethods } from '@/lib/payment-methods';
import type { AccountPreferences, AccountProfileView } from '@/types/account';
import { defaultAccountPreferences } from '@/types/account';

export function AccountClient() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const [section, setSection] = useState<AccountSection>('profile');
  const [profile, setProfile] = useState<AccountProfileView | null>(null);
  const [prefs, setPrefs] = useState<AccountPreferences>(defaultAccountPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setProfile(await apiRequest<AccountProfileView>('/api/account'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Account could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setDisplayName(profile?.displayName ?? user.fullName ?? '');
    setPrefs(loadAccountPreferences(user.id));
  }, [user, profile]);

  const email = user?.primaryEmailAddress?.emailAddress ?? profile?.email ?? '—';
  const memberSince = profile?.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const profileBaseline = useMemo(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    displayName: profile?.displayName ?? user?.fullName ?? '',
  }), [user, profile]);

  useEffect(() => {
    setIsDirty(
      firstName !== profileBaseline.firstName
      || lastName !== profileBaseline.lastName
      || displayName.trim() !== profileBaseline.displayName.trim(),
    );
  }, [firstName, lastName, displayName, profileBaseline]);

  function updatePref<K extends keyof AccountPreferences>(key: K, value: AccountPreferences[K]) {
    if (!user) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    saveAccountPreferences(user.id, next);
    setSuccess('Preferences saved.');
    setTimeout(() => setSuccess(''), 2500);
  }

  async function saveProfile() {
    if (!user) return;
    setIsSavingProfile(true);
    setError('');
    setSuccess('');
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      const updated = await patchJson<AccountProfileView>('/api/account', {
        displayName: displayName.trim() || `${firstName} ${lastName}`.trim(),
      });
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Profile could not be saved.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  function cancelProfileEdit() {
    setFirstName(profileBaseline.firstName);
    setLastName(profileBaseline.lastName);
    setDisplayName(profileBaseline.displayName);
    setError('');
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.push('/');
  }

  if (!isLoaded || isLoading) {
    return (
      <PublicLayout>
        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl"><LoadingState label="Loading your account…" /></div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-brand-100/70 via-brand-50/40 to-surface-muted" aria-hidden />
            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <ProfileAvatar size="lg" editable />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Account settings</p>
                    <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                      {profile?.displayName || user?.fullName || 'Your profile'}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-ink-muted">{email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {profile ? (
                        <Badge tone={profile.verificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>
                          {getDisplayLabel(profile.verificationStatus, 'verificationStatus')}
                        </Badge>
                      ) : null}
                      {memberSince ? (
                        <span className="text-xs font-semibold text-ink-muted">Member since {memberSince}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard"><Button variant="secondary" size="sm">Dashboard</Button></Link>
                  <Link href="/create-vault"><Button size="sm">New vault</Button></Link>
                </div>
              </div>

              {profile ? (
                <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiCard label="Locked balance" value={formatPeso(profile.stats.lockedBalance)} />
                  <KpiCard label="Available points" value={profile.stats.availablePoints.toLocaleString('en-PH')} tone="brand" />
                  <KpiCard label="Active vaults" value={String(profile.stats.activeVaults)} />
                  <KpiCard label="Total vaults" value={String(profile.stats.totalVaults)} />
                </div>
              ) : null}
            </div>
          </div>

          {error ? <Alert tone="error" title="Something went wrong">{error}</Alert> : null}
          {success ? <Alert tone="success" title="Saved">{success}</Alert> : null}

          {/* Sidebar + content */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-10">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <AccountSettingsNav active={section} onChange={setSection} />
            </aside>

            <div className="min-w-0">
              <Card padding="lg" className="shadow-sm">
                {section === 'profile' ? (
                  <SettingsSection title="Personal information" description="Update how your name appears across Betless.">
                    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,17rem)]">
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                          <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <Input
                          label="Display name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          hint="Shown on referrals and account summaries."
                        />
                        <Input label="Email" value={email} readOnly hint="Change your email in Security settings." />
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-black text-ink">Linked accounts</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-muted/80 px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink">Email</p>
                              <p className="truncate text-xs text-ink-muted">{email}</p>
                            </div>
                            <Badge tone="success">Primary</Badge>
                          </div>
                          {user?.externalAccounts?.map((account) => (
                            <div key={account.id} className="flex items-center justify-between rounded-xl border border-line bg-surface-muted/80 px-3 py-2.5">
                              <div>
                                <p className="text-sm font-semibold capitalize text-ink">{account.provider.replace('_', ' ')}</p>
                                <p className="text-xs text-ink-muted">{account.emailAddress ?? 'Connected'}</p>
                              </div>
                              <Badge>Linked</Badge>
                            </div>
                          )) ?? null}
                        </div>

                        <p className="pt-2 text-sm font-black text-ink">Cash-in methods</p>
                        <ul className="space-y-2">
                          {paymentMethods.map((method) => (
                            <li key={method.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted/80 px-3 py-2.5">
                              <PaymentMethodIcon method={method} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">{method.name}</p>
                                <p className="text-xs text-ink-muted">{method.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </SettingsSection>
                ) : null}

                {section === 'security' ? (
                  <SettingsSection title="Security" description="Manage authentication and active sessions.">
                    <SettingRow title="Password & sign-in methods" description="Update password, passkeys, or connected providers.">
                      <Button variant="secondary" size="sm" onClick={() => openUserProfile()}>Manage</Button>
                    </SettingRow>
                    <SettingRow title="Two-factor authentication" description="Protect your account with an authenticator app or SMS.">
                      <Button variant="secondary" size="sm" onClick={() => openUserProfile()}>Configure</Button>
                    </SettingRow>
                    <SettingRow title="Active sessions" description="You are signed in on this device. Sign out to end the session here.">
                      <Button variant="secondary" size="sm" onClick={() => void handleSignOut()} isLoading={isSigningOut}>
                        Sign out
                      </Button>
                    </SettingRow>
                  </SettingsSection>
                ) : null}

                {section === 'notifications' ? (
                  <SettingsSection title="Email notifications" description={`Choose what we send to ${email}.`}>
                    <SettingRow title="Product updates" description="New features, partners, and platform news.">
                      <Toggle label="Product updates" checked={prefs.emailProductUpdates} onChange={(v) => updatePref('emailProductUpdates', v)} />
                    </SettingRow>
                    <SettingRow title="Points earned" description="Monthly reward confirmations and balance changes.">
                      <Toggle label="Points earned" checked={prefs.emailPointsEarned} onChange={(v) => updatePref('emailPointsEarned', v)} />
                    </SettingRow>
                    <SettingRow title="Vault maturity" description="Reminders when a vault is about to mature.">
                      <Toggle label="Vault maturity" checked={prefs.emailVaultMaturity} onChange={(v) => updatePref('emailVaultMaturity', v)} />
                    </SettingRow>
                    <SettingRow title="Referral activity" description="When someone joins using your invite link.">
                      <Toggle label="Referral activity" checked={prefs.emailReferralActivity} onChange={(v) => updatePref('emailReferralActivity', v)} />
                    </SettingRow>
                  </SettingsSection>
                ) : null}

                {section === 'privacy' ? (
                  <SettingsSection title="Privacy & data" description="Control how your information is used.">
                    <SettingRow title="Profile visibility" description="Balances stay private; only your referral code is shareable.">
                      <Badge tone="neutral">Private</Badge>
                    </SettingRow>
                    <SettingRow title="Usage analytics" description="Anonymous data to help improve Betless.">
                      <Toggle label="Usage analytics" checked={prefs.shareAnalytics} onChange={(v) => updatePref('shareAnalytics', v)} />
                    </SettingRow>
                    <SettingRow
                      title="Referral code"
                      description={profile?.referralCode ? `Your code: ${profile.referralCode}` : 'Available from Rewards.'}
                    >
                      <Link href="/rewards"><Button variant="secondary" size="sm">View referrals</Button></Link>
                    </SettingRow>
                  </SettingsSection>
                ) : null}

                {section === 'activity' ? (
                  <SettingsSection title="Recent activity" description="Points earned, redemptions, and account events.">
                    <div className="space-y-2">
                      {!profile?.recentActivity.length ? (
                        <p className="rounded-xl border border-line bg-surface-muted/80 p-4 text-sm font-semibold text-ink-muted">
                          No activity yet. Create a vault to start earning points.
                        </p>
                      ) : profile.recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-muted/50 px-4 py-3 transition-colors hover:bg-surface-muted">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink">{item.description}</p>
                            <p className="mt-0.5 text-xs text-ink-muted">
                              {formatDateTime(item.createdAt)} · {getDisplayLabel(item.type, 'pointsTransactionType')}
                            </p>
                          </div>
                          <p className={cn('shrink-0 text-sm font-black tabular-nums', item.points >= 0 ? 'text-success' : 'text-danger')}>
                            {item.points >= 0 ? '+' : ''}{item.points.toLocaleString('en-PH')} pts
                          </p>
                        </div>
                      ))}
                    </div>
                  </SettingsSection>
                ) : null}
              </Card>

              {section === 'profile' && isDirty ? (
                <div className="sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 p-4 shadow-elevated backdrop-blur-md">
                  <p className="text-sm font-semibold text-ink">You have unsaved profile changes</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={cancelProfileEdit} disabled={isSavingProfile}>Cancel</Button>
                    <Button size="sm" onClick={() => void saveProfile()} isLoading={isSavingProfile}>Save changes</Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
