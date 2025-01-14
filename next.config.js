/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rule34.xxx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wimg.rule34.xxx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.rule34.xxx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'us.rule34.xxx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.rule34.xxx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api-cdn.rule34.xxx',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'safebooru.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.rule34.xxx',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm|gif)$/i,
      type: 'asset/resource',
    });
    return config;
  },
  devIndicators: {
    buildActivity: false
  }
}

module.exports = nextConfig
