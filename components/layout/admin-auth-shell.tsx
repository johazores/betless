import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Badge } from '@/components/ui/badge';

type AdminAuthShellProps = {
  badge: string;
  title: string;
  subtitle: string;
  highlights: Array<[string, string]>;
  children: ReactNode;
};

export function AdminAuthShell({ badge, title, subtitle, highlights, children }: AdminAuthShellProps) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0 rounded-xl transition-opacity hover:opacity-90" aria-label="Betless home">
            <Logo />
          </Link>
          <Badge>Admin</Badge>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Badge>{badge}</Badge>
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
    </div>
  );
}
