import type { Metadata } from 'next';
import { NotificationsClient } from '@/app/notifications/notifications-client';

export const metadata: Metadata = {
  title: 'Notifications — Betless',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
