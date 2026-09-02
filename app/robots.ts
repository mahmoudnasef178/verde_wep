import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/checkout',
          '/order-success',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/cart',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://verde-wep.vercel.app/sitemap.xml',
  };
}
