import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js to optimize images from the API server
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gradutionapi-production.up.railway.app',
        pathname: '/**',
      },
    ],
    // Generate modern formats for better performance (WebP / AVIF)
    formats: ['image/avif', 'image/webp'],
    // Reasonable device size breakpoints
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Keep image quality high but not wastefully so
    qualities: [75, 85],
    // Minimise layout shifts — no unsize tracking
    minimumCacheTTL: 60,
  },

  // Compress responses
  compress: true,

  // Production Source Maps off to reduce bundle size
  productionBrowserSourceMaps: false,

  // Strict mode helps catch SEO / accessibility regressions early
  reactStrictMode: true,

  // Headers for SEO & security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing (security + SEO)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // HTTPS enforcement
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Referrer policy for analytics accuracy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Long-term caching for product images
        source: '/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
