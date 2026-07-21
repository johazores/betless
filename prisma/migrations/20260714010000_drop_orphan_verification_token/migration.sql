-- The Vault table had a legacy `verificationToken` column (NOT NULL) that is not
-- part of the current Prisma schema. Prisma inserts omit it, causing:
--   Null constraint violation on the fields: (`verificationToken`)
ALTER TABLE "Vault" DROP COLUMN IF EXISTS "verificationToken";
