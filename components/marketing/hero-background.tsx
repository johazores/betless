'use client';

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Clean base — neutral with warm accent at top only */}
      <div className="absolute inset-0 bg-surface-muted" />
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(var(--brand-100)/0.55),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_60%_50%_at_80%_0%,rgb(var(--brand-200)/0.25),transparent_65%)]" />

      {/* Fine dot grid (Linear-style) */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: 'radial-gradient(rgb(var(--border) / 0.55) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 0%, black 15%, transparent 72%)',
        }}
      />

      {/* Soft aurora bands */}
      <div className="hero-aurora absolute -left-1/4 top-[8%] h-[320px] w-[55%] rounded-full bg-gradient-to-r from-brand-200/25 via-brand-100/10 to-transparent blur-3xl" />
      <div className="hero-aurora-delayed absolute -right-1/4 top-[12%] h-[280px] w-[50%] rounded-full bg-gradient-to-l from-sky-100/30 via-brand-50/10 to-transparent blur-3xl" />

      {/* Stellar network — subtle, right side only */}
      <svg
        className="hero-network absolute right-0 top-0 hidden h-full w-[55%] text-brand-500/20 lg:block"
        viewBox="0 0 640 600"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="heroArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path d="M40 120 C180 80, 320 160, 480 100 S620 200, 600 280" stroke="url(#heroArc)" strokeWidth="1" className="hero-dash" />
        <path d="M80 380 C220 340, 360 420, 520 360" stroke="url(#heroArc)" strokeWidth="1" className="hero-dash-delayed" />
        <circle cx="480" cy="100" r="3" fill="currentColor" className="hero-node" />
        <circle cx="600" cy="280" r="2.5" fill="currentColor" className="hero-node-delayed" />
        <circle cx="520" cy="360" r="3" fill="currentColor" className="hero-node-slow" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-muted to-transparent" />
    </div>
  );
}
