import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');


/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mmbiz.qpic.cn',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 添加headers配置来解决微信图片防盗链问题
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), './projects/**'];
    
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/projects/**'],
    };

    return config;
  },
};

export default withNextIntl(withMDX(config));
