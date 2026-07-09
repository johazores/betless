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
      <span className="text-sm font-black text-slate-800">{label}</span>
      <input
        id={fieldId}
        className={cn(
          'mt-2 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
          className,
        )}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs font-semibold leading-5 text-slate-500">{hint}</span> : null}
      {error ? <span className="mt-2 block text-xs font-bold text-red-700">{error}</span> : null}
    </label>
  );
}
