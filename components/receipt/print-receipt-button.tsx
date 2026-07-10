'use client';

export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => globalThis.print()}
      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-50"
    >
      Export / Print receipt
    </button>
  );
}
