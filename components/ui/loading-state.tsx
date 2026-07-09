export function LoadingState({ label = 'Loading Betless vault…' }: { label?: string }) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-white/90 p-8 text-center shadow-card">
      <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-orange-200" />
      <p className="mt-4 font-black text-slate-950">{label}</p>
      <p className="mt-2 text-sm text-slate-600">Preparing the latest demo data.</p>
    </div>
  );
}
