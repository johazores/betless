import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={fieldId} className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'mt-2 w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-base font-medium text-ink outline-none transition placeholder:text-ink-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-100',
          error && 'border-danger/50 focus:border-danger focus:ring-danger/15',
          className,
        )}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs font-medium leading-5 text-ink-muted">{hint}</span> : null}
      {error ? <span className="mt-2 block text-xs font-semibold text-danger">{error}</span> : null}
    </label>
  );
}
