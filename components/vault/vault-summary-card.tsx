import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPeso } from '@/lib/money';
import type { VaultDetailView } from '@/types/vault';

export function VaultSummaryCard({ vault }: { vault: VaultDetailView }) {
  return (
    <Card className="bg-slate-950 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge className="bg-orange-200 text-orange-950">{vault.status.replace(/_/g, ' ')}</Badge>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Your commitment vault is active.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">{vault.reason}</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-4 text-sm text-slate-200">
          <p className="font-black text-white">Wallet public address</p>
          <p className="mt-2 max-w-xs break-all font-semibold">{vault.walletAddress}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white/10 p-5">
          <p className="text-sm font-semibold text-slate-300">Current saved</p>
          <p className="mt-2 text-3xl font-black">{formatPeso(vault.currentAmount)}</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-5">
          <p className="text-sm font-semibold text-slate-300">Target amount</p>
          <p className="mt-2 text-3xl font-black">{formatPeso(vault.targetAmount)}</p>
        </div>
        <div className="rounded-3xl bg-white/10 p-5">
          <p className="text-sm font-semibold text-slate-300">Progress</p>
          <p className="mt-2 text-3xl font-black">{vault.progressPercent}%</p>
        </div>
      </div>

      <div className="mt-6">
        <Progress value={vault.progressPercent} />
      </div>
    </Card>
  );
}
