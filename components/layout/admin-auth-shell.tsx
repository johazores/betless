import type { ReactNode } from 'react';
import Link from 'next/link';
import { adminContainerClass } from '@/components/admin/section-header';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/class-names';

type AdminAuthShellProps = {
  badge: string;
  title: string;
  subtitle: string;
  highlights: Array<[string, string]>;
  children: ReactNode;
};

export function AdminAuthShell({ badge, title, subtitle, highlights, children }: AdminAuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <header className="border-b border-line bg-surface/90 backdrop-blur-md">
        <div className={adminContainerClass}>
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="shrink-0 rounded-xl transition-opacity hover:opacity-90" aria-label="Betless home">
              <Logo />
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Admin sign in</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className={adminContainerClass}>
          <div className="grid gap-10 py-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start lg:py-16">
            <div className="lg:sticky lg:top-28">
              <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-800">
                {badge}
              </span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-ink sm:text-5xl">{title}</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">{subtitle}</p>

              <div className="mt-8 space-y-3">
                {highlights.map(([heading, body]) => (
                  <div key={heading} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                    <p className="text-sm font-black text-ink">{heading}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-md lg:mx-0">{children}</div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-line bg-surface">
        <div className={cn(adminContainerClass, 'py-8')}>
          <div className="flex flex-col gap-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
            <Logo showTagline={false} markClassName="h-8 w-8" />
            <p className="max-w-md leading-6">Authorized personnel only. Session activity is audited.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
