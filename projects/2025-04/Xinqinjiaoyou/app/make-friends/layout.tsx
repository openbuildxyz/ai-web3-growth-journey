import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import type { Metadata } from 'next';
import { GithubInfo } from 'fumadocs-ui/components/github-info';
import type { DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
export const metadata: Metadata = {
  title: 'AI³ Growth Journey 文档',
  description: 'AI³ Growth Journey 使用指南和开发文档',
};

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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
    {children}
    </DocsLayout>
  );
}
