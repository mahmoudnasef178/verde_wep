import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { type ApiProduct } from '@/app/lib/api';
import { products as staticProducts } from '@/app/lib/products';
import ProductPageClient from './ProductPageClient';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gradutionapi-production.up.railway.app';

// Map static product to ApiProduct shape
function toApiProduct(p: (typeof staticProducts)[0]): ApiProduct {
  return {
    ...p,
    _id: String(p.id),
    rating: 0,
    numReviews: 0,
    stock: 99,
    reviews: [],
  };
}

async function fetchProductAndRelated(slug: string): Promise<{ product: ApiProduct | null; related: ApiProduct[] }> {
  try {
    const res = await fetch(`${BASE}/api/products/slug/${slug}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const product = (data.product || data.data) as ApiProduct;
    const related = (data.related || []) as ApiProduct[];

    if (!product) throw new Error('no product in payload');

    // If related is empty, fetch general products as fallback
    if (!related.length) {
      const relRes = await fetch(`${BASE}/api/products`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) });
      if (relRes.ok) {
        const relData = await relRes.json();
        const allProds = (relData.products || relData.data || []) as ApiProduct[];
        return {
          product,
          related: allProds.filter(p => p._id !== product._id).slice(0, 3),
        };
      }
    }

    return { product, related };
  } catch {
    // Fallback to static data
    const s = staticProducts.find(p => p.slug === slug);
    if (!s) return { product: null, related: [] };
    const product = toApiProduct(s);
    const related = staticProducts
      .filter(p => p.slug !== slug)
      .slice(0, 3)
      .map(toApiProduct);
    return { product, related };
  }
}

// Generate all static paths
export async function generateStaticParams() {
  try {
    const res = await fetch(`${BASE}/api/products`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    const prods = (data.products || data.data || []) as ApiProduct[];
    return prods.map(p => ({ slug: p.slug }));
  } catch {
    return staticProducts.map(p => ({ slug: p.slug }));
  }
}

// Dynamic metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await fetchProductAndRelated(slug);
  if (!product) return { title: 'Product Not Found | VERDE' };
  return {
    title: `${product.name} | VERDE PARFUMS`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { product, related } = await fetchProductAndRelated(slug);
  if (!product) notFound();

  return <ProductPageClient product={product} related={related} />;
}
