import type { MetadataRoute } from 'next';
import { products } from './lib/products';

const BASE_URL = 'https://verde-wep.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gradutionapi-production.up.railway.app';

interface ApiProductSlug {
  slug: string;
  updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const prods = (data.products || data.data || []) as ApiProductSlug[];
      if (Array.isArray(prods) && prods.length > 0) {
        productRoutes = prods.map((p) => ({
          url: `${BASE_URL}/products/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch {
    // API failed or unreachable during build: use static fallback
  }

  // Fallback to static products if API did not return items
  if (productRoutes.length === 0) {
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  return [...staticRoutes, ...productRoutes];
}
