import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPeso } from '@/lib/money';
import { MIN_DEPOSIT_PHP } from '@/lib/vault-rules';

export function SavingsAudienceSection() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Card padding="lg" className="overflow-hidden bg-gradient-to-br from-brand-50/80 via-surface to-chain-surface/30">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <Badge>Built for real life</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Lock it before you spend it.
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink-muted sm:text-base">
                Whether you are saving a remittance, a bonus, or a long-term goal, Betless turns
                &ldquo;I will save this&rdquo; into a commitment you cannot quietly undo. Earn monthly
                points while you wait, and get 100% of your deposit back at maturity — with every lock
                independently verifiable on Stellar.
              </p>
              <ul className="mt-5 space-y-2 text-sm font-semibold text-ink-muted">
                <li>· OFW families locking remittance before it gets spent</li>
                <li>· Savers naming goals — tuition, laptop, emergency buffer</li>
                <li>· Anyone who needs discipline more than another wallet</li>
              </ul>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/create-vault">
                  <Button>Start a vault</Button>
                </Link>
                <Link href="/trust">
                  <Button variant="secondary">Verify how locks work</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-line/80 bg-surface/90 p-6 shadow-card backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-chain">Trust promise</p>
              <p className="mt-3 text-lg font-black leading-snug text-ink">
                Your deposit is held in a Stellar claimable balance until maturity.
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                No crypto jargon in the app — but auditors, partners, and skeptical users can verify
                every peso on the public ledger.
              </p>
              <p className="mt-5 text-sm font-bold text-ink">
                Min. deposit {formatPeso(MIN_DEPOSIT_PHP)} · Early exit always available
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
