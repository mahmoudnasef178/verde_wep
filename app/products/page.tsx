import type { Metadata } from 'next';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import ProductsSection from '../components/ProductsSection';
import Footer from '../components/Footer';
import { products } from '../lib/products';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '../lib/seo';

export const metadata: Metadata = {
  title: 'جميع العطور الفاخرة | Verde Perfumes',
  description:
    'تسوق تشكيلة عطور VERDE Perfumes الفاخرة — عطور نيش Extrait de Parfum بتركيبات حصرية وثبات استثنائي للرجال والنساء. توصيل سريع لجميع محافظات مصر.',
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: 'جميع العطور الفاخرة | VERDE Perfumes',
    description:
      'تشكيلة عطور Extrait de Parfum حصرية ونيش في مصر من VERDE Perfumes. توصيل لجميع المحافظات.',
    url: `${SITE_URL}/products`,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
};

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'جميع العطور الفاخرة — VERDE Perfumes',
  description:
    'تسوق تشكيلة عطور VERDE Perfumes الفاخرة — عطور نيش Extrait de Parfum بتركيبات حصرية في مصر.',
  url: `${SITE_URL}/products`,
  mainEntity: {
    '@type': 'ItemList',
    name: 'تشكيلة عطور VERDE',
    numberOfItems: products.length,
    itemListElement: products.map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: p.name,
      url: `${SITE_URL}/products/${p.slug}`,
      image: `${SITE_URL}${encodeURI(p.img)}`,
    })),
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
      item: `${SITE_URL}/products`,
    },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AnnouncementBar />
      <Navbar />
      <main id="main" style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <h1 className="sr-only">جميع العطور الفاخرة — {SITE_NAME}</h1>
        <ProductsSection />
      </main>
      <Footer />
    </>
  );
}
