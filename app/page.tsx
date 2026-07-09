import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicLayout } from '@/components/layout/public-layout';
import { Progress } from '@/components/ui/progress';

const steps = [
  ['Create a commitment vault', 'Choose a one-time lock or periodic top-up, then set the amount, duration, reward preference, and personal reason.'],
  ['Follow the savings plan', 'Track top-ups and progress using a clear schedule that is easy to explain during the demo.'],
  ['Claim fixed rewards', 'Receive a small demo food, transport, grocery, or eGift-style voucher after eligible milestones.'],
];

const rewardExamples = ['Jollibee meal voucher', 'Transport voucher', 'Grocery voucher', 'SM eGift-style voucher'];

const proofPoints = [
  ['Commitment proof', 'The vault records the selected goal, schedule, unlock date, and reward milestones.'],
  ['Reward proof', 'Reward claims are fixed milestone events, not random outcomes.'],
  ['Partner-ready path', 'Production custody, payment rails, and voucher fulfillment are reserved for licensed partners.'],
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge>Stellar-powered commitment vault</Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Bet less. Save more. Stay in control.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Betless helps people protect money from harmful spending impulses by turning savings into a simple commitment plan with fixed everyday rewards.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-vault"><Button className="w-full sm:w-auto">Create a Commitment Vault</Button></Link>
              <a href="#demo-flow"><Button variant="secondary" className="w-full sm:w-auto">View demo flow</Button></a>
            </div>
          </div>

          <Card>
            <p className="text-sm font-black text-amber-700">Demo commitment vault</p>
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
                  <p className="text-sm font-semibold text-slate-600">Reward design</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">Fixed</p>
                </div>
              </div>
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                This MVP uses demo-only rewards and Stellar testnet proof. It does not process real funds, real vouchers, or regulated financial products.
              </p>
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
            <p className="text-sm font-black text-amber-700">Problem</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Impulse moments can drain money before a person reaches their goal.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Betless creates practical friction: a clear savings target, a visible unlock date, scheduled top-ups, and a reason the user can return to when discipline gets difficult.
            </p>
          </Card>
          <Card>
            <p className="text-sm font-black text-amber-700">Safer product design</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Fixed rewards, no chance mechanics, no treatment claims.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Betless verifies positive actions such as creating a vault, completing a top-up, and reaching a reward milestone. It does not try to diagnose users or prove private behavior.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8" id="stellar-proof">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge>Why Stellar</Badge>
            <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">A transparent proof layer for commitments and rewards.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The MVP validates a Stellar public key and records a graceful testnet proof status. Future versions can use Stellar for partner-funded reward distribution, tokenized vouchers, and auditable milestone claims.
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
                <p className="mt-2 text-sm leading-6 text-slate-600">Demo-only milestone reward for the MVP.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-amber-700">Ready for the workshop demo</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Create a Betless vault in under two minutes.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Show the core flow: create vault, view progress, mark top-up completed, claim a fixed mock voucher, and display Stellar testnet proof status.
            </p>
            <Link href="/create-vault" className="mt-7 inline-flex"><Button>Create a Commitment Vault</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
