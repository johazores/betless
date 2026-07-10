-- Real Stellar funding + balance fields, idempotent vault creation, and duplicate-vault guards.

-- Rename the mislabeled proof reference column (was "stellarBalanceId", never stored a balance).
ALTER TABLE "Vault" RENAME COLUMN "stellarBalanceId" TO "stellarProofReference";

-- On-chain funding + balance tracking (real values sourced from Horizon).
ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "stellarNativeBalance" DECIMAL(65,30);
ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "stellarBalanceSyncedAt" TIMESTAMP(3);
ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "stellarFundedAt" TIMESTAMP(3);
ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "stellarError" TEXT;

-- Idempotency key so create-vault retries/refreshes do not create duplicates.
ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

-- Prevent the same wallet address being attached to multiple vaults for one owner.
CREATE UNIQUE INDEX IF NOT EXISTS "Vault_idempotencyKey_key" ON "Vault"("idempotencyKey");
CREATE UNIQUE INDEX IF NOT EXISTS "Vault_appUserId_walletAddress_key" ON "Vault"("appUserId", "walletAddress");

-- New activity event types for real on-chain funding and vault unlock/withdrawal.
ALTER TYPE "ActivityEventType" ADD VALUE IF NOT EXISTS 'STELLAR_ACCOUNT_FUNDED';
ALTER TYPE "ActivityEventType" ADD VALUE IF NOT EXISTS 'VAULT_UNLOCKED';
