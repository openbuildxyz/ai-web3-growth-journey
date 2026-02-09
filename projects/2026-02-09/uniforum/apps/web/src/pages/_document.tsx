import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom _document for the Pages-Router layer.
 *
 * Providing an explicit _document prevents the Next.js auto-generated
 * default from conflicting with the App Router layout during static
 * page generation of /_error pages.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
