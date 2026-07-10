import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '@/lib/class-names';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: ElementType;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({ as, interactive = false, padding = 'md', className, ...props }: CardProps) {
  const Component = as ?? 'div';

  return (
    <Component
      className={cn(
        'rounded-2xl border border-line bg-surface text-ink shadow-card',
        paddings[padding],
        interactive &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft',
        className,
      )}
      {...props}
    />
  );
}
