import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale, pathnames } from '@/app/i18n';

export const routing = defineRouting({
  // 支持的所有语言列表
  locales,
  
  // 当没有匹配的语言时使用
  defaultLocale,
  
  // 始终使用语言前缀 (例如 /en/docs, /zh-cn/docs)
  localePrefix: 'always',
  
  // 将本地化的路径映射到内部路径
  pathnames
}); 