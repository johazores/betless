import Link from 'next/link';
import { CreateVaultForm } from '@/components/vault/create-vault-form';
import { PublicLayout } from '@/components/layout/public-layout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const guidance = [
  ['1. Create or paste a wallet', 'We can generate a free Stellar wallet in your browser, or paste your own address.'],
  ['2. Set your goal', 'Choose a peso target, top-up schedule, and lock period. Pesos track your savings plan.'],
  ['3. We activate it on Stellar', 'Betless funds your wallet on the free test network and saves a verifiable receipt.'],
  ['4. Track & claim', 'Mark top-ups, claim milestone rewards, and unlock when you reach your goal.'],
];

export default function CreateVaultPage() {
  return (
    <PublicLayout>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Link href="/" className="text-sm font-bold text-amber-800 hover:text-amber-900">← Back to home</Link>
            <div className="mt-6">
              <Badge>Create Vault</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Build your commitment plan.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                Create a wallet, set a savings target, choose a reward, and start tracking progress in minutes.
              </p>
              <p className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">
                No real money is used — Betless runs on the Stellar test network. Peso amounts are your savings plan.
              </p>
            </div>

            <Card className="mt-8">
              <p className="text-sm font-black text-amber-700">Suggested plan</p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Target amount: <span className="font-black text-slate-950">₱10,000</span></p>
                <p>Monthly top-up: <span className="font-black text-slate-950">₱2,000</span></p>
                <p>Lock period: <span className="font-black text-slate-950">12 months</span></p>
                <p>Reward: <span className="font-black text-slate-950">fixed milestone benefit</span></p>
              </div>
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
