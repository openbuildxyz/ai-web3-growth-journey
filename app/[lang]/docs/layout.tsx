'use client';

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { useBaseOptions } from '../layout.config';
import { GithubInfo } from 'fumadocs-ui/components/github-info';
import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';

export default function Layout({ children }: { children: ReactNode }) {
  const baseOptions = useBaseOptions();
  
  const docsOptions: DocsLayoutProps = {
    ...baseOptions,
    tree: source.pageTree,
    links: [
      {
        type: 'custom',
        children: (
          <GithubInfo owner="fuma-nama" repo="fumadocs" className="lg:-mx-2" />
        ),
      },
    ],
  };
  
  return (
    <DocsLayout {...docsOptions}>
      {children}
    </DocsLayout>
  );
}