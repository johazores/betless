import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/class-names';

/** Shared horizontal gutters — padding lives outside max-width so edges align with page content. */
export const pageGutterClass = 'px-4 sm:px-6 lg:px-8';

/** Centered content column used across header, footer, and pages. */
export const pageContentClass = 'mx-auto w-full max-w-6xl';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function PageContainer({ children, className, as: Component = 'div' }: PageContainerProps) {
  return <Component className={cn(pageContentClass, className)}>{children}</Component>;
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

/** Standard page section with gutters + centered max-width content. */
export function PageSection({ children, className, containerClassName }: PageSectionProps) {
  return (
    <section className={cn(pageGutterClass, 'py-10', className)}>
      <PageContainer className={containerClassName}>{children}</PageContainer>
    </section>
  );
}
