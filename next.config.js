/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      }
    ],
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

// Add GitHub Pages config only when building for production
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export'
  nextConfig.basePath = '/local-ai-chatbot-studio'
  nextConfig.assetPrefix = '/local-ai-chatbot-studio/'
  nextConfig.trailingSlash = true
}

module.exports = nextConfig
