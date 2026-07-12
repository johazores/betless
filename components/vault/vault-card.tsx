import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { getVaultStatusLabel } from '@/lib/status-labels';
import type { VaultView } from '@/types/vault';

export function VaultCard({ vault }: { vault: VaultView }) {
  const isActive = vault.status === 'ACTIVE';

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-brand-700">{vault.goalName ?? `${vault.lockMonths}-month vault`}</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{formatPeso(vault.principal)}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-muted">
            {isActive
              ? `Matures ${formatShortDate(vault.maturesAt)} · ${vault.monthlyPoints.toLocaleString('en-PH')} points/month`
              : vault.returnedAmount != null
                ? `${formatPeso(vault.returnedAmount)} returned · ${vault.pointsEarned.toLocaleString('en-PH')} points earned`
                : `${vault.pointsEarned.toLocaleString('en-PH')} points earned`}
            {vault.sourceAmount != null && vault.lockPercent != null
              ? ` · ${vault.lockPercent}% locked from remittance`
              : ''}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="w-fit rounded-full bg-surface-sunken px-3 py-1 text-xs font-black text-ink">
            {getVaultStatusLabel(vault.status)}
          </span>
          {vault.stellar?.status === 'LOCKED' ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-success" title="This vault's deposit is locked on the Stellar network until maturity.">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M8 1a4 4 0 0 0-4 4v2H3.5A1.5 1.5 0 0 0 2 8.5v5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 12.5 7H12V5a4 4 0 0 0-4-4Zm2.5 6V5a2.5 2.5 0 0 0-5 0v2h5Z" clipRule="evenodd" />
              </svg>
              Lock verified
            </span>
          ) : null}
        </div>
      </div>
      {isActive ? (
        <div className="mt-5">
          <Progress value={vault.progressPercent} label={`${vault.monthsCompleted} of ${vault.lockMonths} months`} showValue />
        </div>
      ) : null}
      <div className="mt-5">
        <Link href={`/vaults/${vault.id}`}><Button variant="secondary" className="w-full sm:w-auto">Open vault</Button></Link>
      </div>
    </Card>
  );
}
