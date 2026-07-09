import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/dates';
import { formatPeso } from '@/lib/money';
import type { TopUpView, VaultDetailView } from '@/types/vault';

type TopUpScheduleProps = {
  vault: VaultDetailView;
  onMarkTopUp: (topUpId?: string) => void;
  isLoading: boolean;
};

function TopUpStatusPill({ topUp }: { topUp: TopUpView }) {
  const className = topUp.status === 'COMPLETED'
    ? 'bg-emerald-100 text-emerald-800'
    : topUp.status === 'MISSED'
      ? 'bg-red-100 text-red-800'
      : 'bg-orange-100 text-orange-900';

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>{topUp.status}</span>;
}

export function TopUpSchedule({ vault, onMarkTopUp, isLoading }: TopUpScheduleProps) {
  const visibleTopUps = vault.topUps.slice(0, 8);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black text-orange-700">Top-up schedule</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Keep the commitment moving.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Mark the next scheduled top-up as completed to update saved amount and unlock the next fixed reward.</p>
        </div>
        <Button onClick={() => onMarkTopUp(vault.nextTopUp?.id)} disabled={!vault.nextTopUp} isLoading={isLoading}>
          Mark top-up completed
        </Button>
      </div>

      {visibleTopUps.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-orange-50 p-5 text-sm font-semibold text-orange-950">One-time lock mode does not require recurring top-ups.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {visibleTopUps.map((topUp) => (
            <div key={topUp.id} className="flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-slate-950">{formatPeso(topUp.amount)}</p>
                <p className="text-sm text-slate-600">Due {formatShortDate(topUp.dueAt)} {topUp.paidAt ? `• paid ${formatShortDate(topUp.paidAt)}` : ''}</p>
              </div>
              <TopUpStatusPill topUp={topUp} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
