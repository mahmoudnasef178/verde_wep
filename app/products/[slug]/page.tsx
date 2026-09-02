import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { type ApiProduct } from '@/app/lib/api';
import { products as staticProducts } from '@/app/lib/products';
import { SITE_URL, SITE_NAME, API_URL } from '@/app/lib/seo';
import ProductPageClient from './ProductPageClient';

// ── Helpers ───────────────────────────────────

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

function resolveImageUrl(img: string): string {
  if (!img) return `${SITE_URL}/products/Fortis%20Rex.png`;
  return img.startsWith('http') ? img : `${SITE_URL}${encodeURI(img)}`;
}

async function fetchProduct(slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`, {
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
    const s = staticProducts.find((p) => p.slug === slug);
    if (!s) return null;
    return toApiProduct(s);
  }
}

// ── generateStaticParams ──────────────────────

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    const prods = (data.products || data.data || []) as ApiProduct[];
    if (prods.length > 0) return prods.map((p) => ({ slug: p.slug }));
  } catch {
    // fall through
  }
  return staticProducts.map((p) => ({ slug: p.slug }));
}

// ── generateMetadata ──────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: 'المنتج غير موجود',
      description: 'عذرًا، لم يتم العثور على هذا العطر في متجر VERDE.',
      robots: { index: false, follow: false },
    };
  }

  const title = `عطر ${product.name} | ${SITE_NAME}`;
  // Use the Arabic description as the primary SEO description
  const description =
    product.description ||
    `عطر ${product.name} الفاخر من VERDE PARFUMS — ${product.subtitle}`;
  const canonicalPath = `/products/${product.slug}`;
  const imageUrl = resolveImageUrl(product.img);

  return {
    title,
    description,
    // Targeted keywords per product based on real data
    keywords: [
      product.name,
      `عطر ${product.name}`,
      'VERDE',
      'VERDE Perfumes',
      'VERDE عطور',
      'عطور فاخرة',
      'عطور مصر',
      product.family,
      ...(product.notes?.slice(0, 4) || []),
    ].filter(Boolean),
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
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

// ── Page Component ────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const imageUrl = resolveImageUrl(product.img);
  const productUrl = `${SITE_URL}/products/${product.slug}`;

  // Product JSON-LD (Schema.org)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    image: imageUrl,
    description:
      product.description || product.longDescription || product.subtitle,
    sku: `VERDE-${product._id || product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'VERDE',
      '@id': `${SITE_URL}/#organization`,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EGP',
      price: product.price,
      availability:
        (product.stock ?? 1) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'VERDE',
        '@id': `${SITE_URL}/#organization`,
      },
    },
  };

  // BreadcrumbList JSON-LD
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
        item: productUrl,
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
