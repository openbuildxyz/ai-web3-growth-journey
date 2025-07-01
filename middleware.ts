import createMiddleware from 'next-intl/middleware';
import { routing } from '@/app/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 更精确的matcher配置，确保所有路由都正确处理国际化
  matcher: ['/((?!api|_next|static|.*\\..*).*)']
};