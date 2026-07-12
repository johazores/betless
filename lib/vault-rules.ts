/**
 * Single source of truth for the commitment savings business rules.
 * Shared by the API validators, services, and UI previews so the numbers a
 * user sees before confirming always match what the server applies.
 */

export const MIN_DEPOSIT_PHP = 10_000;
/** Lower minimum when locking a slice of an incoming remittance payment. */
export const REMITTANCE_MIN_LOCK_PHP = 1_000;
export const LOCK_MONTH_INCREMENT = 12;
export const MAX_LOCK_MONTHS = 60;
export const ANNUAL_REWARD_RATE = 0.04;

export const DEFAULT_LOCK_PERCENT = 30;
export const MIN_LOCK_PERCENT = 10;
export const MAX_LOCK_PERCENT = 90;

export const GOAL_PRESETS = [
  'College fund',
  'Emergency fund',
  'Tuition',
  'Appliance fund',
  'Home down payment',
] as const;

export const FLAT_WITHDRAWAL_FEE_PHP = 500;
export const FLAT_FEE_PRINCIPAL_LIMIT_PHP = 50_000;
export const PERCENT_WITHDRAWAL_FEE = 0.01;

export const lockPeriodOptions = Array.from(
  { length: MAX_LOCK_MONTHS / LOCK_MONTH_INCREMENT },
  (_, index) => (index + 1) * LOCK_MONTH_INCREMENT,
);

export function isValidLockPeriod(months: number) {
  return (
    Number.isInteger(months) &&
    months >= LOCK_MONTH_INCREMENT &&
    months <= MAX_LOCK_MONTHS &&
    months % LOCK_MONTH_INCREMENT === 0
  );
}

/** Points earned per completed month. 1 point = ₱1. */
export function calculateMonthlyPoints(principal: number) {
  return Math.round((principal * ANNUAL_REWARD_RATE) / 12);
}

/** Total points a vault earns if held to maturity. */
export function calculateTotalPoints(principal: number, lockMonths: number) {
  return calculateMonthlyPoints(principal) * lockMonths;
}

/**
 * Early withdrawal fee: flat ₱500 for vaults up to ₱50,000, otherwise 1% of
 * the withdrawn principal.
 */
export function calculateEarlyWithdrawalFee(principal: number) {
  if (principal <= FLAT_FEE_PRINCIPAL_LIMIT_PHP) {
    return FLAT_WITHDRAWAL_FEE_PHP;
  }
  return Math.round(principal * PERCENT_WITHDRAWAL_FEE);
}

export function isValidLockPercent(value: number) {
  return Number.isInteger(value) && value >= MIN_LOCK_PERCENT && value <= MAX_LOCK_PERCENT;
}

/** Locked amount and spendable remainder when splitting an incoming payment. */
export function calculateRemittanceSplit(sourceAmount: number, lockPercent: number) {
  const lockedAmount = Math.round((sourceAmount * lockPercent) / 100);
  const spendableAmount = sourceAmount - lockedAmount;
  return { lockedAmount, spendableAmount };
}

export function getMinimumDepositForVault(fromRemittance: boolean) {
  return fromRemittance ? REMITTANCE_MIN_LOCK_PHP : MIN_DEPOSIT_PHP;
}
