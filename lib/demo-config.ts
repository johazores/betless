export const VAULT_MODE = {
  ONE_TIME_LOCK: 'ONE_TIME_LOCK',
  PERIODIC_TOP_UP: 'PERIODIC_TOP_UP',
} as const;

export const TOP_UP_FREQUENCY = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export const rewardOptions = [
  'Jollibee meal voucher',
  'Transport voucher',
  'Grocery voucher',
  'SM eGift-style voucher',
];

export const vaultModeOptions = [
  { label: 'One-Time Lock', value: VAULT_MODE.ONE_TIME_LOCK },
  { label: 'Periodic Top-Up', value: VAULT_MODE.PERIODIC_TOP_UP },
];

export const topUpFrequencyOptions = [
  { label: 'Weekly', value: TOP_UP_FREQUENCY.WEEKLY },
  { label: 'Monthly', value: TOP_UP_FREQUENCY.MONTHLY },
];

export const defaultVaultForm = {
  walletAddress: '',
  mode: VAULT_MODE.PERIODIC_TOP_UP,
  targetAmount: '10000',
  currentAmount: '0',
  topUpAmount: '2000',
  topUpFrequency: TOP_UP_FREQUENCY.MONTHLY,
  durationMonths: '12',
  rewardType: rewardOptions[0],
  reason: 'I want to protect my savings and stay committed to my goal.',
};
