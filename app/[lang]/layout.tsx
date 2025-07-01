import './global.css';
import { I18nProvider, type Translations } from 'fumadocs-ui/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '@/app/i18n';
import { setRequestLocale } from 'next-intl/server';

import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

// Define translations for fumadocs UI
const zh: Partial<Translations> = {
  search: '搜索',
  // Add other translations as needed
};

// Available languages that will be displayed on UI
// Make sure `locale` is consistent with your i18n config
const localeMappings = [
  {
    name: 'English',
    locale: 'en',
  },
  {
    name: 'Simplified Chinese',
    locale: 'zh',
  },
];

type TranslationsMap = {
  'zh': Partial<Translations>;
};

const translationsMap: TranslationsMap = {
  'zh': zh,
};

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}


// 配置网站元数据
export const metadata: Metadata = {
  title: {
    default: 'AI Web3 Growth Journey',
    template: '%s | AI Web3 Growth Journey',
  },
  description: 'AI Web3 Growth Journey',
  keywords: ['AI Web3 Growth Journey', 'AI Web3', 'Web3', 'development', 'startup'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  referrer: 'no-referrer',
  other: {
    'referrer': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
};

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  // Validate that the incoming locale is valid
  if (!locales.includes(lang)) {
    notFound();
  }
  
  // Enable static rendering
  setRequestLocale(lang);
  
  // Load translations
  let messages: Record<string, Record<string, string>>;
  try {
    messages = (await import(`../../messages/${lang}/index.json`)).default;
  } catch {
    notFound();
  }
  
  const translations = translationsMap[lang as keyof TranslationsMap];

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body>
        <NextIntlClientProvider 
          locale={lang} 
          messages={messages}
          timeZone="UTC"
          now={new Date()}
        >
          <I18nProvider
            locale={lang}
            locales={localeMappings}
            translations={translations}
          >
            <RootProvider>{children}</RootProvider>
          </I18nProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


