import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-3xl border border-orange-100/70 bg-white/90 p-5 shadow-card backdrop-blur sm:p-6', className)} {...props} />;
}
