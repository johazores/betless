import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import { getVaultModeLabel } from '@/lib/status-labels';
import type { VaultDetailView } from '@/types/vault';

export function UnlockCard({ vault }: { vault: VaultDetailView }) {
  return (
    <Card>
      <p className="text-sm font-black text-orange-700">Unlock plan</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{formatShortDate(vault.unlockAt)}</h2>
      <div className="mt-5 space-y-3 text-sm text-slate-600">
        <div className="flex justify-between gap-4 rounded-2xl bg-orange-50 p-4">
          <span className="font-bold">Duration</span>
          <span className="font-black text-slate-950">{vault.durationWeeks} weeks</span>
        </div>
        <div className="flex justify-between gap-4 rounded-2xl bg-orange-50 p-4">
          <span className="font-bold">Mode</span>
          <span className="font-black text-slate-950">{getVaultModeLabel(vault.mode)}</span>
        </div>
        <div className="flex justify-between gap-4 rounded-2xl bg-orange-50 p-4">
          <span className="font-bold">Next top-up</span>
          <span className="font-black text-slate-950">{vault.nextTopUp ? `${formatPeso(vault.nextTopUp.amount)} on ${formatShortDate(vault.nextTopUp.dueAt)}` : 'No pending top-up'}</span>
        </div>
      </div>
    </Card>
  );
}
