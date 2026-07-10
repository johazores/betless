'use client';

import { cn } from '@/lib/class-names';

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:ring-offset-2',
        checked ? 'bg-brand-600' : 'bg-line-strong/80',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04] transition-transform duration-200 ease-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line/60 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description ? <p className="mt-0.5 text-sm leading-6 text-ink-muted">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}
