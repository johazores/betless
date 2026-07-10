import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { BetlessClerkProvider } from '@/components/layout/clerk-provider-client';
import { createMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  ...createMetadata(),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.themeColor },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.themeColor },
  ],
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <BetlessClerkProvider>{children}</BetlessClerkProvider>
      </body>
    </html>
  );
}
