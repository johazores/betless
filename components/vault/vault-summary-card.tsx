import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPeso } from '@/lib/money';
import { getVaultStatusLabel } from '@/lib/status-labels';
import type { VaultDetailView } from '@/types/vault';

export function VaultSummaryCard({ vault }: { vault: VaultDetailView }) {
  return (
    <Card>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <Badge>{getVaultStatusLabel(vault.status)}</Badge>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Your commitment vault is active</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">{vault.reason}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-black text-slate-950">Wallet public address</p>
          <p className="mt-2 max-w-xs break-all font-semibold text-slate-700">{vault.walletAddress}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-600">Current saved</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{formatPeso(vault.currentAmount)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-600">Target amount</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{formatPeso(vault.targetAmount)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-600">Progress</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{vault.progressPercent}%</p>
        </div>
      </div>

      <div className="mt-6">
        <Progress value={vault.progressPercent} />
      </div>
    </Card>
  );
}
