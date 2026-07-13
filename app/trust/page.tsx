import type { Metadata } from 'next';
import { TrustPageClient } from '@/app/trust/trust-page-client';
import { PublicLayout } from '@/components/layout/public-layout';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Verify reserves',
  description:
    'Independently verify Betless vault locks on the Stellar network. Compare active vaults against on-chain claimable balances.',
  path: '/trust',
});

export default function TrustPage() {
  return (
    <PublicLayout>
      <TrustPageClient />
    </PublicLayout>
  );
}
