import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  children: ReactNode;
};

const variants = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-900 disabled:bg-slate-300 disabled:text-slate-600',
  secondary: 'bg-orange-100 text-orange-950 hover:bg-orange-200 focus-visible:ring-orange-700 disabled:bg-slate-100 disabled:text-slate-400',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500 disabled:text-slate-400',
};

export function Button({ variant = 'primary', isLoading = false, className, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Working…' : children}
    </button>
  );
}
