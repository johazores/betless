import { getSiteUrl, siteConfig } from '@/lib/site';

export function MarketingJsonLd() {
  const url = getSiteUrl();

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url,
    logo: `${url}/icon.svg`,
    description: siteConfig.description,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url,
    description: siteConfig.description,
    inLanguage: 'en-PH',
  };

  const product = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: siteConfig.name,
    description: siteConfig.description,
    url,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Philippines',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
    </>
  );
}
