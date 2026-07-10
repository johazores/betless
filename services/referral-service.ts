import crypto from "node:crypto";
import { PointsTransactionType } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import {
  REFERRAL_BONUS_POINTS,
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LENGTH,
} from "@/lib/referrals";
import { UserService } from "@/services/user-service";
import type { ClaimReferralResult, ReferralInfoView } from "@/types/vault";

function generateReferralCode() {
  const bytes = crypto.randomBytes(REFERRAL_CODE_LENGTH);
  let code = "";
  for (const byte of bytes) {
    code += REFERRAL_CODE_ALPHABET[byte % REFERRAL_CODE_ALPHABET.length];
  }
  return code;
}

export class ReferralService {
  /** Assigns the user's shareable code on first read. */
  private static async ensureReferralCode(appUser: {
    id: string;
    referralCode: string | null;
  }) {
    if (appUser.referralCode) return appUser.referralCode;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const updated = await prisma.appUser.update({
          where: { id: appUser.id },
          data: { referralCode: generateReferralCode() },
        });
        return updated.referralCode as string;
      } catch {
        // Unique collision with another user's code — retry with a fresh one.
      }
    }

    throw new Error(
      "Your referral code could not be generated. Please try again.",
    );
  }

  static async getReferralInfo(clerkUserId: string): Promise<ReferralInfoView> {
    const appUser = await UserService.ensureAppUser(clerkUserId);
    const referralCode = await this.ensureReferralCode(appUser);
    const referralCount = await prisma.appUser.count({
      where: { referredById: appUser.id },
    });

    return {
      referralCode,
      referralCount,
      bonusPoints: REFERRAL_BONUS_POINTS,
      hasClaimedCode: appUser.referredById !== null,
    };
  }

  static async claimCode(
    clerkUserId: string,
    code: string,
  ): Promise<ClaimReferralResult> {
    const appUser = await UserService.ensureAppUser(clerkUserId);

    if (appUser.referredById) {
      throw new Error("You have already used a referral code.");
    }

    const referrer = await prisma.appUser.findUnique({
      where: { referralCode: code },
    });

    if (!referrer) {
      throw new Error(
        "That referral code was not found. Check it and try again.",
      );
    }

    if (referrer.id === appUser.id) {
      throw new Error("You cannot use your own referral code.");
    }

    await prisma.$transaction(async (tx: any) => {
      // Conditional update guards the once-only claim against concurrent requests.
      const linked = await tx.appUser.updateMany({
        where: { id: appUser.id, referredById: null },
        data: { referredById: referrer.id },
      });

      if (linked.count === 0) {
        throw new Error("You have already used a referral code.");
      }

      await tx.pointsTransaction.createMany({
        data: [
          {
            appUserId: appUser.id,
            type: PointsTransactionType.REFERRAL_BONUS,
            points: REFERRAL_BONUS_POINTS,
            description: `Welcome bonus for joining with referral code ${code}`,
          },
          {
            appUserId: referrer.id,
            type: PointsTransactionType.REFERRAL_BONUS,
            points: REFERRAL_BONUS_POINTS,
            description: "Referral bonus: a friend joined with your code",
          },
        ],
      });
    });

    return {
      bonusPoints: REFERRAL_BONUS_POINTS,
      referrerName: referrer.displayName,
    };
  }
}
