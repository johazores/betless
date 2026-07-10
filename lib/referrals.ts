/** One-time points awarded to both sides when a referral code is claimed. 1 point = ₱1. */
export const REFERRAL_BONUS_POINTS = 100;

export const REFERRAL_CODE_LENGTH = 8;

/** Alphabet without look-alike characters (0/O, 1/I/L) so codes are easy to share aloud. */
export const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function buildReferralInviteMessage(code: string, origin: string) {
  return `Join me on Betless and we both earn ₱${REFERRAL_BONUS_POINTS} in points! Sign up at ${origin} and enter my referral code ${code} on the Rewards page.`;
}
