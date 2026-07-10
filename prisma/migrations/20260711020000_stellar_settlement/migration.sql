-- On-chain settlement layer: per-vault claimable balance reference and the
-- StellarOperation outbox for crash-safe, idempotent on-chain writes.

-- AlterTable
ALTER TABLE "Vault" ADD COLUMN "claimableBalanceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vault_claimableBalanceId_key" ON "Vault"("claimableBalanceId");

-- CreateEnum
CREATE TYPE "StellarOperationKind" AS ENUM ('LOCK', 'CLAIM_MATURITY', 'CLAIM_EARLY');

-- CreateEnum
CREATE TYPE "StellarOperationState" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "StellarOperation" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "kind" "StellarOperationKind" NOT NULL,
    "state" "StellarOperationState" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(65,30) NOT NULL,
    "claimableBalanceId" TEXT,
    "xdr" TEXT,
    "txHash" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StellarOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StellarOperation_txHash_key" ON "StellarOperation"("txHash");

-- CreateIndex
CREATE INDEX "StellarOperation_vaultId_kind_idx" ON "StellarOperation"("vaultId", "kind");

-- CreateIndex
CREATE INDEX "StellarOperation_state_createdAt_idx" ON "StellarOperation"("state", "createdAt");

-- AddForeignKey
ALTER TABLE "StellarOperation" ADD CONSTRAINT "StellarOperation_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
