import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: 'Admin',
};

export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
