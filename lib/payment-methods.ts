export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  description: string;
  /** Brand logo under `/public/payment-methods`. */
  logoSrc?: string;
  /** Use a wider container for horizontal wordmarks (e.g. InstaPay). */
  logoWide?: boolean;
  /** Fallback initial(s) if mark component is unavailable. */
  mark: string;
  /** Brand background for the fallback mark. */
  markClassName: string;
};

export type PaymentMethodId = 'gcash' | 'maya' | 'instapay';

/**
 * Cash-in rails for vault deposits. In production these map to the SEP-24 anchor's
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
    mark: 'M',
    markClassName: 'bg-[#0A0A0A]',
  },
  {
    id: 'instapay',
    name: 'InstaPay',
    description: 'Bank transfer · BPI, BDO, UnionBank, and more',
    logoSrc: '/payment-methods/instapay.png',
    logoWide: true,
    mark: '⇄',
    markClassName: 'bg-ink',
  },
];

export function getPaymentMethodById(id: string) {
  return paymentMethods.find((method) => method.id === id) ?? null;
}
