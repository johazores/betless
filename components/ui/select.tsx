import type { SelectHTMLAttributes } from 'react';
import { formControlClassName, formFieldOffsetClassName, formLabelClassName } from '@/lib/form-control-styles';
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
      <span className={formLabelClassName}>{label}</span>
      <div className={cn('relative', formFieldOffsetClassName)}>
        <select
          id={fieldId}
          className={cn(formControlClassName, 'appearance-none pr-10', className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {hint ? <span className="mt-2 block text-xs font-medium leading-5 text-ink-muted">{hint}</span> : null}
    </label>
  );
}
