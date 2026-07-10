import type { FormEvent, ReactNode } from 'react';
import { cn } from '@/lib/class-names';

type FilterToolbarProps = {
  children: ReactNode;
  onSubmit?: (event: FormEvent) => void;
  className?: string;
  actions?: ReactNode;
  layout?: 'default' | 'wide';
};

const layoutClasses = {
  default: 'grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end',
  wide: 'grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 lg:items-end',
};

/** Lightweight filter row — avoids heavy card chrome around search/filter controls. */
export function FilterToolbar({ children, onSubmit, className, actions, layout = 'default' }: FilterToolbarProps) {
  const content = (
    <>
      <div className={layoutClasses[layout]}>
        {children}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </>
  );

  if (onSubmit) {
    return (
      <form
        onSubmit={onSubmit}
        className={cn(
          'flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm sm:flex-row sm:items-end sm:justify-between',
          className,
        )}
      >
        {content}
      </form>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-sm sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      {content}
    </div>
  );
}
