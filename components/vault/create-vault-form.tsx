'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Stepper, type StepperStep } from '@/components/ui/stepper';
import { defaultVaultForm, rewardOptions, topUpFrequencyOptions, vaultModeOptions, VAULT_MODE, type VaultFormState } from '@/lib/vault-options';
import { formatPeso } from '@/lib/money';
import { isValidStellarPublicKey } from '@/lib/stellar';
import { canPeriodicPlanReachTarget, getPlanReachMessage } from '@/lib/planning';
import { getOrCreateGuestSessionToken, saveVaultToken } from '@/lib/vault-session';
import type { VaultDetailView } from '@/types/vault';

type FormState = VaultFormState;
type WalletChoice = 'create' | 'existing';
type CreateVaultResponse = VaultDetailView & { accessToken?: string | null };

const steps: StepperStep[] = [
  {
    title: 'Wallet',
    description: 'Create a wallet or use an existing Stellar address.',
  },
  {
    title: 'Plan',
    description: 'Set the amount, schedule, and lock period.',
  },
  {
    title: 'Reward',
    description: 'Choose a milestone reward and confirm.',
  },
];

function getStepError(step: number, form: FormState, walletChoice: WalletChoice, generatedSecret: string, recoverySaved: boolean) {
  if (step === 0) {
    if (!form.walletAddress.trim()) {
      return walletChoice === 'create' ? 'Create a wallet to continue.' : 'Add your Stellar public address to continue.';
    }

    if (!isValidStellarPublicKey(form.walletAddress.trim())) {
      return 'Enter a valid Stellar public address. It starts with G.';
    }

    if (walletChoice === 'create' && generatedSecret && !recoverySaved) {
      return 'Confirm that you saved your recovery key before continuing.';
    }
  }

  if (step === 1) {
    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount);
    const durationMonths = Number(form.durationMonths);
    const topUpAmount = Number(form.topUpAmount);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return 'Enter a target amount greater than zero.';
    if (!Number.isFinite(currentAmount) || currentAmount < 0) return 'Starting amount cannot be negative.';
    if (currentAmount > targetAmount) return 'Starting amount cannot exceed the target.';
    if (!Number.isFinite(durationMonths) || durationMonths < 1 || durationMonths > 36) return 'Choose 1 to 36 months.';
    if (form.mode === VAULT_MODE.ONE_TIME_LOCK && currentAmount !== targetAmount) {
      return 'One-time lock requires the full target upfront. Choose recurring top-up to build over time.';
    }
    if (form.mode === VAULT_MODE.PERIODIC_TOP_UP) {
      if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) return 'Enter a top-up amount greater than zero.';
      if (topUpAmount > targetAmount) return 'Top-up amount cannot exceed the target.';

      const durationWeeks = Math.max(1, Math.round(durationMonths * 4));
      if (!canPeriodicPlanReachTarget({ targetAmount, currentAmount, topUpAmount, durationWeeks, frequency: form.topUpFrequency })) {
        return getPlanReachMessage({ targetAmount, currentAmount, topUpAmount, durationWeeks, frequency: form.topUpFrequency });
      }
    }
  }

  if (step === 2) {
    if (!rewardOptions.includes(form.rewardType)) return 'Choose a reward.';
    if (!form.reason.trim()) return 'Add a short reason.';
    if (form.reason.trim().length > 280) return 'Reason must be 280 characters or less.';
  }

  return '';
}

export function CreateVaultForm() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [form, setForm] = useState<FormState>(defaultVaultForm);
  const [walletChoice, setWalletChoice] = useState<WalletChoice>('create');
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [recoverySaved, setRecoverySaved] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);

  const rewardEstimate = useMemo(() => {
    const target = Number(form.targetAmount || 0);
    return Math.max(20, Math.round(target * 0.01));
  }, [form.targetAmount]);

  const progressLabel = `${currentStep + 1} of ${steps.length}`;
  const isFinalStep = currentStep === steps.length - 1;
  const reasonCharactersLeft = 280 - form.reason.length;

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => {
      if (name === 'mode' && value === VAULT_MODE.ONE_TIME_LOCK) {
        return { ...current, mode: value, currentAmount: current.targetAmount };
      }

      if (current.mode === VAULT_MODE.ONE_TIME_LOCK && name === 'targetAmount') {
        return { ...current, targetAmount: value, currentAmount: value };
      }

      return { ...current, [name]: value };
    });
    setError('');
    setSuccessMessage('');
  }

  function chooseWalletOption(choice: WalletChoice) {
    setWalletChoice(choice);
    setError('');
    setSuccessMessage('');

    if (choice === 'existing') {
      setGeneratedSecret('');
      setRecoverySaved(false);
      setForm((current) => ({ ...current, walletAddress: '' }));
    }
  }

  async function createWallet() {
    setIsGeneratingWallet(true);
    setError('');
    setSuccessMessage('');

    try {
      const { Keypair } = await import('@stellar/stellar-sdk');
      const keypair = Keypair.random();
      setGeneratedSecret(keypair.secret());
      setRecoverySaved(false);
      setForm((current) => ({ ...current, walletAddress: keypair.publicKey() }));
      setSuccessMessage('Wallet created. Save the recovery key before continuing.');
    } catch {
      setError('Wallet could not be created. Try again or use an existing address.');
    } finally {
      setIsGeneratingWallet(false);
    }
  }

  function goToNextStep() {
    const stepError = getStepError(currentStep, form, walletChoice, generatedSecret, recoverySaved);
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

    const stepError = getStepError(currentStep, form, walletChoice, generatedSecret, recoverySaved);
    if (stepError) {
      setError(stepError);
      setSuccessMessage('');
      return;
    }

    setError('');
    setSuccessMessage('Creating your vault…');
    setIsSubmitting(true);

    try {
      const token = isSignedIn ? await getToken() : null;
      const vaultAccessToken = isSignedIn ? null : getOrCreateGuestSessionToken();
      const vault = await apiRequest<CreateVaultResponse>('/api/vaults', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          walletAddress: form.walletAddress.trim(),
          targetAmount: Number(form.targetAmount),
          currentAmount: form.mode === VAULT_MODE.ONE_TIME_LOCK ? Number(form.targetAmount) : Number(form.currentAmount),
          topUpAmount: form.mode === VAULT_MODE.PERIODIC_TOP_UP ? Number(form.topUpAmount) : undefined,
          topUpFrequency: form.mode === VAULT_MODE.PERIODIC_TOP_UP ? form.topUpFrequency : undefined,
          durationMonths: Number(form.durationMonths),
          reason: form.reason.trim(),
        }),
      }, { token, vaultAccessToken });

      saveVaultToken(vault.id, vault.accessToken ?? vaultAccessToken);
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
              Quick setup
            </span>
          </div>

          {error ? <Alert title="Please check this step" tone="error">{error}</Alert> : null}
          {successMessage ? <Alert title="Ready" tone="success">{successMessage}</Alert> : null}

          {currentStep === 0 ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => chooseWalletOption('create')}
                  className={`rounded-2xl border p-4 text-left transition ${walletChoice === 'create' ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <span className="block text-sm font-black text-slate-950">Create new wallet</span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">Generate a new Stellar wallet in this browser.</span>
                </button>
                <button
                  type="button"
                  onClick={() => chooseWalletOption('existing')}
                  className={`rounded-2xl border p-4 text-left transition ${walletChoice === 'existing' ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <span className="block text-sm font-black text-slate-950">Use existing wallet</span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">Paste your Stellar public address.</span>
                </button>
              </div>

              {walletChoice === 'create' ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">New wallet</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Your recovery key stays in this browser. Betless never sends it to the server.</p>
                    </div>
                    <Button type="button" onClick={createWallet} isLoading={isGeneratingWallet} variant="secondary">
                      {form.walletAddress ? 'Create another' : 'Create wallet'}
                    </Button>
                  </div>

                  {form.walletAddress ? (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Public address</p>
                        <p className="mt-2 break-all font-mono text-sm font-black text-slate-950">{form.walletAddress}</p>
                      </div>
                      {generatedSecret ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
                          <p className="text-xs font-black uppercase tracking-wide text-red-700">Recovery key</p>
                          <p className="mt-2 break-all font-mono text-sm font-black">{generatedSecret}</p>
                          <label className="mt-4 flex items-start gap-3 text-sm font-bold leading-6">
                            <input
                              type="checkbox"
                              checked={recoverySaved}
                              onChange={(event) => setRecoverySaved(event.target.checked)}
                              className="mt-1 h-4 w-4 rounded border-red-300"
                            />
                            <span>I saved my recovery key.</span>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Input
                  label="Stellar public address"
                  hint="Open your wallet and copy the public address that starts with G."
                  value={form.walletAddress}
                  onChange={(event) => updateField('walletAddress', event.target.value)}
                  placeholder="G..."
                  autoComplete="off"
                />
              )}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">
                Never enter your recovery phrase or private key. Already have an account? <SignInButton mode="modal"><button type="button" className="font-black underline decoration-2 underline-offset-4">Sign in</button></SignInButton>. You can also continue now and connect your account later.
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Vault type"
                  options={vaultModeOptions}
                  value={form.mode}
                  onChange={(event) => updateField('mode', event.target.value)}
                  hint="Recurring top-up is best for building a goal over time."
                />
                <Input
                  label="Lock period"
                  type="number"
                  min="1"
                  max="36"
                  value={form.durationMonths}
                  onChange={(event) => updateField('durationMonths', event.target.value)}
                  hint="Months"
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
                  label={form.mode === VAULT_MODE.ONE_TIME_LOCK ? 'Amount to lock' : 'Starting amount'}
                  type="number"
                  min="0"
                  value={form.mode === VAULT_MODE.ONE_TIME_LOCK ? form.targetAmount : form.currentAmount}
                  onChange={(event) => updateField('currentAmount', event.target.value)}
                  disabled={form.mode === VAULT_MODE.ONE_TIME_LOCK}
                  hint={form.mode === VAULT_MODE.ONE_TIME_LOCK ? 'Full target is locked upfront.' : 'Use 0 if starting fresh.'}
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
                  One-time lock commits the full target upfront and skips recurring top-ups.
                </div>
              )}
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-5">
              <Select
                label="Reward"
                options={rewardOptions.map((reward) => ({ label: reward, value: reward }))}
                value={form.rewardType}
                onChange={(event) => updateField('rewardType', event.target.value)}
                hint="Rewards are fixed milestones."
              />

              <label className="block">
                <span className="text-sm font-black text-slate-800">Reason</span>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                  value={form.reason}
                  onChange={(event) => updateField('reason', event.target.value)}
                  placeholder="Protect my savings and stay focused."
                  maxLength={280}
                />
                <span className="mt-2 block text-xs font-semibold leading-5 text-slate-500">{reasonCharactersLeft} characters left.</span>
              </label>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <span className="font-black">Estimated reward:</span> {formatPeso(rewardEstimate)} per milestone.
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-950">Review</p>
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
                    <dt className="font-semibold text-slate-500">Lock period</dt>
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
              {isFinalStep ? 'Create Vault' : 'Continue'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
