import { cn } from '@/lib/class-names';

type BetlessMarkProps = {
  className?: string;
};

/**
 * Betless brand mark: a rounded "vault" badge with a brand gradient holding
 * ascending savings bars and a rising arrow — protection plus growth.
 */
export function BetlessMark({ className }: BetlessMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Betless"
      className={cn('h-10 w-10', className)}
    >
      <defs>
        <linearGradient id="betlessMarkGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'rgb(var(--brand-400))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--brand-700))' }} />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="12" fill="url(#betlessMarkGradient)" />
      <rect x="1" y="1" width="38" height="19" rx="11" fill="#ffffff" opacity="0.14" />

      <g fill="#ffffff">
        <rect x="9" y="22" width="5" height="9" rx="2.5" />
        <rect x="17.5" y="17.5" width="5" height="13.5" rx="2.5" opacity="0.92" />
        <rect x="26" y="12" width="5" height="19" rx="2.5" opacity="0.84" />
      </g>

      <path
        d="M23 15 L31 9"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M26.5 8.4 L31.4 8.4 L31.4 13.3"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
};

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  showTagline = true,
}: LogoProps) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <BetlessMark className={markClassName} />
      {showWordmark ? (
        <span>
          <span className="block text-base font-bold leading-none tracking-tight text-ink">
            Bet<span className="text-brand-600">less</span>
          </span>
          {showTagline ? (
            <span className="mt-1 block text-xs font-semibold text-ink-muted">Commitment savings</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
