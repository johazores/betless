'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { apiRequest } from '@/lib/api-client';
import { addMonths, formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { refreshSummary } from '@/lib/summary-events';
import {
  MIN_DEPOSIT_PHP,
  calculateEarlyWithdrawalFee,
  calculateMonthlyPoints,
  calculateTotalPoints,
  lockPeriodOptions,
} from '@/lib/vault-rules';
import type { VaultView } from '@/types/vault';

export function CreateVaultForm() {
  const router = useRouter();
  const [amount, setAmount] = useState(String(MIN_DEPOSIT_PHP));
  const [lockMonths, setLockMonths] = useState('12');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A stable idempotency key per form session prevents duplicate vaults from
  // double-submits or retries.
  const idempotencyKey = useMemo(
    () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `btl-${Date.now()}-${Math.random().toString(36).slice(2)}`),
    [],
  );

  const numericAmount = Number(amount);
  const numericLockMonths = Number(lockMonths);
  const amountValid = Number.isFinite(numericAmount) && numericAmount >= MIN_DEPOSIT_PHP;

  const preview = amountValid
    ? {
        monthlyPoints: calculateMonthlyPoints(numericAmount),
        totalPoints: calculateTotalPoints(numericAmount, numericLockMonths),
        maturesAt: addMonths(new Date(), numericLockMonths),
        earlyFee: calculateEarlyWithdrawalFee(numericAmount),
      }
    : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!amountValid) {
      setError(`The minimum deposit is ${formatPeso(MIN_DEPOSIT_PHP)}.`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const vault = await apiRequest<VaultView>('/api/vaults', {
        method: 'POST',
        body: JSON.stringify({
          amount: numericAmount,
          lockMonths: numericLockMonths,
          idempotencyKey,
        }),
      });
      refreshSummary();
      router.push(`/vaults/${vault.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Vault could not be created.');
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-ink">Set up your vault</h2>
          <p className="mt-1 text-sm leading-6 text-ink-muted">Choose how much to lock and for how long. That&apos;s it.</p>
        </div>

        {error ? <Alert title="Please check your plan" tone="error">{error}</Alert> : null}

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
        </div>

        {preview ? (
          <div className="rounded-2xl border border-line bg-surface-muted p-5">
            <p className="text-sm font-black text-ink">Your plan</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink-muted">Points per month</dt>
                <dd className="font-black text-ink">{preview.monthlyPoints.toLocaleString('en-PH')} points</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink-muted">Total points at maturity</dt>
                <dd className="font-black text-ink">{preview.totalPoints.toLocaleString('en-PH')} points</dd>
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
              Points start after your first full month. 1 point = ₱1. Your full deposit is returned automatically when the lock period ends.
            </p>
          </div>
        ) : null}

        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Lock {amountValid ? formatPeso(numericAmount) : 'deposit'} for {numericLockMonths} months
        </Button>
      </form>
    </Card>
  );
}
