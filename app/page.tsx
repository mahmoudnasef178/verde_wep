import type { Metadata } from 'next';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductsSection from './components/ProductsSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import { products } from './lib/products';
import { SITE_URL, SITE_NAME } from './lib/seo';

// ── Home page specific metadata ───────────────
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  // Home page inherits global metadata from layout.tsx
  // but we ensure canonical is explicitly set here.
};

// ── FAQ Schema (real data from translations) ──
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long do Verde fragrances last?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our fragrances are formulated to last 6-8 hours on skin and longer on fabric. For best results, apply to pulse points such as wrists, neck, and behind the ears.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your shipping policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Orders are processed within 1-2 business days and delivered within 3-5 business days across Egypt. You will receive a tracking link via WhatsApp once your order is shipped.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you accept returns or exchanges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Due to the nature of our products, we do not accept returns or exchanges unless the product is defective or damaged. Please contact us within 5 days with photos.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I contact Verde?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The fastest way to reach us is via Instagram DM @verde_perfumes or WhatsApp. Our team responds within 24 hours on business days.',
      },
    },
  ],
};

// ── ItemList Schema for products ──────────────
const productListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VERDE Luxury Fragrances Collection',
  description: 'VERDE براند عطور فاخرة — تشكيلة عطور Extrait de Parfum الفاخرة',
  url: SITE_URL,
  numberOfItems: products.length,
  itemListElement: products.map((p, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: p.name,
    url: `${SITE_URL}/products/${p.slug}`,
    image: `${SITE_URL}${encodeURI(p.img)}`,
  })),
};

export default function Home() {
  return (
    <>
      {/* FAQ + Product List structured data for the home page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />
      <AnnouncementBar />
      <Navbar />
      <main id="main">
        {/* Visually hidden H1 — clearly identifies brand + category for search engines */}
        <h1 className="sr-only">
          VERDE | براند عطور فاخرة في مصر — {SITE_NAME}
        </h1>
        <HeroSection />
        <ProductsSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
