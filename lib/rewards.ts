export type RewardItem = {
  id: string;
  name: string;
  category: 'Groceries' | 'Travel' | 'Apparel' | 'Gadgets' | 'Partner merchants';
  points: number;
  description: string;
};

/** 1 point = ₱1, so each reward costs exactly its peso value in points. */
export const rewardCatalog: RewardItem[] = [
  {
    id: 'grocery-500',
    name: '₱500 Grocery voucher',
    category: 'Groceries',
    points: 500,
    description: 'Redeemable at partner supermarkets nationwide.',
  },
  {
    id: 'grocery-1000',
    name: '₱1,000 Grocery voucher',
    category: 'Groceries',
    points: 1000,
    description: 'Redeemable at partner supermarkets nationwide.',
  },
  {
    id: 'travel-2500',
    name: '₱2,500 Travel voucher',
    category: 'Travel',
    points: 2500,
    description: 'Valid for flights and hotel bookings with partner agencies.',
  },
  {
    id: 'travel-5000',
    name: '₱5,000 Travel voucher',
    category: 'Travel',
    points: 5000,
    description: 'Valid for flights and hotel bookings with partner agencies.',
  },
  {
    id: 'apparel-1000',
    name: '₱1,000 Apparel gift card',
    category: 'Apparel',
    points: 1000,
    description: 'Use at partner clothing and footwear stores.',
  },
  {
    id: 'gadget-3000',
    name: '₱3,000 Gadget e-voucher',
    category: 'Gadgets',
    points: 3000,
    description: 'Use at partner electronics stores, online or in-store.',
  },
  {
    id: 'partner-750',
    name: '₱750 Partner merchant credit',
    category: 'Partner merchants',
    points: 750,
    description: 'Credit for dining, transport, and everyday partner merchants.',
  },
];

export function getRewardById(id: string) {
  return rewardCatalog.find((reward) => reward.id === id) ?? null;
}
