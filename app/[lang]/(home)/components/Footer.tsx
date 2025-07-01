'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useTranslations } from 'next-intl';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('Footer');
  
  const links = [
    {
      title: t('links.handbook'),
      items: [
        { text: t('links.gettingStarted'), href: "/docs/introduction" },
        { text: t('links.planningPhase'), href: "/docs/planning" },
        { text: t('links.buildingPhase'), href: "/docs/building" },
        { text: t('links.validationPhase'), href: "/docs/validation" },
        { text: t('links.launchingPhase'), href: "/docs/launching" },
      ]
    },
    {
      title: t('links.resources'),
      items: [
        { text: t('links.caseStudies'), href: "/docs/case-studies" },
        { text: t('links.practicalTutorials'), href: "/docs/case-studies/practical-tutorials" },
        { text: t('links.resourceLibrary'), href: "/docs/resources" },
        { text: t('links.contributionGuide'), href: "/docs/contribute" },
      ]
    },
    {
      title: t('links.community'),
      items: [
        { text: t('links.github'), href: "https://github.com/openbuildxyz" },
        { text: t('links.officialWebsite'), href: "https://openbuildxyz.com" },
        { text: t('links.wechatAccount'), href: "#" },
        { text: t('links.socialGroup'), href: "#" },
      ]
    },
  ];

  return (
    <footer className="w-full py-12 bg-gray-50 dark:bg-gray-950">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="text-gray-600 dark:text-gray-400 text-center md:text-left">
              {t('description', { year: currentYear })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Link 
              href="https://openbuild.xyz" 
              target="_blank"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              OpenBuild
            </Link>
            <Link 
              href="https://hackathonweekly.com/" 
              target="_blank" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              周周黑客松
            </Link>
            <Link 
              href="mailto:ian@openbuild.xyz" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {t('contact')}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
} 