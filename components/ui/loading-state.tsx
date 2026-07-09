export function LoadingState({ label = 'Loading Betless vault…' }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-amber-200" />
      <p className="mt-4 font-black text-slate-950">{label}</p>
      <p className="mt-2 text-sm text-slate-600">Preparing the latest demo data.</p>
    </div>
  );
}
