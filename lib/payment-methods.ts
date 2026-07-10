export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  description: string;
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
    name: 'Bank transfer',
    description: 'InstaPay · BPI, BDO, UnionBank, and more',
    mark: '⇄',
    markClassName: 'bg-ink',
  },
];

export function getPaymentMethodById(id: string) {
  return paymentMethods.find((method) => method.id === id) ?? null;
}
