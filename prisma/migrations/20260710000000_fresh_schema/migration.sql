-- Fresh Betless schema baseline.
-- This migration is intended for reset-from-scratch development databases.

-- CreateEnum
CREATE TYPE "VaultMode" AS ENUM ('ONE_TIME_LOCK', 'PERIODIC_TOP_UP');

-- CreateEnum
CREATE TYPE "TopUpFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "VaultStatus" AS ENUM ('ACTIVE', 'UNLOCK_READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StellarStatus" AS ENUM ('NOT_CREATED', 'PENDING', 'CREATED', 'FAILED');

-- CreateEnum
CREATE TYPE "TopUpStatus" AS ENUM ('PENDING', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'CLAIMED');

-- CreateEnum
CREATE TYPE "ProofReceiptStatus" AS ENUM ('DEMO_RECEIPT', 'NETWORK_CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "mode" "VaultMode" NOT NULL DEFAULT 'ONE_TIME_LOCK',
    "targetAmount" DECIMAL(65,30) NOT NULL,
    "currentAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "topUpAmount" DECIMAL(65,30),
    "topUpFrequency" "TopUpFrequency",
    "durationWeeks" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardRate" DECIMAL(65,30) NOT NULL DEFAULT 0.01,
    "reason" TEXT,
    "status" "VaultStatus" NOT NULL DEFAULT 'ACTIVE',
    "stellarBalanceId" TEXT,
    "stellarStatus" "StellarStatus" NOT NULL DEFAULT 'NOT_CREATED',
    "unlockAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopUp" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardClaim" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "rewardName" TEXT NOT NULL,
    "rewardValue" DECIMAL(65,30) NOT NULL,
    "voucherCode" TEXT,
    "status" "RewardStatus" NOT NULL DEFAULT 'LOCKED',
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofReceipt" (
    "id" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "status" "ProofReceiptStatus" NOT NULL DEFAULT 'DEMO_RECEIPT',
    "network" TEXT NOT NULL DEFAULT 'Stellar Testnet',
    "publicAddress" TEXT NOT NULL,
    "proofReference" TEXT NOT NULL,
    "transactionHash" TEXT,
    "operationId" TEXT,
    "ledger" INTEGER,
    "memo" TEXT,
    "explorerUrl" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_clerkUserId_key" ON "AppUser"("clerkUserId");

-- CreateIndex
CREATE INDEX "AppUser_createdAt_idx" ON "AppUser"("createdAt");

-- CreateIndex
CREATE INDEX "Vault_appUserId_status_createdAt_idx" ON "Vault"("appUserId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Vault_walletAddress_idx" ON "Vault"("walletAddress");

-- CreateIndex
CREATE INDEX "TopUp_vaultId_status_dueAt_idx" ON "TopUp"("vaultId", "status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardClaim_vaultId_weekNumber_key" ON "RewardClaim"("vaultId", "weekNumber");

-- CreateIndex
CREATE INDEX "RewardClaim_vaultId_status_weekNumber_idx" ON "RewardClaim"("vaultId", "status", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProofReceipt_proofReference_key" ON "ProofReceipt"("proofReference");

-- CreateIndex
CREATE INDEX "ProofReceipt_appUserId_createdAt_idx" ON "ProofReceipt"("appUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ProofReceipt_vaultId_createdAt_idx" ON "ProofReceipt"("vaultId", "createdAt");

-- CreateIndex
CREATE INDEX "ProofReceipt_transactionHash_idx" ON "ProofReceipt"("transactionHash");

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopUp" ADD CONSTRAINT "TopUp_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofReceipt" ADD CONSTRAINT "ProofReceipt_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofReceipt" ADD CONSTRAINT "ProofReceipt_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
