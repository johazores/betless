import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicLayout } from '@/components/layout/public-layout';

const steps = [
  ['Create a vault', 'Choose one-time lock or periodic top-up, then set the amount, duration, reward preference, and reason.'],
  ['Stay on schedule', 'Mark progress as top-ups are completed so the vault reflects real demo flow progress.'],
  ['Claim fixed rewards', 'Receive a small demo food or transport voucher as positive reinforcement for staying consistent.'],
];

const rewardExamples = ['Jollibee meal voucher', 'Transport voucher', 'Grocery voucher', 'SM eGift-style voucher'];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge>Stellar testnet MVP</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Bet less. Save more. Stay in control.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Betless helps people protect money from gambling urges by locking savings toward a goal and rewarding consistent progress with food or transport vouchers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-vault"><Button className="w-full sm:w-auto">Create a Betless Vault</Button></Link>
              <a href="#demo-flow"><Button variant="secondary" className="w-full sm:w-auto">View demo flow</Button></a>
            </div>
          </div>
          <Card className="relative overflow-hidden bg-slate-950 text-white">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-400/30 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-black text-orange-200">Demo vault</p>
              <div className="mt-8 space-y-5">
                <div>
                  <p className="text-sm text-slate-300">Target amount</p>
                  <p className="mt-1 text-5xl font-black">₱10,000</p>
                </div>
                <div className="h-3 rounded-full bg-white/10">
                  <div className="h-3 w-1/5 rounded-full bg-orange-300" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Monthly top-up</p>
                    <p className="mt-1 text-2xl font-black">₱2,000</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-slate-300">Reward style</p>
                    <p className="mt-1 text-2xl font-black">Fixed</p>
                  </div>
                </div>
                <p className="rounded-3xl bg-orange-300/15 p-4 text-sm font-semibold leading-6 text-orange-100">
                  This MVP uses demo-only rewards and Stellar testnet proof. It does not process real funds or real vouchers.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8" id="demo-flow">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-3" id="how-it-works">
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
            <p className="text-sm font-black text-orange-700">Problem</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Impulse moments can drain money before a person reaches their goal.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Betless turns a savings goal into a locked commitment plan with visible progress, top-up accountability, and small fixed rewards for consistency.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-black text-orange-700">Why it is not gambling</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">No chance mechanics, no tickets, no betting, no random payout.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Rewards are deterministic progress incentives. The demo uses mock vouchers and no real funds, no real yield, and no voucher supplier integration.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8" id="stellar-proof">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge>Stellar proof layer</Badge>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">A public testnet proof layer for the commitment concept.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The MVP validates a Stellar public key and records a proof status. If Stellar testnet is unavailable during the demo, the vault still works locally and shows a clean unavailable state.
            </p>
          </div>
          <Card className="bg-white">
            <div className="space-y-3">
              {rewardExamples.map((reward) => (
                <div key={reward} className="flex items-center justify-between rounded-2xl bg-orange-50 p-4 text-sm">
                  <span className="font-black text-slate-950">{reward}</span>
                  <span className="rounded-full bg-white px-3 py-1 font-black text-orange-800">demo-only</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-orange-200">Ready for the workshop demo</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Create a polished Betless vault in under two minutes.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Show the core flow: create vault, view progress, mark top-up completed, claim a fixed mock voucher, and display Stellar testnet proof status.
            </p>
            <Link href="/create-vault" className="mt-7 inline-flex"><Button variant="secondary">Create a Betless Vault</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
