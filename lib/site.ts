/** Public site URL used for canonical links, Open Graph, and sitemap. */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}

export const siteConfig = {
  name: 'Betless',
  tagline: 'Commitment savings',
  title: 'Betless — Commitment Savings',
  description:
    'Lock your savings, earn monthly points, and redeem real-world rewards. Your full deposit comes back at maturity — verified on the Stellar network.',
  locale: 'en_PH',
  themeColor: '#d97706',
  keywords: [
    'commitment savings',
    'savings vault',
    'Philippines savings',
    'earn points',
    'rewards',
    'Stellar',
    'lock savings',
    'Betless',
  ],
} as const;
