import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicLayout } from '@/components/layout/public-layout';
import { Progress } from '@/components/ui/progress';

const steps = [
  ['Create a vault', 'Choose a wallet, set a goal, and pick a lock period.'],
  ['Follow the plan', 'Complete scheduled top-ups and track progress.'],
  ['Claim rewards', 'Receive fixed milestone rewards for staying on track.'],
];

const rewardExamples = ['Jollibee meal voucher', 'Transport voucher', 'Grocery voucher', 'SM eGift voucher'];

const proofPoints = [
  ['Vault receipt', 'Records the goal, schedule, unlock date, and reward milestones.'],
  ['Reward receipt', 'Records claimed milestones with clear references.'],
  ['Partner-ready', 'Built for licensed wallet, savings, and reward partners.'],
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge>Stellar-powered commitment savings</Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Bet less. Save more. Stay in control.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Betless helps people protect money from harmful spending impulses with simple savings vaults and fixed everyday rewards.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-vault"><Button className="w-full sm:w-auto">Create Vault</Button></Link>
              <a href="#how-it-works"><Button variant="secondary" className="w-full sm:w-auto">How it works</Button></a>
            </div>
          </div>

          <Card>
            <p className="text-sm font-black text-amber-700">Commitment vault</p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-600">Target amount</p>
                <p className="mt-1 text-4xl font-black text-slate-950">₱10,000</p>
              </div>
              <Progress value={20} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Monthly top-up</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">₱2,000</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">Reward type</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">Fixed</p>
                </div>
              </div>
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                Create a vault, complete top-ups, claim rewards, and save a receipt.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8" id="how-it-works">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map(([title, body]) => (
              <Card key={title}>
                <p className="text-xl font-black text-slate-950">{title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-black text-amber-700">Problem</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Impulse moments can drain money before goals are reached.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Betless adds structure: a clear target, visible unlock date, planned top-ups, and a reason to stay committed.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-black text-amber-700">Product design</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Fixed rewards. Clear milestones. No chance mechanics.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Betless tracks positive actions: creating a vault, completing top-ups, claiming rewards, and saving receipts.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8" id="stellar-proof">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge>Why Stellar</Badge>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">A transparent receipt layer for commitments and rewards.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Betless links each vault to a Stellar address and stores a receipt that can support future network verification and partner-funded rewards.
            </p>
          </div>
          <Card>
            <div className="space-y-3">
              {proofPoints.map(([title, body]) => (
                <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-black text-slate-950">{title}</p>
                  <p className="mt-1 leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rewardExamples.map((reward) => (
              <div key={reward} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="font-black text-slate-950">{reward}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Fixed milestone reward.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-amber-700">Start fast</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Create a Betless vault in minutes.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Create a wallet, set a goal, track progress, claim rewards, and save your receipt.
            </p>
            <Link href="/create-vault" className="mt-7 inline-flex"><Button>Create Vault</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
