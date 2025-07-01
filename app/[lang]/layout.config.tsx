'use client';

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslations } from 'next-intl';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function useBaseOptions(): BaseLayoutProps {
  const t = useTranslations('Navigation');
  
  return {
    githubUrl: 'https://github.com/openbuildxyz/ai-web3-growth-journey',
    nav: {
      title: (
        <>
          <Image 
            src="/icon.svg" 
            width={24} 
            height={24} 
            alt="Logo" 
          />
          AI³ Growth Journey
        </>
      ),
      children: <LanguageSwitcher />,
    },
    links: [
      {
        text: t('aiWeb3Guide'),
        url: '/docs',
        active: 'nested-url',
      },
    ],
  };
}
