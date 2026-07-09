import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm sm:p-6',
        className,
      )}
      {...props}
    />
  );
}
