export function Progress({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="h-3 overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
