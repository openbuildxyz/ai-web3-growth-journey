import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { GithubInfo } from 'fumadocs-ui/components/github-info';
import { getTranslations } from "next-intl/server";

export default async function Layout({ children, params }: { children: ReactNode, params: Promise<{ lang: string }> }) {
  const lang = (await params).lang;

  const t = await getTranslations();
  
  return (
    <DocsLayout 
      tree={source.pageTree[lang]}
      disableThemeSwitch
      i18n
      githubUrl="https://github.com/openbuildxyz/ai-web3-growth-journey"
    >
      {children}
    </DocsLayout>
  );
}
