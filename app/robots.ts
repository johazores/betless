import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sign-in', '/sign-up', '/join/'],
        disallow: [
          '/admin',
          '/api/',
          '/dashboard',
          '/account',
          '/notifications',
          '/create-vault',
          '/rewards',
          '/vaults/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
