export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  /** Brand logo under `/public/payment-methods`. */
  logoSrc?: string;
  /** Fallback initial(s) when no logo is available. */
  mark: string;
  /** Brand background for the fallback mark. */
  markClassName: string;
};

/**
 * Simulated cash-in rails. In production these map to the SEP-24 anchor's
 * deposit options (GCash, Maya, InstaPay); the flow and UI stay the same.
 */
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Instant · No fees',
    logoSrc: '/payment-methods/gcash.png',
    mark: 'G',
    markClassName: 'bg-[#007CFF]',
  },
  {
    id: 'maya',
    name: 'Maya',
    description: 'Instant · No fees',
    logoSrc: '/payment-methods/maya.svg',
    mark: 'M',
    markClassName: 'bg-[#0A0A0A]',
  },
  {
    id: 'instapay',
    name: 'Bank transfer',
    description: 'InstaPay · BPI, BDO, UnionBank, and more',
    mark: '⇄',
    markClassName: 'bg-ink',
  },
];

export function getPaymentMethodById(id: string) {
  return paymentMethods.find((method) => method.id === id) ?? null;
}
