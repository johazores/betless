-- Referral system: each user gets a shareable code; claiming a friend's code
-- links the accounts and awards a one-time points bonus to both sides.

-- AlterEnum
ALTER TYPE "PointsTransactionType" ADD VALUE 'REFERRAL_BONUS';

-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "AppUser" ADD COLUMN "referredById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_referralCode_key" ON "AppUser"("referralCode");

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
