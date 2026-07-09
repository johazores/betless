import Link from 'next/link';
import { CreateVaultForm } from '@/components/vault/create-vault-form';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const guidance = [
  ['No wallet setup needed for demo', 'Non-technical users can click “Use demo testnet address” instead of searching for a Stellar public key.'],
  ['Clear three-step setup', 'The form is split into Wallet, Savings Plan, and Reward & Reason so the demo is easier to follow.'],
  ['Safe by design', 'The app only asks for a public address. It never asks for seed words, secret keys, GCash details, or real deposits.'],
];

export default function CreateVaultPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Link href="/" className="text-sm font-bold text-amber-800 hover:text-amber-900">← Back to home</Link>
            <div className="mt-6">
              <Badge>Create commitment vault</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Guided setup for the demo.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                The flow uses a clear stepper, readable cards, and a one-click demo Stellar public address so users do not get stuck on wallet setup.
              </p>
            </div>

            <Card className="mt-8">
              <p className="text-sm font-black text-amber-700">Recommended demo defaults</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Target amount: <span className="font-black text-slate-950">₱10,000</span></p>
                <p>Monthly top-up: <span className="font-black text-slate-950">₱2,000</span></p>
                <p>Duration: <span className="font-black text-slate-950">12 months</span></p>
                <p>Reward estimate: <span className="font-black text-slate-950">around 1% per milestone</span></p>
              </div>
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                The strongest pitch is disciplined savings first, recovery-supportive rewards second. The MVP verifies progress actions, not private behavior.
              </p>
            </Card>

            <div className="mt-5 space-y-3">
              {guidance.map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <CreateVaultForm />
        </div>
      </section>
    </PublicLayout>
  );
}
