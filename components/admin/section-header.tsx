import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/class-names';

/** Matches PublicLayout content width — use on every admin horizontal band. */
export const adminContainerClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

type SectionHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeader({ badge, title, description, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {badge ? <Badge>{badge}</Badge> : null}
        <h2 className={cn('text-3xl font-black tracking-tight text-ink', badge ? 'mt-4' : undefined)}>{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

type FormActionsProps = {
  children: ReactNode;
  className?: string;
};

/** Right-aligned form actions with consistent top spacing. */
export function FormActions({ children, className }: FormActionsProps) {
  return <div className={cn('flex flex-wrap justify-end gap-2 pt-2', className)}>{children}</div>;
}

/** Responsive field grid — hints belong outside the grid to keep controls aligned. */
export function FormFieldGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 | 4 | 5 }) {
  const colClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 xl:grid-cols-4',
    5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[columns];

  return <div className={cn('grid gap-4', colClass)}>{children}</div>;
}
