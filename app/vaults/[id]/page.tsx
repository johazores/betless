import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/public-layout';
import { VaultDetailClient } from './vault-detail-client';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Vault details',
  'View your Betless vault balance, lock period, points earned, and on-chain status.',
  '/vaults',
);

export default async function VaultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PublicLayout>
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <VaultDetailClient id={id} />
        </div>
      </section>
    </PublicLayout>
  );
}
