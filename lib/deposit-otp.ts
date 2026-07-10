/**
 * Deposit verification flow (demo).
 *
 * Accepts a fixed demo code until a real SMS/TOTP provider is wired in.
 * Replace requestDepositOtp / verifyDepositOtp with API calls in production.
 */

export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 30;

const DEMO_OTP_CODE = '123456';

function simulateNetworkDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sends a one-time code to the user's registered contact. */
export async function requestDepositOtp(): Promise<void> {
  await simulateNetworkDelay(700);
}

/** Verifies a one-time code from the user's registered contact. */
export async function verifyDepositOtp(code: string): Promise<boolean> {
  await simulateNetworkDelay(900);
  return code.trim() === DEMO_OTP_CODE;
}

/** Masks an email like j•••@gmail.com for the "code sent to" hint. */
export function maskEmail(email: string | null | undefined) {
  if (!email || !email.includes('@')) return 'your registered contact';
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 1);
  return `${visible}•••@${domain}`;
}
