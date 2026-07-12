const trustItems = [
  {
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M10 1a4 4 0 0 0-4 4v2H5.5A1.5 1.5 0 0 0 4 8.5v7A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 6H14V5a4 4 0 0 0-4-4Zm2.5 6V5a2.5 2.5 0 0 0-5 0v2h5Z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Stellar-enforced locks',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Shareable verification',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M10 3v10M6 9l4 4 4-4M4 17h12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: '100% returned at maturity',
  },
];

export function HeroTrustStrip() {
  return (
    <div className="border-y border-line/70 bg-surface/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Built for remittance families who need savings that stick
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {trustItems.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-700">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
