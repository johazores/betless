/** One-time points awarded to both sides when a referral code is claimed. 1 point = ₱1. */
export const REFERRAL_BONUS_POINTS = 100;

export const REFERRAL_CODE_LENGTH = 8;

/** Alphabet without look-alike characters (0/O, 1/I/L) so codes are easy to share aloud. */
export const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** localStorage key holding a code captured by /join/<code> until the user can claim it. */
export const REFERRAL_STORAGE_KEY = 'betless.pendingReferralCode';

/** Direct invite link: opening it stores the code and walks the friend straight into sign-up. */
export function buildReferralLink(origin: string, code: string) {
  return `${origin}/join/${code}`;
}

export function buildReferralInviteMessage(code: string, origin: string) {
  return `Join me on Betless and we both earn ₱${REFERRAL_BONUS_POINTS} in points! Tap my invite link to get started: ${buildReferralLink(origin, code)}`;
}

export function isValidReferralCodeShape(code: string) {
  return /^[A-Z0-9]{4,16}$/.test(code);
}
