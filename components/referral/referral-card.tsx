'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiRequest, postJson } from '@/lib/api-client';
import { REFERRAL_STORAGE_KEY, buildReferralInviteMessage } from '@/lib/referrals';
import { refreshSummary } from '@/lib/summary-events';
import type { ClaimReferralResult, ReferralInfoView } from '@/types/vault';

type ReferralCardProps = {
  /** `full` shows the claim form and long copy; `compact` is a slim invite banner. */
  variant?: 'full' | 'compact';
  /** Called after a successful claim so the host page can refetch its own data. */
  onChanged?: () => void;
};

export function ReferralCard({ variant = 'full', onChanged }: ReferralCardProps) {
  const [info, setInfo] = useState<ReferralInfoView | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<ClaimReferralResult | null>(null);
  const [claimError, setClaimError] = useState('');
  const [copied, setCopied] = useState(false);
  const autoClaimAttempted = useRef(false);

  const load = useCallback(async () => {
    try {
      setInfo(await apiRequest<ReferralInfoView>('/api/referrals'));
    } catch {
      // The invite card is a bonus feature — hide it rather than break the page.
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const claim = useCallback(
    async (code: string, silent: boolean) => {
      setIsClaiming(true);
      setClaimError('');

      try {
        const result = await postJson<ClaimReferralResult>('/api/referrals/claim', { code });
        setClaimResult(result);
        setClaimCode('');
        refreshSummary();
        await load();
        onChanged?.();
      } catch (claimCodeError) {
        if (!silent) {
          setClaimError(claimCodeError instanceof Error ? claimCodeError.message : 'Referral code could not be applied.');
        }
      } finally {
        setIsClaiming(false);
      }
    },
    [load, onChanged],
  );

  // Apply a code captured by the /join/<code> invite link, once, right after sign-up.
  useEffect(() => {
    if (!info || autoClaimAttempted.current) return;
    autoClaimAttempted.current = true;

    const pending = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!pending) return;
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);

    if (info.hasClaimedCode || pending === info.referralCode) return;
    void claim(pending, true);
  }, [info, claim]);

  async function handleCopyInvite() {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(buildReferralInviteMessage(info.referralCode, window.location.origin));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the code is still visible to copy manually.
    }
  }

  if (!info) return null;

  const claimedAlert = claimResult ? (
    <Alert title="Referral bonus earned" tone="success">
      You earned {claimResult.bonusPoints.toLocaleString('en-PH')} points
      {claimResult.referrerName ? ` thanks to ${claimResult.referrerName}` : ''} — and your friend got the same.
    </Alert>
  ) : null;

  const codeAndCopy = (
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 font-mono text-lg font-black tracking-widest text-brand-900">
        {info.referralCode}
      </span>
      <Button variant="secondary" size="sm" onClick={handleCopyInvite}>
        {copied ? 'Copied!' : 'Copy invite link'}
      </Button>
    </div>
  );

  if (variant === 'compact') {
    return (
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Referrals</p>
            <h2 className="mt-1 text-xl font-black text-ink">
              Invite friends, earn ₱{info.bonusPoints.toLocaleString('en-PH')} each
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              Send your invite link — you both get {info.bonusPoints.toLocaleString('en-PH')} points when they join.
              {info.referralCount > 0 ? ` ${info.referralCount} joined so far.` : ''}
            </p>
          </div>
          {codeAndCopy}
        </div>
        {claimedAlert ? <div className="mt-4">{claimedAlert}</div> : null}
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Referrals</p>
          <h2 className="mt-2 text-2xl font-black text-ink">
            Invite friends, earn ₱{info.bonusPoints.toLocaleString('en-PH')} each
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Copy your invite link and send it to a friend. When they sign up through it, you both get{' '}
            {info.bonusPoints.toLocaleString('en-PH')} points automatically.
            {info.referralCount > 0
              ? ` You have referred ${info.referralCount} ${info.referralCount === 1 ? 'friend' : 'friends'} so far.`
              : ''}
          </p>
          <div className="mt-4">{codeAndCopy}</div>
        </div>

        {!info.hasClaimedCode ? (
          <div className="w-full shrink-0 rounded-2xl border border-line bg-surface-muted p-5 lg:max-w-sm">
            <h3 className="text-sm font-black text-ink">Have a friend&apos;s code?</h3>
            <div className="mt-3 space-y-3">
              <Input
                label="Referral code"
                name="referral-code"
                placeholder="e.g. AB2CD3EF"
                value={claimCode}
                onChange={(event) => setClaimCode(event.target.value.toUpperCase())}
                error={claimError || undefined}
              />
              <Button
                size="sm"
                className="w-full"
                isLoading={isClaiming}
                disabled={claimCode.trim().length === 0}
                onClick={() => void claim(claimCode, false)}
              >
                Apply code
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {claimedAlert ? <div className="mt-5">{claimedAlert}</div> : null}
    </Card>
  );
}
