import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-800',
        className,
      )}
      {...props}
    />
  );
}
