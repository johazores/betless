import Link from 'next/link';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/hero-section';
import { MarketingJsonLd } from '@/components/seo/marketing-json-ld';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicLayout } from '@/components/layout/public-layout';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { formatPeso } from '@/lib/money';
import {
  DEFAULT_LOCK_PERCENT,
  FLAT_FEE_PRINCIPAL_LIMIT_PHP,
  FLAT_WITHDRAWAL_FEE_PHP,
  REMITTANCE_MIN_LOCK_PHP,
} from '@/lib/vault-rules';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = createMetadata({
  absoluteTitle: siteConfig.title,
  description: siteConfig.description,
  path: '/',
});

const promises = [
  ['Locked by the network', 'Every vault principal sits in a Stellar claimable balance with a time predicate. The network — not our database — enforces the lock until maturity.'],
  ['Verifiable by anyone', 'Share a public link with senders abroad. They confirm the lock on stellar.expert without signing up for Betless.'],
  ['Transparent exit', `Need the money early? Withdraw any time for a flat ${formatPeso(FLAT_WITHDRAWAL_FEE_PHP)} fee (1% above ${formatPeso(FLAT_FEE_PRINCIPAL_LIMIT_PHP)}), always shown before you confirm.`],
];

export default function HomePage() {
  return (
    <PublicLayout>
      <MarketingJsonLd />
      <HeroSection />

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-16" id="how-it-works">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <Badge>How it works</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              From remittance to verified lock in four steps.
            </h2>
            <p className="mt-3 text-base leading-7 text-ink-muted">
              Betless turns incoming money into savings at the moment it arrives — locked on Stellar, verifiable by anyone.
            </p>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {promises.map(([title, body]) => (
            <Card key={title}>
              <h2 className="text-xl font-black tracking-tight text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-line bg-surface p-8 shadow-card sm:p-12">
          <div className="max-w-3xl">
            <Badge>Proof of reserves</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-ink">See every active lock — no login required.</h2>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              Our public reserves page aggregates all active vault locks. Each one links to an independent verification
              page with on-chain explorer links when Stellar is configured.
            </p>
            <Link href="/reserves" className="mt-7 inline-flex">
              <Button variant="secondary">View proof of reserves</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-line bg-surface p-8 shadow-card sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-brand-700">Start today</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-ink">Lock your first remittance slice.</h2>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              Name a goal, set {DEFAULT_LOCK_PERCENT}% auto-lock (or choose your own), and share the verification link
              with family abroad. Minimum lock slice: {formatPeso(REMITTANCE_MIN_LOCK_PHP)}.
            </p>
            <Link href="/create-vault" className="mt-7 inline-flex"><Button>Create a lock pot</Button></Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
