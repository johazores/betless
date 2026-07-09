'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { defaultVaultForm, rewardOptions, topUpFrequencyOptions, vaultModeOptions, VAULT_MODE } from '@/lib/demo-config';
import { formatPeso } from '@/lib/money';

type FormState = typeof defaultVaultForm;

export function CreateVaultForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultVaultForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rewardEstimate = useMemo(() => {
    const target = Number(form.targetAmount || 0);
    return Math.max(20, Math.round(target * 0.01));
  }, [form.targetAmount]);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const vault = await apiRequest<{ id: string }>('/api/vaults', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          targetAmount: Number(form.targetAmount),
          currentAmount: Number(form.currentAmount),
          topUpAmount: form.mode === VAULT_MODE.PERIODIC_TOP_UP ? Number(form.topUpAmount) : undefined,
          topUpFrequency: form.mode === VAULT_MODE.PERIODIC_TOP_UP ? form.topUpFrequency : undefined,
          durationMonths: Number(form.durationMonths),
        }),
      });

      router.push(`/vaults/${vault.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Vault could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="bg-white/95 shadow-soft">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error ? <Alert title="Please check the form" tone="error">{error}</Alert> : null}

        <Input
          label="Stellar testnet public address"
          hint="Use a public key only. Never paste a private key."
          value={form.walletAddress}
          onChange={(event) => updateField('walletAddress', event.target.value)}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Vault mode"
            options={vaultModeOptions}
            value={form.mode}
            onChange={(event) => updateField('mode', event.target.value)}
          />
          <Select
            label="Reward preference"
            options={rewardOptions.map((reward) => ({ label: reward, value: reward }))}
            value={form.rewardType}
            onChange={(event) => updateField('rewardType', event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Target amount"
            type="number"
            min="1"
            value={form.targetAmount}
            onChange={(event) => updateField('targetAmount', event.target.value)}
            required
          />
          <Input
            label="Starting amount"
            type="number"
            min="0"
            value={form.currentAmount}
            onChange={(event) => updateField('currentAmount', event.target.value)}
            required
          />
          <Input
            label="Duration months"
            type="number"
            min="1"
            max="36"
            value={form.durationMonths}
            onChange={(event) => updateField('durationMonths', event.target.value)}
            required
          />
        </div>

        {form.mode === VAULT_MODE.PERIODIC_TOP_UP ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Top-up amount"
              type="number"
              min="1"
              value={form.topUpAmount}
              onChange={(event) => updateField('topUpAmount', event.target.value)}
              required
            />
            <Select
              label="Top-up frequency"
              options={topUpFrequencyOptions}
              value={form.topUpFrequency}
              onChange={(event) => updateField('topUpFrequency', event.target.value)}
            />
          </div>
        ) : null}

        <label className="block">
          <span className="text-sm font-black text-slate-800">Reason for commitment</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            value={form.reason}
            onChange={(event) => updateField('reason', event.target.value)}
            required
          />
        </label>

        <div className="rounded-3xl bg-orange-50 p-4 text-sm leading-6 text-orange-950">
          <span className="font-black">Estimated milestone reward:</span> {formatPeso(rewardEstimate)} demo value. Rewards are fixed positive reinforcement for completed progress milestones.
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Create my vault
        </Button>
      </form>
    </Card>
  );
}
