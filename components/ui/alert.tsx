import type { ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type AlertProps = {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'success' | 'error';
};

const tones = {
  info: 'border-blue-100 bg-blue-50 text-blue-950',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-950',
  error: 'border-red-100 bg-red-50 text-red-950',
};

export function Alert({ title, children, tone = 'info' }: AlertProps) {
  return (
    <div className={cn('rounded-3xl border p-4', tones[tone])}>
      <p className="font-black">{title}</p>
      <div className="mt-1 text-sm font-semibold leading-6 opacity-85">{children}</div>
    </div>
  );
}
