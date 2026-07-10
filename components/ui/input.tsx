import type { InputHTMLAttributes } from 'react';
import { formControlClassName, formFieldOffsetClassName, formLabelClassName } from '@/lib/form-control-styles';
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
      <span className={formLabelClassName}>{label}</span>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          formFieldOffsetClassName,
          formControlClassName,
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
