import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-900', className)} {...props} />;
}
