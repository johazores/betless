import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** pill = standalone CTAs; field = aligns with form inputs */
  shape?: 'pill' | 'field';
  isLoading?: boolean;
  children: ReactNode;
};

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 focus-visible:ring-brand-500/40 disabled:bg-brand-200 disabled:text-brand-800/50 disabled:shadow-none',
  secondary:
    'bg-brand-100 text-brand-900 hover:bg-brand-200 focus-visible:ring-brand-500/50 disabled:bg-surface-sunken disabled:text-ink-muted',
  ghost:
    'bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:ring-line-strong disabled:text-line-strong',
};

const shapes = {
  pill: 'rounded-full',
  field: 'rounded-xl',
};

const sizes = {
  sm: 'min-h-9 gap-1.5 px-3.5 py-2 text-xs',
  md: 'min-h-11 gap-2 px-5 py-2.5 text-sm',
  lg: 'min-h-12 gap-2 px-6 py-3 text-base',
};

const fieldSizes = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

type ButtonStyleOptions = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'pill' | 'field';
  className?: string;
};

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 active:scale-[0.98]',
    shapes[shape],
    shape === 'field' ? fieldSizes[size] : sizes[size],
    variants[variant],
    shape === 'field' && 'shadow-none',
    className,
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, shape, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
