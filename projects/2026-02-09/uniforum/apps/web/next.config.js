/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@uniforum/shared',
    '@uniforum/contracts',
    '@uniforum/forum',
  ],
  images: {
    domains: ['avatars.githubusercontent.com', 'api.dicebear.com'],
  },
  async headers() {
    return [
      {
        // CORS headers for ENS CCIP-Read
        source: '/api/ens/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
