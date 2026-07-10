import type { Metadata } from 'next';
import { NotificationsClient } from '@/app/notifications/notifications-client';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Notifications',
  'View account activity, vault updates, points earned, and on-chain events on Betless.',
  '/notifications',
);

export default function NotificationsPage() {
  return <NotificationsClient />;
}
