import type { NextPageContext } from 'next';

/**
 * Custom Pages-Router _error page.
 *
 * This file exists so that Next.js static-page generation for the
 * legacy /_error route does not conflict with the App Router layout.
 * Without it, the default _error page triggers:
 *   "<Html> should not be imported outside of pages/_document"
 * during prerendering of /404 and /500.
 */
function ErrorPage({ statusCode }: { statusCode: number | undefined }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'monospace',
        backgroundColor: '#0f0c0a',
        color: '#f5e6c8',
      }}
    >
      <h1 style={{ fontSize: '3rem', color: '#ffd966' }}>{statusCode ?? 'Error'}</h1>
      <p style={{ marginTop: '1rem' }}>
        {statusCode === 404
          ? 'This page could not be found.'
          : 'An unexpected error occurred.'}
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#ffd966',
          color: '#1b140f',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        Back to Home
      </a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
