-- Adds production-grade activity events for vault, reward, receipt, and Stellar transaction timelines.

DO $$ BEGIN
  CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityEventType" AS ENUM ('VAULT_CREATED', 'TOP_UP_RECORDED', 'REWARD_ISSUED', 'RECEIPT_SAVED', 'STELLAR_PAYMENT_SUBMITTED', 'ACCOUNT_CONNECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ActivityRail" AS ENUM ('APP', 'STELLAR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "ActivityEvent" (
  "id" TEXT NOT NULL,
  "appUserId" TEXT,
  "vaultId" TEXT,
  "receiptId" TEXT,
  "type" "ActivityEventType" NOT NULL,
  "rail" "ActivityRail" NOT NULL DEFAULT 'APP',
  "status" "ActivityStatus" NOT NULL DEFAULT 'COMPLETED',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "walletAddress" TEXT,
  "amount" DECIMAL(65,30),
  "assetCode" TEXT,
  "transactionHash" TEXT,
  "operationId" TEXT,
  "ledger" INTEGER,
  "reference" TEXT,
  "explorerUrl" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ActivityEvent_appUserId_createdAt_idx" ON "ActivityEvent"("appUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityEvent_vaultId_createdAt_idx" ON "ActivityEvent"("vaultId", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityEvent_status_createdAt_idx" ON "ActivityEvent"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityEvent_transactionHash_idx" ON "ActivityEvent"("transactionHash");

DO $$ BEGIN
  ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "ProofReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
