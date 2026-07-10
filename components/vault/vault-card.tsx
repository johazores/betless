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
          <p className="text-sm font-black text-brand-700">{vault.lockMonths}-month vault</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{formatPeso(vault.principal)}</h2>
          <p className="mt-1 text-sm font-semibold text-ink-muted">
            {isActive
              ? `Matures ${formatShortDate(vault.maturesAt)} · ${vault.monthlyPoints.toLocaleString('en-PH')} points/month`
              : vault.returnedAmount != null
                ? `${formatPeso(vault.returnedAmount)} returned · ${vault.pointsEarned.toLocaleString('en-PH')} points earned`
                : `${vault.pointsEarned.toLocaleString('en-PH')} points earned`}
          </p>
        </div>
        <span className="w-fit rounded-full bg-surface-sunken px-3 py-1 text-xs font-black text-ink">
          {getVaultStatusLabel(vault.status)}
        </span>
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
