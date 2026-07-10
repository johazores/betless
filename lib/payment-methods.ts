export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  /** Short initial(s) rendered as the method's logo mark. */
  mark: string;
  /** Brand background for the logo mark. */
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
    mark: 'G',
    markClassName: 'bg-[#0066e4]',
  },
  {
    id: 'maya',
    name: 'Maya',
    description: 'Instant · No fees',
    mark: 'M',
    markClassName: 'bg-[#0a9830]',
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
