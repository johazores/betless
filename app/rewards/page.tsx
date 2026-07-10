import type { Metadata } from 'next';
import { PublicLayout } from '@/components/layout/public-layout';
import { RewardsClient } from './rewards-client';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Rewards',
  'Redeem your Betless points for groceries, travel, gadgets, and partner merchant rewards.',
  '/rewards',
);

export default function RewardsPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <RewardsClient />
        </div>
      </section>
    </PublicLayout>
  );
}
