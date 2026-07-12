import { Progress } from '@/components/ui/progress';
import { formatPeso } from '@/lib/money';
import { calculateMonthlyPoints } from '@/lib/vault-rules';

type HeroVaultPreviewProps = {
  featuredDepositAmount: number;
};

export function HeroVaultPreview({ featuredDepositAmount }: HeroVaultPreviewProps) {
  const monthlyPoints = calculateMonthlyPoints(featuredDepositAmount);

  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
      {/* Glow behind product frame */}
      <div
        className="absolute -inset-4 rounded-[1.75rem] bg-gradient-to-br from-brand-300/25 via-brand-100/10 to-transparent blur-2xl"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-2xl border border-line/90 bg-surface shadow-elevated">
        {/* Browser chrome */}
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

        {/* App preview */}
        <div className="space-y-4 bg-surface-muted/40 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">Your savings</p>
              <p className="text-sm font-black text-ink">Dashboard</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success-surface px-2 py-0.5 text-[10px] font-bold text-success">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M8 1a4 4 0 0 0-4 4v2H3.5A1.5 1.5 0 0 0 2 8.5v5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12.5 7H12V5a4 4 0 0 0-4-4Zm2.5 6V5a2.5 2.5 0 0 0-5 0v2h5Z" clipRule="evenodd" />
              </svg>
              Stellar verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
              <p className="text-[10px] font-medium text-ink-muted">Locked</p>
              <p className="mt-0.5 text-lg font-black tabular-nums text-ink">{formatPeso(featuredDepositAmount)}</p>
            </div>
            <div className="rounded-xl border border-brand-200/70 bg-brand-50/50 p-3 shadow-sm">
              <p className="text-[10px] font-medium text-brand-800/80">Points</p>
              <p className="mt-0.5 text-lg font-black tabular-nums text-brand-900">
                {(monthlyPoints * 5).toLocaleString('en-PH')}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-700">12-month vault</p>
                <p className="mt-0.5 text-base font-black tabular-nums text-ink">{formatPeso(featuredDepositAmount)}</p>
              </div>
              <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-[10px] font-bold text-ink">Active</span>
            </div>
            <div className="mt-3">
              <div className="mb-1.5 flex justify-between text-[10px] font-semibold text-ink-muted">
                <span>Month 5 of 12</span>
                <span>+{monthlyPoints.toLocaleString('en-PH')} pts/mo</span>
              </div>
              <Progress value={42} />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">Recent activity</p>
            <ul className="mt-2 space-y-2">
              {[
                ['Monthly reward', `+${monthlyPoints.toLocaleString('en-PH')} pts`, 'text-success'],
                ['Grocery voucher redeemed', '−500 pts', 'text-danger'],
              ].map(([label, amount, tone]) => (
                <li key={label} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-medium text-ink">{label}</span>
                  <span className={`shrink-0 font-black tabular-nums ${tone}`}>{amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
