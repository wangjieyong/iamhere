import { Metadata } from 'next';
import { getLocale, t } from './i18n';

export function generateMetadata(): Metadata {
  const locale = getLocale();
  
  return {
    title: t('meta.title', locale),
    description: t('meta.description', locale),
    keywords: t('meta.keywords', locale),
    authors: [{ name: t('meta.author', locale) }],
    creator: t('meta.author', locale),
    publisher: t('meta.author', locale),
    applicationName: t('meta.siteName', locale),
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    openGraph: {
      title: t('meta.title', locale),
      description: t('meta.description', locale),
      siteName: t('meta.siteName', locale),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: t('meta.title', locale),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title', locale),
      description: t('meta.description', locale),
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}