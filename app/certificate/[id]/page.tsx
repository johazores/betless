import type { Metadata } from 'next';
import { CertificatePageClient } from '@/app/certificate/[id]/certificate-page-client';
import { PublicLayout } from '@/components/layout/public-layout';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Commitment certificate',
  description: 'Verifiable proof of a Betless savings commitment, backed by a Stellar time-locked deposit.',
  path: '/certificate',
});

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PublicLayout>
      <CertificatePageClient id={id} />
    </PublicLayout>
  );
}
