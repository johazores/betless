import { Card } from '@/components/ui/card';
import { formatPeso } from '@/lib/money';
import type { VoucherResult } from '@/types/vault';

export function RewardCard({ voucher }: { voucher: VoucherResult }) {
  return (
    <Card className="border-emerald-100 bg-emerald-50">
      <p className="text-sm font-black text-emerald-800">Reward claimed</p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">{voucher.code}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-slate-500">Reward</p>
          <p className="mt-1 font-black text-slate-950">{voucher.name}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-sm text-slate-500">Value</p>
          <p className="mt-1 font-black text-slate-950">{formatPeso(voucher.value)}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-emerald-900">Save this code for redemption.</p>
    </Card>
  );
}
