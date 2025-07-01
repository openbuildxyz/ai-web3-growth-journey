"use client"

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Sponsors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  // 使用固定的高度值
  const sponsors = [
    {
      name: '0G',
      logo: '/logos/0g.svg',
      logoDark: '/logos/0g-dark.svg',
      url: 'https://0g.ai',
      height: 40
    },
    {
      name: 'Kite AI',
      logo: '/logos/KiteAI.svg',
      logoDark: '/logos/KiteAI-dark.svg',
      url: 'https://gokite.ai',
      height: 50
    },
    {
      name: 'Camp Network',
      logo: '/logos/camp.svg',
      logoDark: '/logos/camp-dark.svg',
      url: 'https://www.campnetwork.xyz',
      height: 30,
    },
    {
      name: 'Delysium',
      logo: '/logos/delysium.svg',
      logoDark: '/logos/delysium-dark.svg',
      url: 'https://www.delysium.com',
      height: 40,
    },
    {
      name: 'Supra',
      logo: '/logos/supra.svg',
      logoDark: '/logos/supra-dark.svg',
      url: 'https://supra.com',
      height: 30,
    },
  ];

  // 避免主题闪烁，等待挂载完成
  if (!mounted) {
    return (
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">赞助商</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            感谢以下合作伙伴对AI³ Growth Journey的大力支持
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex items-center justify-center"
            >
              <div className="bg-gray-100 dark:bg-gray-800 animate-pulse" 
                style={{ height: `${sponsor.height}px`, width: '140px' }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">赞助商</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          感谢以下合作伙伴对AI³ Growth Journey的大力支持
        </p>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">赞助合作请联系: <a href="mailto:ian@openbuild.xyz"
                                className="text-indigo-600 dark:text-indigo-400 underline">ian@openbuild.xyz</a></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
        {sponsors.map((sponsor) => (
          <Link
            href={sponsor.url}
            key={sponsor.name}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105 flex items-center justify-center"
          >
            {/* 使用直接的HTML img标签和内联样式，确保高度正确设置 */}
            <img
              src={isDarkMode && sponsor.logoDark ? sponsor.logoDark : sponsor.logo}
              alt={`${sponsor.name} logo`}
              className="md:scale-[1.5]"
              style={{
                height: `${sponsor.height}px`,
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
