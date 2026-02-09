import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  env: {
    BACKEND_DOMAIN: process.env.BACKEND_DOMAIN,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
}

export default nextConfig
