'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
import { Select } from '@/components/ui/select';
import { apiRequest } from '@/lib/api-client';
import { cn } from '@/lib/class-names';
import { addMonths, formatDateTime, formatShortDate } from '@/lib/dates';
import {
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
  maskEmail,
  requestDepositOtp,
  verifyDepositOtp,
} from '@/lib/deposit-otp';
import { formatPeso } from '@/lib/money';
import { getPaymentMethodById, paymentMethods } from '@/lib/payment-methods';
import { PaymentMethodIcon } from '@/components/payment/payment-method-icon';
import { refreshSummary } from '@/lib/summary-events';
import {
  DEFAULT_LOCK_PERCENT,
  GOAL_PRESETS,
  MIN_DEPOSIT_PHP,
  REMITTANCE_MIN_LOCK_PHP,
  calculateEarlyWithdrawalFee,
  calculateMonthlyPoints,
  calculateRemittanceSplit,
  calculateTotalPoints,
  lockPeriodOptions,
} from '@/lib/vault-rules';
import type { VaultView } from '@/types/vault';

type Step = 'details' | 'method' | 'review' | 'verify' | 'success';

const stepLabels: Array<{ id: Step; label: string }> = [
  { id: 'details', label: 'Amount' },
  { id: 'method', label: 'Payment' },
  { id: 'review', label: 'Review' },
  { id: 'verify', label: 'Verify' },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = stepLabels.findIndex((step) => step.id === current);

  return (
    <ol className="flex items-center gap-2" aria-label="Deposit progress">
      {stepLabels.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        return (
          <li key={step.id} className="flex flex-1 flex-col gap-1.5">
            <span
              className={cn(
                'h-1.5 rounded-full transition-colors',
                state === 'upcoming' ? 'bg-surface-sunken' : 'bg-brand-600',
              )}
            />
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-wide',
                state === 'current' ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className={cn('text-right text-sm font-black', strong ? 'text-lg text-ink' : 'text-ink')}>{value}</dd>
    </div>
  );
}

export function CreateVaultForm() {
  const { user } = useUser();
  const [step, setStep] = useState<Step>('details');

  const [amount, setAmount] = useState(String(MIN_DEPOSIT_PHP));
  const [lockMonths, setLockMonths] = useState('12');
  const [methodId, setMethodId] = useState(paymentMethods[0].id);
  const [goalName, setGoalName] = useState('');
  const [fromRemittance, setFromRemittance] = useState(false);
  const [sourceAmount, setSourceAmount] = useState('20000');
  const [lockPercent, setLockPercent] = useState(String(DEFAULT_LOCK_PERCENT));

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdVault, setCreatedVault] = useState<VaultView | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

  // A stable idempotency key per form session prevents duplicate vaults from
  // double-submits or retries anywhere in the flow.
  const idempotencyKey = useMemo(
    () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `btl-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    [],
  );

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const numericAmount = fromRemittance
    ? calculateRemittanceSplit(Number(sourceAmount), Number(lockPercent)).lockedAmount
    : Number(amount);
  const numericLockMonths = Number(lockMonths);
  const numericSourceAmount = Number(sourceAmount);
  const numericLockPercent = Number(lockPercent);
  const remittanceSplit = fromRemittance && Number.isFinite(numericSourceAmount) && Number.isFinite(numericLockPercent)
    ? calculateRemittanceSplit(numericSourceAmount, numericLockPercent)
    : null;
  const amountValid = fromRemittance
    ? remittanceSplit != null &&
      Number.isFinite(numericSourceAmount) &&
      numericSourceAmount >= REMITTANCE_MIN_LOCK_PHP &&
      remittanceSplit.lockedAmount >= REMITTANCE_MIN_LOCK_PHP
    : Number.isFinite(numericAmount) && numericAmount >= MIN_DEPOSIT_PHP;
  const method = getPaymentMethodById(methodId) ?? paymentMethods[0];
  const maskedContact = maskEmail(user?.primaryEmailAddress?.emailAddress);

  const preview = amountValid
    ? {
        monthlyPoints: calculateMonthlyPoints(numericAmount),
        totalPoints: calculateTotalPoints(numericAmount, numericLockMonths),
        maturesAt: addMonths(new Date(), numericLockMonths),
        earlyFee: calculateEarlyWithdrawalFee(numericAmount),
      }
    : null;

  function goToDetails() {
    setError('');
    setStep('details');
  }

  function handleDetailsContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!amountValid) {
      setError(
        fromRemittance
          ? `The locked portion must be at least ${formatPeso(REMITTANCE_MIN_LOCK_PHP)}. Adjust the incoming amount or lock percentage.`
          : `The minimum deposit is ${formatPeso(MIN_DEPOSIT_PHP)}.`,
      );
      return;
    }
    setError('');
    setStep('method');
  }

  async function startVerification() {
    setError('');
    setOtp('');
    setOtpError('');
    setStep('verify');
    setResendSeconds(OTP_RESEND_SECONDS);
    await requestDepositOtp();
  }

  async function handleResend() {
    setIsResending(true);
    setOtp('');
    setOtpError('');
    await requestDepositOtp();
    setResendSeconds(OTP_RESEND_SECONDS);
    setIsResending(false);
  }

  async function handleVerifyAndDeposit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setOtpError('');
    setIsSubmitting(true);

    try {
      const verified = await verifyDepositOtp(otp);
      if (!verified) {
        setOtpError('That code is incorrect. Please check and try again.');
        setOtp('');
        return;
      }

      const body: Record<string, unknown> = {
        lockMonths: numericLockMonths,
        idempotencyKey,
      };

      if (fromRemittance) {
        body.sourceAmount = numericSourceAmount;
        body.lockPercent = numericLockPercent;
      } else {
        body.amount = numericAmount;
      }

      const trimmedGoal = goalName.trim();
      if (trimmedGoal) {
        body.goalName = trimmedGoal;
      }

      const vault = await apiRequest<VaultView>('/api/vaults', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      refreshSummary();
      setCreatedVault(vault);
      setCompletedAt(new Date());
      setStep('success');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Deposit could not be completed.');
      setStep('review');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 'success' && createdVault) {
    return (
      <Card>
        <div className="flex flex-col items-center py-4 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-success-surface text-success">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-ink">Deposit successful</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {formatPeso(createdVault.principal)} is now locked
            {createdVault.goalName ? ` in your ${createdVault.goalName} vault` : ` in your ${createdVault.lockMonths}-month vault`}.
          </p>
        </div>

        <dl className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface-muted px-5">
          <SummaryRow label="Amount deposited" value={formatPeso(createdVault.principal)} strong />
          <SummaryRow label="Paid via" value={method.name} />
          <SummaryRow label="Date" value={completedAt ? formatDateTime(completedAt.toISOString()) : '—'} />
          <SummaryRow
            label="Reference no."
            value={<span className="font-mono text-xs">{createdVault.id.toUpperCase()}</span>}
          />
          <SummaryRow label="Deposit returned on" value={formatShortDate(createdVault.maturesAt)} />
        </dl>

        <p className="mt-4 text-xs font-semibold leading-5 text-ink-muted">
          Your deposit lock is recorded on the Stellar network — share the verification link from your vault page
          so senders abroad can confirm it independently.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/vaults/${createdVault.id}`} className="sm:flex-1">
            <Button className="w-full">View my vault</Button>
          </Link>
          <Link href="/dashboard" className="sm:flex-1">
            <Button variant="secondary" className="w-full">Go to dashboard</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <StepIndicator current={step} />

        {error ? <Alert title="Please check your deposit" tone="error">{error}</Alert> : null}

        {step === 'details' ? (
          <form className="space-y-6" onSubmit={handleDetailsContinue}>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">Set up your lock pot</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Name your goal, choose how much to lock, and when it matures.
              </p>
            </div>

            <Input
              label="Savings goal (optional)"
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
              placeholder="e.g. College fund, Tuition 2027"
              hint="Give your vault a name so senders and family know what it's for."
            />

            <div className="flex flex-wrap gap-2">
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setGoalName(preset)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-bold transition',
                    goalName === preset
                      ? 'border-brand-500 bg-brand-50 text-brand-800'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong',
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface-muted p-4">
              <input
                type="checkbox"
                checked={fromRemittance}
                onChange={(event) => setFromRemittance(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-line text-brand-600"
              />
              <span>
                <span className="block text-sm font-black text-ink">Lock a portion of incoming remittance</span>
                <span className="mt-1 block text-sm leading-6 text-ink-muted">
                  Simulate money arriving from abroad — a slice locks on Stellar, the rest stays spendable.
                </span>
              </span>
            </label>

            {fromRemittance ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Incoming amount"
                  type="number"
                  min={REMITTANCE_MIN_LOCK_PHP}
                  step="1000"
                  value={sourceAmount}
                  onChange={(event) => {
                    setSourceAmount(event.target.value);
                    setError('');
                  }}
                  hint="Total remittance received"
                />
                <Input
                  label="Lock percentage"
                  type="number"
                  min={10}
                  max={90}
                  step={5}
                  value={lockPercent}
                  onChange={(event) => {
                    setLockPercent(event.target.value);
                    setError('');
                  }}
                  hint={`Default ${DEFAULT_LOCK_PERCENT}% — rest stays spendable`}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Deposit amount"
                  type="number"
                  min={MIN_DEPOSIT_PHP}
                  step="1000"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError('');
                  }}
                  hint={`Minimum ${formatPeso(MIN_DEPOSIT_PHP)}`}
                />
              </div>
            )}

            <Select
              label="Lock period"
              options={lockPeriodOptions.map((months) => ({
                label: `${months} months (${months / 12} ${months === 12 ? 'year' : 'years'})`,
                value: String(months),
              }))}
              value={lockMonths}
              onChange={(event) => setLockMonths(event.target.value)}
              hint="Lock periods come in 12-month steps."
            />

            {preview ? (
              <div className="rounded-2xl border border-line bg-surface-muted p-5">
                <p className="text-sm font-black text-ink">Your plan</p>
                {remittanceSplit ? (
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-ink-muted">Spendable now</dt>
                      <dd className="font-black text-ink">{formatPeso(remittanceSplit.spendableAmount)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink-muted">Locked on Stellar</dt>
                      <dd className="font-black text-brand-800">{formatPeso(remittanceSplit.lockedAmount)}</dd>
                    </div>
                  </dl>
                ) : null}
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-ink-muted">Points per month</dt>
                    <dd className="font-black text-ink">{preview.monthlyPoints.toLocaleString('en-PH')} points</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-muted">Deposit returned on</dt>
                    <dd className="font-black text-ink">{formatShortDate(preview.maturesAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-muted">Early withdrawal fee</dt>
                    <dd className="font-black text-ink">{formatPeso(preview.earlyFee)}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs font-semibold leading-5 text-ink-muted">
                  The locked amount is recorded as a Stellar claimable balance — independently verifiable via a share link.
                </p>
              </div>
            ) : null}

            <Button type="submit" className="w-full sm:w-auto">Continue</Button>
          </form>
        ) : null}

        {step === 'method' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">How would you like to pay?</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Deposit {formatPeso(numericAmount)} using your preferred cash-in method.
              </p>
            </div>

            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {paymentMethods.map((option) => {
                const selected = option.id === methodId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMethodId(option.id)}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition',
                      selected
                        ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-100'
                        : 'border-line bg-surface hover:border-line-strong',
                    )}
                  >
                    <PaymentMethodIcon method={option} size="md" />
                    <span className="flex-1">
                      <span className="block font-black text-ink">{option.name}</span>
                      <span className="mt-0.5 block text-sm font-semibold text-ink-muted">{option.description}</span>
                    </span>
                    <span
                      className={cn(
                        'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                        selected ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-surface',
                      )}
                      aria-hidden
                    >
                      {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setStep('review')} className="sm:flex-1">Continue</Button>
              <Button variant="ghost" onClick={goToDetails}>Back</Button>
            </div>
          </div>
        ) : null}

        {step === 'review' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">Review your deposit</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">Please make sure everything is correct before confirming.</p>
            </div>

            <dl className="divide-y divide-line rounded-2xl border border-line bg-surface-muted px-5">
              <SummaryRow label="From" value={method.name} />
              <SummaryRow
                label="To"
                value={goalName.trim() ? `${goalName.trim()} vault` : `Betless ${numericLockMonths}-month vault`}
              />
              <SummaryRow label="Amount to lock" value={formatPeso(numericAmount)} />
              {remittanceSplit ? (
                <SummaryRow label="Spendable immediately" value={formatPeso(remittanceSplit.spendableAmount)} />
              ) : null}
              <SummaryRow label="Convenience fee" value={formatPeso(0)} />
              <SummaryRow
                label="Total to pay"
                value={formatPeso(fromRemittance ? numericSourceAmount : numericAmount)}
                strong
              />
            </dl>

            <dl className="divide-y divide-line rounded-2xl border border-line px-5">
              <SummaryRow label="Locked until" value={preview ? formatShortDate(preview.maturesAt) : '—'} />
              <SummaryRow label="Points per month" value={`${preview?.monthlyPoints.toLocaleString('en-PH') ?? 0} points`} />
              <SummaryRow label="Early withdrawal fee" value={formatPeso(preview?.earlyFee ?? 0)} />
            </dl>

            <p className="text-xs font-semibold leading-5 text-ink-muted">
              By confirming, you agree to lock this deposit for {numericLockMonths} months. You can withdraw early at any
              time for the fee shown above. We&apos;ll ask for a verification code before any money moves.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={startVerification} className="sm:flex-1">
                Confirm and verify
              </Button>
              <Button variant="ghost" onClick={() => setStep('method')}>Back</Button>
            </div>
          </div>
        ) : null}

        {step === 'verify' ? (
          <form className="space-y-6" onSubmit={handleVerifyAndDeposit}>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">Enter your verification code</h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                For your security, we sent a {OTP_LENGTH}-digit code to <span className="font-bold text-ink">{maskedContact}</span>.
              </p>
            </div>

            <OtpInput
              length={OTP_LENGTH}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setOtpError('');
              }}
              disabled={isSubmitting}
              hasError={Boolean(otpError)}
              autoFocus
            />

            {otpError ? <p className="text-sm font-semibold text-danger">{otpError}</p> : null}

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink-muted">
                {resendSeconds > 0 ? (
                  <>Resend code in {resendSeconds}s</>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="font-black text-brand-800 hover:text-brand-900 disabled:text-ink-muted"
                  >
                    {isResending ? 'Sending…' : 'Resend code'}
                  </button>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" isLoading={isSubmitting} className="sm:flex-1">
                {isSubmitting ? 'Processing deposit' : `Deposit ${formatPeso(numericAmount)}`}
              </Button>
              <Button variant="ghost" type="button" onClick={() => setStep('review')} disabled={isSubmitting}>
                Back
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </Card>
  );
}
