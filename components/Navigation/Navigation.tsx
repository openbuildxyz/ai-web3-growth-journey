"use client";

import { Link } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Twitter } from 'lucide-react';
import type { ReactNode } from 'react';

type NavLink = {
  url: string;
  text: string;
  type?: 'icon';
  icon?: ReactNode;
};

export function Navigation() {
  const nav = useTranslations('Navigation');
  
  const links: NavLink[] = [
    { url: "/", text: nav('home') },
    { url: "/docs", text: nav('documentation') },
    { url: "/blog", text: nav('blog') },
    { url: "/page/about", text: nav('about') },
    { url: "/page/changelog", text: nav('changelog') },
    { url: "https://twitter.com/Official_R_deep", text: "Twitter", type: 'icon', icon: <Twitter /> }
  ];
  
  return (
    <nav className="flex items-center space-x-4">
      {links.map(link => (
        <Link 
          key={link.url} 
          href={link.url as Parameters<typeof Link>[0]["href"]}
          className="text-sm font-medium transition-colors"
        >
          {link.type === 'icon' ? link.icon : link.text}
        </Link>
      ))}
    </nav>
  );
} 