import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { type ApiProduct } from '@/app/lib/api';
import { products as staticProducts } from '@/app/lib/products';
import ProductPageClient from './ProductPageClient';

const SITE_URL = 'https://verde-wep.vercel.app';
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

async function fetchProduct(slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${BASE}/api/products/slug/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const product = (data.product || data.data) as ApiProduct;
    if (!product) throw new Error('no product in payload');
    if (product.slug === 'discover-box') {
      product.notes = [];
      product.topNotes = [];
      product.heartNotes = [];
      product.baseNotes = [];
    }
    return product;
  } catch {
    // Fallback to static data
    const s = staticProducts.find(p => p.slug === slug);
    if (!s) return null;
    return toApiProduct(s);
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
  const product = await fetchProduct(slug);
  if (!product) {
    return {
      title: 'المنتج غير موجود | VERDE',
      description: 'عذرًا، لم يتم العثور على هذا العطر في متجر VERDE.',
    };
  }

  const title = `عطر ${product.name} | VERDE Perfumes`;
  const description = product.description || `عطر ${product.name} الفاخر من VERDE PARFUMS. ${product.subtitle}`;
  const canonicalPath = `/products/${product.slug}`;
  const imageUrl = product.img.startsWith('http')
    ? product.img
    : `${SITE_URL}${encodeURI(product.img)}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `عطر ${product.name}`,
      'VERDE',
      'VERDE Perfumes',
      'VERDE عطور',
      'عطور فاخرة',
      'عطور مصر',
      product.family,
      ...(product.notes || []),
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: 'VERDE Perfumes',
      locale: 'ar_EG',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1000,
          alt: `عطر ${product.name} من VERDE`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const productImageUrl = product.img.startsWith('http')
    ? product.img
    : `${SITE_URL}${encodeURI(product.img)}`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: productImageUrl,
    description: product.description || product.longDescription || product.subtitle,
    sku: `VERDE-${product._id || product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'VERDE',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability: (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'العطور',
        item: `${SITE_URL}/#products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}
