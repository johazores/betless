import type { Metadata } from 'next';
import { VerifyVaultClient } from '@/app/verify/[id]/verify-vault-client';
import { PublicLayout } from '@/components/layout/public-layout';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Verify vault',
  description: 'Independently verify a Betless vault lock on the Stellar network.',
  path: '/verify',
});

export default async function VerifyVaultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PublicLayout>
      <VerifyVaultClient id={id} />
    </PublicLayout>
  );
}
