/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  // Disable webpack stats to reduce build time
  webpack: (config) => {
    config.stats = 'minimal'
    return config
  }
}

module.exports = nextConfig
