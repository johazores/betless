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
  tagline: 'Remittance lock pot',
  title: 'Betless — Lock Remittance on Stellar',
  description:
    'Auto-lock a slice of incoming remittance on Stellar for named savings goals. Senders verify independently. 100% returned at maturity.',
  locale: 'en_PH',
  themeColor: '#d97706',
  keywords: [
    'remittance savings',
    'lock pot',
    'Philippines remittance',
    'Stellar claimable balance',
    'savings goal',
    'OFW savings',
    'verified lock',
    'Betless',
  ],
} as const;
