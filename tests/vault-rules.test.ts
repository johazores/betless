import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateEarlyWithdrawalFee,
  calculateMonthlyPoints,
  calculateTotalPoints,
  isValidLockPeriod,
  lockPeriodOptions,
} from '../lib/vault-rules';

test('only 12-month lock increments up to 60 months are accepted', () => {
  assert.deepEqual(lockPeriodOptions, [12, 24, 36, 48, 60]);
  assert.equal(isValidLockPeriod(12), true);
  assert.equal(isValidLockPeriod(60), true);
  assert.equal(isValidLockPeriod(0), false);
  assert.equal(isValidLockPeriod(18), false);
  assert.equal(isValidLockPeriod(72), false);
});

test('monthly points use the shared four-percent annual rule', () => {
  assert.equal(calculateMonthlyPoints(10_000), 33);
  assert.equal(calculateMonthlyPoints(50_000), 167);
  assert.equal(calculateTotalPoints(50_000, 12), 2_004);
});

test('early withdrawal uses the flat fee through PHP 50,000', () => {
  assert.equal(calculateEarlyWithdrawalFee(10_000), 500);
  assert.equal(calculateEarlyWithdrawalFee(50_000), 500);
});

test('early withdrawal uses one percent above PHP 50,000', () => {
  assert.equal(calculateEarlyWithdrawalFee(51_000), 510);
  assert.equal(calculateEarlyWithdrawalFee(75_000), 750);
  assert.equal(calculateEarlyWithdrawalFee(100_000), 1_000);
});
