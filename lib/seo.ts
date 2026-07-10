import type { Metadata } from 'next';
import { getSiteUrl, siteConfig } from '@/lib/site';

type CreateMetadataOptions = {
  /** Page title without the site suffix (template adds " — Betless"). Pass a full string with absolute: true. */
  title?: string;
  /** Set when title is already fully formatted. */
  absoluteTitle?: string;
  description?: string;
  /** Path including leading slash, e.g. `/rewards`. */
  path?: string;
  noIndex?: boolean;
  openGraph?: Metadata['openGraph'];
  twitter?: Metadata['twitter'];
};

const defaultOgImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
};

export function createMetadata(options: CreateMetadataOptions = {}): Metadata {
  const description = options.description ?? siteConfig.description;
  const socialTitle =
    options.absoluteTitle ??
    (options.title ? `${options.title} — ${siteConfig.name}` : siteConfig.title);
  const canonical = options.path ? `${getSiteUrl()}${options.path}` : getSiteUrl();
  const ogImages = options.openGraph?.images ?? [defaultOgImage];
  const twitterImages = (Array.isArray(ogImages) ? ogImages : [ogImages]).map((image) =>
    typeof image === 'string' ? image : image instanceof URL ? image.href : image.url,
  );

  return {
    title: options.absoluteTitle
      ? { absolute: options.absoluteTitle }
      : options.title
        ? options.title
        : siteConfig.title,
    description,
    metadataBase: new URL(getSiteUrl()),
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: getSiteUrl() }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    keywords: [...siteConfig.keywords],
    category: 'finance',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: options.noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: options.openGraph?.title ?? socialTitle,
      description: options.openGraph?.description ?? description,
      images: ogImages,
      ...options.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: options.twitter?.title ?? socialTitle,
      description: options.twitter?.description ?? description,
      images: twitterImages,
      ...options.twitter,
    },
  };
}

/** Titles for authenticated / private app surfaces. */
export function privatePageMetadata(title: string, description: string, path: string): Metadata {
  return createMetadata({ title, description, path, noIndex: true });
}
