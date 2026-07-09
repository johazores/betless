import { TopUpFrequency, VaultMode } from '@/lib/domain';

export function getMaxTopUpCount(durationWeeks: number, frequency: TopUpFrequency) {
  return frequency === TopUpFrequency.WEEKLY
    ? Math.max(1, durationWeeks)
    : Math.max(1, Math.ceil(durationWeeks / 4));
}

export function getRequiredTopUpCount(params: {
  targetAmount: number;
  currentAmount: number;
  topUpAmount: number;
}) {
  const remainingAmount = Math.max(0, params.targetAmount - params.currentAmount);

  if (remainingAmount === 0) return 0;

  return Math.ceil(remainingAmount / params.topUpAmount);
}

export function getPlannedTopUpCount(params: {
  targetAmount: number;
  currentAmount: number;
  topUpAmount: number;
  durationWeeks: number;
  frequency: TopUpFrequency;
}) {
  return Math.min(
    getRequiredTopUpCount(params),
    getMaxTopUpCount(params.durationWeeks, params.frequency),
  );
}

export function canPeriodicPlanReachTarget(params: {
  targetAmount: number;
  currentAmount: number;
  topUpAmount: number;
  durationWeeks: number;
  frequency: TopUpFrequency;
}) {
  const maxTopUps = getMaxTopUpCount(params.durationWeeks, params.frequency);
  return params.currentAmount + params.topUpAmount * maxTopUps >= params.targetAmount;
}

export function getPlanReachMessage(params: {
  targetAmount: number;
  currentAmount: number;
  topUpAmount: number;
  durationWeeks: number;
  frequency: TopUpFrequency;
}) {
  const maxTopUps = getMaxTopUpCount(params.durationWeeks, params.frequency);
  const possibleAmount = params.currentAmount + params.topUpAmount * maxTopUps;
  const remainingAmount = Math.max(0, params.targetAmount - possibleAmount);
  const frequencyLabel = params.frequency === TopUpFrequency.WEEKLY ? 'weekly' : 'monthly';

  return `This ${frequencyLabel} plan reaches only ₱${possibleAmount.toLocaleString('en-PH')} within the selected duration. Increase the top-up, extend the duration, or lower the target by at least ₱${remainingAmount.toLocaleString('en-PH')}.`;
}

export function getSavingsPlanCompletionCopy(mode: VaultMode) {
  return mode === VaultMode.PERIODIC_TOP_UP
    ? 'Complete the next top-up to move the vault forward.'
    : 'Your one-time commitment is ready. Claim the first milestone reward, then save the commitment proof.';
}
