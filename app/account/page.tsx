import type { Metadata } from 'next';
import { AccountClient } from '@/app/account/account-client';

export const metadata: Metadata = {
  title: 'Profile — Betless',
  description: 'Manage your Betless account, security settings, notifications, and activity.',
};

export default function AccountPage() {
  return <AccountClient />;
}
