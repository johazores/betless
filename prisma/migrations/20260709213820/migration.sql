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
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "RewardClaim_vaultId_weekNumber_key" ON "RewardClaim"("vaultId", "weekNumber");

-- AddForeignKey
ALTER TABLE "TopUp" ADD CONSTRAINT "TopUp_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
