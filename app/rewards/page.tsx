import { PublicLayout } from '@/components/layout/public-layout';
import { RewardsClient } from './rewards-client';

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
