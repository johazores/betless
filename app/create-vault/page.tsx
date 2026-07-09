import Link from 'next/link';
import { CreateVaultForm } from '@/components/vault/create-vault-form';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function CreateVaultPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Link href="/" className="text-sm font-bold text-orange-800 hover:text-orange-900">← Back to home</Link>
            <div className="mt-6">
              <Badge>Create commitment vault</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Turn a money goal into a protected commitment plan.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                Set the target, schedule, personal reason, and reward preference. The MVP stores the vault in PostgreSQL and uses Stellar testnet as a proof layer.
              </p>
            </div>
            <Card className="mt-8 bg-slate-950 text-white">
              <p className="text-sm font-black text-orange-200">Recommended demo defaults</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>Target amount: <span className="font-black text-white">₱10,000</span></p>
                <p>Monthly top-up: <span className="font-black text-white">₱2,000</span></p>
                <p>Duration: <span className="font-black text-white">12 months</span></p>
                <p>Reward estimate: <span className="font-black text-white">around 1% per milestone</span></p>
              </div>
              <p className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">
                The strongest pitch is disciplined savings first, recovery-supportive rewards second. The MVP verifies progress actions, not private behavior.
              </p>
            </Card>
          </div>
          <CreateVaultForm />
        </div>
      </section>
    </PublicLayout>
  );
}
