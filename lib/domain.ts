export const VaultMode = {
  ONE_TIME_LOCK: 'ONE_TIME_LOCK',
  PERIODIC_TOP_UP: 'PERIODIC_TOP_UP',
} as const;

export type VaultMode = (typeof VaultMode)[keyof typeof VaultMode];

export const TopUpFrequency = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;

export type TopUpFrequency = (typeof TopUpFrequency)[keyof typeof TopUpFrequency];

export const VaultStatus = {
  ACTIVE: 'ACTIVE',
  UNLOCK_READY: 'UNLOCK_READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type VaultStatus = (typeof VaultStatus)[keyof typeof VaultStatus];

export const StellarStatus = {
  NOT_CREATED: 'NOT_CREATED',
  PENDING: 'PENDING',
  CREATED: 'CREATED',
  FAILED: 'FAILED',
} as const;

export type StellarStatus = (typeof StellarStatus)[keyof typeof StellarStatus];

export const TopUpStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED',
} as const;

export type TopUpStatus = (typeof TopUpStatus)[keyof typeof TopUpStatus];

export const RewardStatus = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  CLAIMED: 'CLAIMED',
} as const;

export type RewardStatus = (typeof RewardStatus)[keyof typeof RewardStatus];

export type DecimalLike = {
  toNumber?: () => number;
  toString?: () => string;
};

export function decimalToNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);

  const decimalValue = value as DecimalLike | null | undefined;
  if (decimalValue && typeof decimalValue.toNumber === 'function') return decimalValue.toNumber();
  if (decimalValue && typeof decimalValue.toString === 'function') return Number(decimalValue.toString());

  return 0;
}

export const ProofReceiptStatus = {
  LOCAL_RECEIPT: 'LOCAL_RECEIPT',
  NETWORK_CONFIRMED: 'NETWORK_CONFIRMED',
  FAILED: 'FAILED',
} as const;

export type ProofReceiptStatus = (typeof ProofReceiptStatus)[keyof typeof ProofReceiptStatus];


export const ActivityStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type ActivityStatus = (typeof ActivityStatus)[keyof typeof ActivityStatus];

export const ActivityEventType = {
  VAULT_CREATED: 'VAULT_CREATED',
  TOP_UP_RECORDED: 'TOP_UP_RECORDED',
  REWARD_ISSUED: 'REWARD_ISSUED',
  RECEIPT_SAVED: 'RECEIPT_SAVED',
  STELLAR_PAYMENT_SUBMITTED: 'STELLAR_PAYMENT_SUBMITTED',
  ACCOUNT_CONNECTED: 'ACCOUNT_CONNECTED',
} as const;

export type ActivityEventType = (typeof ActivityEventType)[keyof typeof ActivityEventType];

export const ActivityRail = {
  APP: 'APP',
  STELLAR: 'STELLAR',
} as const;

export type ActivityRail = (typeof ActivityRail)[keyof typeof ActivityRail];
