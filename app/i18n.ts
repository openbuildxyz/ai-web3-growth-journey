import { i18n } from '@/lib/i18n';

// Export the locales and defaultLocale for use in other components
export const locales = i18n.languages;
export const defaultLocale = i18n.defaultLanguage;

export type Locale = (typeof locales)[number];

// Simple path configuration
export const pathnames = {
  '/': '/',
  '/docs': '/docs',
};

export const localePrefix = 'always'; // Default
