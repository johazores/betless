import type { Metadata } from 'next';
import { BetlessClerkProvider } from '@/components/layout/clerk-provider-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Betless — Commitment Savings',
  description: 'A Stellar-powered commitment savings and milestone rewards app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BetlessClerkProvider>{children}</BetlessClerkProvider>
      </body>
    </html>
  );
}
