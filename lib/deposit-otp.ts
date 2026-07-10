/**
 * PLACEHOLDER security verification for deposits.
 *
 * This module fakes an OTP/authenticator round-trip so the deposit flow ships
 * with the same shape as a production implementation. To go live, replace the
 * two functions below with API calls (e.g. POST /api/otp/request and
 * POST /api/otp/verify backed by an SMS/TOTP provider) — no UI changes needed.
 */

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;

/** Development-only code accepted by the placeholder verifier. */
const DEV_OTP_CODE = '123456';

function simulateNetworkDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pretends to send a one-time code to the user's registered contact. */
export async function requestDepositOtp(): Promise<void> {
  await simulateNetworkDelay(700);
}

/** Pretends to verify a one-time code. Accepts only the dev code for now. */
export async function verifyDepositOtp(code: string): Promise<boolean> {
  await simulateNetworkDelay(900);
  return code === DEV_OTP_CODE;
}

/** Masks an email like j•••@gmail.com for the "code sent to" hint. */
export function maskEmail(email: string | null | undefined) {
  if (!email || !email.includes('@')) return 'your registered contact';
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 1);
  return `${visible}•••@${domain}`;
}
