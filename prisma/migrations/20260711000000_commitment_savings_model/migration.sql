-- Restructure to the commitment savings model.
-- Legacy vault data (targets, top-ups, Stellar proofs, voucher rewards) is not
-- representable in the new model, so the legacy tables are dropped outright.

-- Drop legacy tables.
DROP TABLE IF EXISTS "ActivityEvent";
DROP TABLE IF EXISTS "ProofReceipt";
DROP TABLE IF EXISTS "RewardClaim";
DROP TABLE IF EXISTS "TopUp";
DROP TABLE IF EXISTS "Vault";
DROP TABLE IF EXISTS "AppConfig";

-- Drop legacy enums.
DROP TYPE IF EXISTS "ActivityEventType";
DROP TYPE IF EXISTS "ActivityRail";
DROP TYPE IF EXISTS "ActivityStatus";
DROP TYPE IF EXISTS "ProofReceiptStatus";
DROP TYPE IF EXISTS "RewardStatus";
DROP TYPE IF EXISTS "StellarStatus";
DROP TYPE IF EXISTS "TopUpFrequency";
DROP TYPE IF EXISTS "TopUpStatus";
DROP TYPE IF EXISTS "VaultMode";
DROP TYPE IF EXISTS "VaultStatus";

-- Drop legacy indexes on kept tables.
DROP INDEX IF EXISTS "AppUser_createdAt_idx";

-- CreateEnum
CREATE TYPE "VaultStatus" AS ENUM ('ACTIVE', 'MATURED', 'WITHDRAWN_EARLY');

-- CreateEnum
CREATE TYPE "PointsTransactionType" AS ENUM ('MONTHLY_REWARD', 'REDEMPTION');

-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "principal" DECIMAL(65,30) NOT NULL,
    "lockMonths" INTEGER NOT NULL,
    "status" "VaultStatus" NOT NULL DEFAULT 'ACTIVE',
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturesAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "withdrawalFee" DECIMAL(65,30),
    "returnedAmount" DECIMAL(65,30),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsTransaction" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "vaultId" TEXT,
    "type" "PointsTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "monthIndex" INTEGER,
    "rewardName" TEXT,
    "voucherCode" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vault_idempotencyKey_key" ON "Vault"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Vault_appUserId_status_createdAt_idx" ON "Vault"("appUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PointsTransaction_appUserId_createdAt_idx" ON "PointsTransaction"("appUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PointsTransaction_vaultId_monthIndex_key" ON "PointsTransaction"("vaultId", "monthIndex");

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsTransaction" ADD CONSTRAINT "PointsTransaction_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE SET NULL ON UPDATE CASCADE;
