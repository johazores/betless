import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BetlessClerkProvider } from '@/components/layout/clerk-provider-client';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Betless — Commitment Savings',
  description: 'A Stellar-powered commitment savings and milestone rewards app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <BetlessClerkProvider>{children}</BetlessClerkProvider>
      </body>
    </html>
  );
}
