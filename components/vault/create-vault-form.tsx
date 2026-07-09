'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { defaultVaultForm, demoPublicKey, rewardOptions, topUpFrequencyOptions, vaultModeOptions, VAULT_MODE } from '@/lib/demo-config';
import { formatPeso } from '@/lib/money';
import { isValidStellarPublicKey } from '@/lib/stellar';

type FormState = typeof defaultVaultForm;

const steps: StepperStep[] = [
  {
    title: 'Wallet',
    description: 'Use a Stellar testnet public address or demo address.',
  },
  {
    title: 'Savings plan',
    description: 'Set target, starting amount, duration, and top-up schedule.',
  },
  {
    title: 'Reward & reason',
    description: 'Choose a fixed milestone reward and confirm the commitment.',
  },
];

function getStepError(step: number, form: FormState) {
  if (step === 0) {
    if (!form.walletAddress.trim()) return 'Please add a Stellar testnet public address, or use the demo address button.';
    if (!isValidStellarPublicKey(form.walletAddress.trim())) return 'The public address must be a valid Stellar public key. It starts with G and is safe to share.';
  }

  if (step === 1) {
    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount);
    const durationMonths = Number(form.durationMonths);
    const topUpAmount = Number(form.topUpAmount);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return 'Target amount must be greater than zero.';
    if (!Number.isFinite(currentAmount) || currentAmount < 0) return 'Starting amount cannot be negative.';
    if (currentAmount > targetAmount) return 'Starting amount cannot be higher than the target amount.';
    if (!Number.isFinite(durationMonths) || durationMonths < 1 || durationMonths > 36) return 'Duration must be between 1 and 36 months.';
    if (form.mode === VAULT_MODE.PERIODIC_TOP_UP) {
      if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) return 'Top-up amount must be greater than zero.';
      if (topUpAmount > targetAmount) return 'Top-up amount should not be higher than the target amount.';
    }
  }

  if (step === 2) {
    if (!rewardOptions.includes(form.rewardType)) return 'Please choose a valid reward preference.';
    if (!form.reason.trim()) return 'Please add a short reason for the commitment.';
    if (form.reason.trim().length > 280) return 'Reason must be 280 characters or less.';
  }

  return '';
}

export function CreateVaultForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultVaultForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rewardEstimate = useMemo(() => {
    const target = Number(form.targetAmount || 0);
    return Math.max(20, Math.round(target * 0.01));
  }, [form.targetAmount]);

  const progressLabel = `${currentStep + 1} of ${steps.length}`;
  const isFinalStep = currentStep === steps.length - 1;
  const reasonCharactersLeft = 280 - form.reason.length;

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
    setSuccessMessage('');
  }

  function useDemoAddress() {
    setForm((current) => ({ ...current, walletAddress: demoPublicKey }));
    setError('');
    setSuccessMessage('Demo Stellar testnet public address added. This is safe for the MVP because it is a public key only.');
  }

  function goToNextStep() {
    const stepError = getStepError(currentStep, form);
    if (stepError) {
      setError(stepError);
      setSuccessMessage('');
      return;
    }

    setError('');
    setSuccessMessage('');
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goToPreviousStep() {
    setError('');
    setSuccessMessage('');
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFinalStep) {
      goToNextStep();
      return;
    }

    const stepError = getStepError(currentStep, form);
    if (stepError) {
      setError(stepError);
      setSuccessMessage('');
      return;
    }

    setError('');
    setSuccessMessage('Creating your vault and preparing the demo timeline…');
    setIsSubmitting(true);

    try {
      const vault = await apiRequest<{ id: string }>('/api/vaults', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          walletAddress: form.walletAddress.trim(),
          targetAmount: Number(form.targetAmount),
          currentAmount: Number(form.currentAmount),
          topUpAmount: form.mode === VAULT_MODE.PERIODIC_TOP_UP ? Number(form.topUpAmount) : undefined,
          topUpFrequency: form.mode === VAULT_MODE.PERIODIC_TOP_UP ? form.topUpFrequency : undefined,
          durationMonths: Number(form.durationMonths),
          reason: form.reason.trim(),
        }),
      });

      router.push(`/vaults/${vault.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Vault could not be created.');
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Stepper steps={steps} currentStep={currentStep} />

      <Card>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-amber-700">Step {progressLabel}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{steps[currentStep].title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{steps[currentStep].description}</p>
            </div>
            <span className="w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
              Guided setup
            </span>
          </div>

          {error ? <Alert title="Please check this step" tone="error">{error}</Alert> : null}
          {successMessage ? <Alert title="Ready" tone="success">{successMessage}</Alert> : null}

          {currentStep === 0 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
                <p className="font-black">Not technical? Use the demo address.</p>
                <p className="mt-2 text-sm font-semibold leading-6">
                  A Stellar public address is like a wallet username. It starts with <span className="font-black">G</span> and is safe to share. Never paste a secret key or private key.
                </p>
                <button
                  type="button"
                  onClick={useDemoAddress}
                  className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Use demo testnet address
                </button>
              </div>

              <Input
                label="Stellar testnet public address"
                hint="Public keys start with G. Secret keys start with S and must never be entered here."
                value={form.walletAddress}
                onChange={(event) => updateField('walletAddress', event.target.value)}
                placeholder="Example: GCON...L4W4"
                autoComplete="off"
              />

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <span className="font-black">For the demo:</span> the app validates the public key format only. It does not ask for wallet seed words, private keys, GCash details, or real deposits.
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Vault mode"
                  options={vaultModeOptions}
                  value={form.mode}
                  onChange={(event) => updateField('mode', event.target.value)}
                  hint="Periodic top-up is best for the 2-minute demo."
                />
                <Input
                  label="Duration months"
                  type="number"
                  min="1"
                  max="36"
                  value={form.durationMonths}
                  onChange={(event) => updateField('durationMonths', event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Target amount"
                  type="number"
                  min="1"
                  value={form.targetAmount}
                  onChange={(event) => updateField('targetAmount', event.target.value)}
                />
                <Input
                  label="Starting amount"
                  type="number"
                  min="0"
                  value={form.currentAmount}
                  onChange={(event) => updateField('currentAmount', event.target.value)}
                  hint="Use 0 if the user is starting fresh."
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
                  />
                  <Select
                    label="Top-up frequency"
                    options={topUpFrequencyOptions}
                    value={form.topUpFrequency}
                    onChange={(event) => updateField('topUpFrequency', event.target.value)}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                  One-time lock mode skips recurring top-ups and focuses on protecting the starting amount until the unlock date.
                </div>
              )}
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-5">
              <Select
                label="Reward preference"
                options={rewardOptions.map((reward) => ({ label: reward, value: reward }))}
                value={form.rewardType}
                onChange={(event) => updateField('rewardType', event.target.value)}
                hint="Rewards are fixed demo milestones, not random prizes."
              />

              <label className="block">
                <span className="text-sm font-black text-slate-800">Reason for commitment</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                  value={form.reason}
                  onChange={(event) => updateField('reason', event.target.value)}
                  placeholder="Example: I want to protect my savings and stay committed to my goal."
                  maxLength={280}
                />
                <span className="mt-2 block text-xs font-semibold leading-5 text-slate-500">{reasonCharactersLeft} characters left.</span>
              </label>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <span className="font-black">Estimated milestone reward:</span> {formatPeso(rewardEstimate)} demo value. Rewards are fixed positive reinforcement for completed progress milestones.
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-950">Review before creating</p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500">Target</dt>
                    <dd className="font-black text-slate-950">{formatPeso(Number(form.targetAmount || 0))}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Top-up</dt>
                    <dd className="font-black text-slate-950">{form.mode === VAULT_MODE.PERIODIC_TOP_UP ? formatPeso(Number(form.topUpAmount || 0)) : 'Not required'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Duration</dt>
                    <dd className="font-black text-slate-950">{form.durationMonths} months</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Reward</dt>
                    <dd className="font-black text-slate-950">{form.rewardType}</dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" onClick={goToPreviousStep} disabled={currentStep === 0 || isSubmitting}>
              Back
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
              {isFinalStep ? 'Create my vault' : 'Continue'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
