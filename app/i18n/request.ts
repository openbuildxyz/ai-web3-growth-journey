import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '@/app/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locale || typeof locale !== 'string' || !locales.includes(locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`../../messages/${defaultLocale}/index.json`)).default
    };
  }

  try {
    return {
      locale,
      messages: (await import(`../../messages/${locale}/index.json`)).default
    };
  } catch {
    return {
      locale: defaultLocale,
      messages: (await import(`../../messages/${defaultLocale}/index.json`)).default
    };
  }
}); 