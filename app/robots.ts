import type { MetadataRoute } from 'next';
import { SITE_URL } from './lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all crawlers full access to public content
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes
          '/checkout',       // Checkout flow — not useful in search
          '/order-success',  // Post-purchase page
          '/cart',           // Cart is session-specific
          '/login',          // Auth pages
          '/signup',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
