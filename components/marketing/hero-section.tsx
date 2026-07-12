import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeroBackground } from '@/components/marketing/hero-background';
import { HeroTrustStrip } from '@/components/marketing/hero-trust-strip';
import { HeroVaultPreview } from '@/components/marketing/hero-vault-preview';
import { formatPeso } from '@/lib/money';
import { DEFAULT_LOCK_PERCENT } from '@/lib/vault-rules';

export function HeroSection() {
  return (
    <>
      <section className="relative overflow-hidden">
        <HeroBackground />

        <div className="relative px-4 pb-4 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="max-w-xl">
              <Badge className="border-brand-300/50 bg-surface/90 shadow-sm backdrop-blur-sm">
                Remittance lock pot · Philippines
              </Badge>

              <h1 className="mt-6 text-[2.35rem] font-black leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
                Lock remittance
                <span className="mt-2 block text-ink-muted">
                  before it{' '}
                  <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                    disappears.
                  </span>
                </span>
              </h1>

              <p className="mt-5 text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
                When money arrives from abroad, auto-lock a slice on Stellar for a named goal — tuition,
                emergency fund, appliance. Senders verify the lock independently. You get 100% back at maturity.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/create-vault">
                  <Button size="lg" className="w-full sm:w-auto">Create a lock pot</Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">See how it works</Button>
                </a>
              </div>
              <p className="mt-3 text-xs font-medium text-ink-muted">
                No crypto vocabulary · Shareable verification link · Early exit always disclosed upfront
              </p>

              <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
                {[
                  ['Default auto-lock', `${DEFAULT_LOCK_PERCENT}%`],
                  ['Min. lock slice', formatPeso(1_000)],
                  ['Network enforced', 'Stellar'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-line/80 bg-surface/80 px-3 py-3 backdrop-blur-sm sm:px-4">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-muted sm:text-xs">{label}</dt>
                    <dd className="mt-1 text-base font-black tabular-nums text-ink sm:text-lg">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:pl-4">
              <HeroVaultPreview />
            </div>
          </div>
        </div>
      </section>

      <HeroTrustStrip />
    </>
  );
}
