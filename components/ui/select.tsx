import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  hint?: string;
};

export function Select({ label, options, hint, className, id, ...props }: SelectProps) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={fieldId} className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <select
        id={fieldId}
        className={cn(
          'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {hint ? <span className="mt-2 block text-xs font-semibold leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}
