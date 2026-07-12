import { Progress } from '@/components/ui/progress';
import { formatPeso } from '@/lib/money';
import { DEFAULT_LOCK_PERCENT } from '@/lib/vault-rules';

export function HeroVaultPreview() {
  const sourceAmount = 20_000;
  const lockedAmount = Math.round((sourceAmount * DEFAULT_LOCK_PERCENT) / 100);
  const spendableAmount = sourceAmount - lockedAmount;

  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-[1.75rem] bg-gradient-to-br from-brand-300/25 via-brand-100/10 to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-2xl border border-line/90 bg-surface shadow-elevated">
        <div className="flex items-center gap-2 border-b border-line bg-surface-sunken/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/40" />
          </div>
          <div className="mx-auto flex h-7 min-w-0 max-w-[220px] flex-1 items-center justify-center rounded-lg border border-line bg-surface px-3">
            <span className="truncate text-[11px] font-medium text-ink-muted">app.betless.ph/dashboard</span>
          </div>
        </div>

        <div className="space-y-4 bg-surface-muted/40 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">Remittance received</p>
              <p className="text-sm font-black text-ink">{formatPeso(sourceAmount)} from abroad</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success-surface px-2 py-0.5 text-[10px] font-bold text-success">
              Stellar verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
              <p className="text-[10px] font-medium text-ink-muted">Spendable now</p>
              <p className="mt-0.5 text-lg font-black tabular-nums text-ink">{formatPeso(spendableAmount)}</p>
            </div>
            <div className="rounded-xl border border-brand-200/70 bg-brand-50/50 p-3 shadow-sm">
              <p className="text-[10px] font-medium text-brand-800/80">Locked on Stellar</p>
              <p className="mt-0.5 text-lg font-black tabular-nums text-brand-900">{formatPeso(lockedAmount)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">College fund</p>
                <p className="mt-0.5 text-base font-black tabular-nums text-ink">{formatPeso(lockedAmount)}</p>
              </div>
              <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-[10px] font-bold text-ink">Active</span>
            </div>
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between text-[10px] font-semibold text-ink-muted">
                <span>Month 5 of 12</span>
                <span>{DEFAULT_LOCK_PERCENT}% auto-locked</span>
              </div>
              <Progress value={42} />
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-line bg-surface p-3 text-[11px] leading-5 text-ink-muted">
            Share link sent to sender → verifies lock on stellar.expert without a Betless account
          </div>
        </div>
      </div>
    </div>
  );
}
