-- Named goals, remittance split metadata, and public verification tokens.
ALTER TABLE "Vault" ADD COLUMN "goalName" TEXT;
ALTER TABLE "Vault" ADD COLUMN "sourceAmount" DECIMAL(65,30);
ALTER TABLE "Vault" ADD COLUMN "lockPercent" INTEGER;
ALTER TABLE "Vault" ADD COLUMN "verificationToken" TEXT;

UPDATE "Vault" SET "verificationToken" = 'vrf_' || "id" WHERE "verificationToken" IS NULL;

ALTER TABLE "Vault" ALTER COLUMN "verificationToken" SET NOT NULL;

CREATE UNIQUE INDEX "Vault_verificationToken_key" ON "Vault"("verificationToken");
