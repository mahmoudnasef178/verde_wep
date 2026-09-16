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
    // Content Security Policy (CSP) tailored for Next.js on Vercel
    const cspHeader = [
      "default-src 'self'",
      // 'unsafe-inline' is required for Next.js client hydration scripts in static export / pre-rendering
      // 'unsafe-eval' allows dynamic evaluation during development / Fast Refresh
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      // 'unsafe-inline' is required for CSS-in-JS / font variables injected by Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Allow self, local data/blob, and remote image backend on Railway
      "img-src 'self' blob: data: https://gradutionapi-production.up.railway.app",
      // Fonts from self (next/font) and Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com data:",
      // Connect to our Next.js endpoints, Railway API backend, and Vercel Analytics/Vitals
      "connect-src 'self' https://gradutionapi-production.up.railway.app https://vitals.vercel-insights.com",
      // Completely prevent framing / clickjacking (supercedes X-Frame-Options)
      "frame-ancestors 'none'",
      // Prevent embedding any external iframes
      "frame-src 'none'",
      // Block old plugins like Flash, Silverlight, Java
      "object-src 'none'",
      // Prevent <base href> injection attacks
      "base-uri 'self'",
      // Restrict form submissions to current origin
      "form-action 'self'",
      // Automatically upgrade HTTP requests to HTTPS
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          { key: 'Content-Security-Policy', value: cspHeader },
          // Restrict browser features & APIs for privacy & security
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
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
