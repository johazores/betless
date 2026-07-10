export function EmptyState({ title = 'Nothing to show yet', message = 'Create a Betless vault to start your plan.' }: { title?: string; message?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-xl font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
