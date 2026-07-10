import type { Metadata } from 'next';
import { DashboardClient } from './dashboard-client';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Dashboard',
  'Track your locked savings, points balance, vault activity, and on-chain transactions.',
  '/dashboard',
);

export default function DashboardPage() {
  return <DashboardClient />;
}
