/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/cdn/:path*", // proxy route
        destination: "https://cdn.techkareer.com/:path*", // target
      },
    ];
  },
}

export default nextConfig
