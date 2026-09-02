import type { MetadataRoute } from 'next';
import { products } from './lib/products';
import { SITE_URL, API_URL } from './lib/seo';

interface ApiProductSlug {
  slug: string;
  updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productRoutes: MetadataRoute.Sitemap = [];

  // Try to get live product slugs from the API (with updatedAt dates for freshness)
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const prods = (data.products || data.data || []) as ApiProductSlug[];
      if (Array.isArray(prods) && prods.length > 0) {
        // Only include slugs that are also in our static list (safety check)
        const validSlugs = new Set(products.map((p) => p.slug));
        productRoutes = prods
          .filter((p) => validSlugs.has(p.slug))
          .map((p) => ({
            url: `${SITE_URL}/products/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }));
      }
    }
  } catch {
    // API unreachable at build time — fall through to static fallback
  }

  // Fallback: build from static product list
  if (productRoutes.length === 0) {
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];

  return [...staticRoutes, ...productRoutes];
}
