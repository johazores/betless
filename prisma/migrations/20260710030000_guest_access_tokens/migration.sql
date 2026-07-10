-- Adds guest vault access support for installations that were migrated
-- before guest vault tokens were introduced.
-- This migration is intentionally idempotent so local development databases
-- can recover safely from an older baseline.

ALTER TABLE "Vault"
ADD COLUMN IF NOT EXISTS "guestAccessTokenHash" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Vault_guestAccessTokenHash_key"
ON "Vault"("guestAccessTokenHash");

CREATE INDEX IF NOT EXISTS "Vault_guestAccessTokenHash_idx"
ON "Vault"("guestAccessTokenHash");
