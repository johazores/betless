-- Repair script for upgrading a pre-Clerk Betless database.
--
-- Why this exists:
-- Older MVP databases can already contain Vault rows that were created before
-- Clerk account ownership existed. Prisma cannot add a required appUserId column
-- to those existing rows unless they are backfilled first.
--
-- Safe behavior:
-- - Creates a single legacy demo AppUser only when needed.
-- - Adds Vault.appUserId if it does not exist yet.
-- - Assigns existing anonymous vaults to the legacy demo user.
-- - Makes Vault.appUserId required after all rows have an owner.
-- - Adds the foreign key and index if they do not exist.
--
-- After this script succeeds, run:
--   npm run prisma:migrate

CREATE TABLE IF NOT EXISTS "AppUser" (
  "id" TEXT NOT NULL,
  "clerkUserId" TEXT NOT NULL,
  "email" TEXT,
  "displayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AppUser_clerkUserId_key" ON "AppUser"("clerkUserId");
CREATE INDEX IF NOT EXISTS "AppUser_createdAt_idx" ON "AppUser"("createdAt");

INSERT INTO "AppUser" ("id", "clerkUserId", "email", "displayName")
VALUES ('legacy-demo-user', 'legacy-demo-user', 'legacy@betless.local', 'Legacy Demo User')
ON CONFLICT ("clerkUserId") DO UPDATE SET
  "email" = EXCLUDED."email",
  "displayName" = EXCLUDED."displayName",
  "updatedAt" = CURRENT_TIMESTAMP;

ALTER TABLE "Vault" ADD COLUMN IF NOT EXISTS "appUserId" TEXT;

UPDATE "Vault"
SET "appUserId" = 'legacy-demo-user'
WHERE "appUserId" IS NULL;

ALTER TABLE "Vault" ALTER COLUMN "appUserId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Vault_appUserId_fkey'
  ) THEN
    ALTER TABLE "Vault"
    ADD CONSTRAINT "Vault_appUserId_fkey"
    FOREIGN KEY ("appUserId") REFERENCES "AppUser"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Vault_appUserId_status_createdAt_idx" ON "Vault"("appUserId", "status", "createdAt");
