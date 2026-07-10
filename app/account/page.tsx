import type { Metadata } from 'next';
import { AccountClient } from '@/app/account/account-client';
import { privatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = privatePageMetadata(
  'Profile',
  'Manage your Betless account, security settings, notifications, and activity.',
  '/account',
);

export default function AccountPage() {
  return <AccountClient />;
}
