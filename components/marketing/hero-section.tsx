import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeroBackground } from '@/components/marketing/hero-background';
import { HeroTrustStrip } from '@/components/marketing/hero-trust-strip';
import { HeroVaultPreview } from '@/components/marketing/hero-vault-preview';
import { formatPeso } from '@/lib/money';
import { MIN_DEPOSIT_PHP } from '@/lib/vault-rules';

type HeroSectionProps = {
  featuredDepositAmount: number;
};

export function HeroSection({ featuredDepositAmount }: HeroSectionProps) {
  return (
    <>
      <section className="relative overflow-hidden">
        <HeroBackground />

        <div className="relative px-4 pb-4 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="max-w-xl">
              <Badge className="border-brand-300/50 bg-surface/90 shadow-sm backdrop-blur-sm">
                Commitment savings · Philippines
              </Badge>

              <h1 className="mt-6 text-[2.35rem] font-black leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
                Save with discipline.
                <span className="mt-2 block text-ink-muted">
                  Earn rewards you&apos;ll{' '}
                  <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
                    actually use.
                  </span>
                </span>
              </h1>

              <p className="mt-5 text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
                Lock {formatPeso(MIN_DEPOSIT_PHP)} or more for 12–60 months, earn monthly points at ~4% per year,
                and get your full deposit back at maturity — verified on the Stellar network.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/create-vault">
                  <Button size="lg" className="w-full sm:w-auto">Open a vault — it&apos;s free</Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">See how it works</Button>
                </a>
              </div>
              <p className="mt-3 text-xs font-medium text-ink-muted">
                No hidden fees on deposits · Early exit fee always shown upfront
              </p>

              <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
                {[
                  ['Min. deposit', formatPeso(MIN_DEPOSIT_PHP)],
                  ['Annual rewards', '~4%'],
                  ['1 point', '= ₱1'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-line/80 bg-surface/80 px-3 py-3 backdrop-blur-sm sm:px-4">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-ink-muted sm:text-xs">{label}</dt>
                    <dd className="mt-1 text-base font-black tabular-nums text-ink sm:text-lg">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:pl-4">
              <HeroVaultPreview featuredDepositAmount={featuredDepositAmount} />
            </div>
          </div>
        </div>
      </section>

      <HeroTrustStrip />
    </>
  );
}
