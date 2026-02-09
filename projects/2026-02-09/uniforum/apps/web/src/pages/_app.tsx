import type { AppProps } from 'next/app';

/**
 * Custom _app for the Pages-Router layer.
 *
 * Provides a clean wrapper so the Pages Router error pages
 * don't accidentally pull in App Router providers (Privy, Wagmi, etc.)
 * during static page generation.
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
