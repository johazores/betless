import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Betless — Commitment Savings',
  description: 'A Stellar-powered commitment savings and milestone rewards MVP.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
