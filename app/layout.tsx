import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  Montserrat,
  Inter,
  Cairo,
} from 'next/font/google';
import {
  SITE_URL,
  SITE_NAME,
  SITE_NAME_AR,
  DEFAULT_OG_IMAGE,
  GOOGLE_VERIFICATION,
  SOCIAL_LINKS,
} from './lib/seo';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LanguageProvider } from './context/LanguageContext';
import CartDrawer from './components/CartDrawer';

// ── next/font: optimized font weights and swap display ──
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal'],
  variable: '--font-cormorant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

// ── Viewport ─────────────────────────────────
export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ── Global Metadata ───────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    // Home page: "Verde Perfumes"
    default: SITE_NAME,
    // Product pages: "Fortis Rex | Verde Perfumes"
    template: `%s | ${SITE_NAME}`,
  },

  description:
    'VERDE Perfumes — متجر عطور فاخرة ونيش في مصر. تشكيلة Extrait de Parfum بتركيبات حصرية للرجال والنساء. توصيل سريع لجميع محافظات مصر من verdepefumes.com',

  keywords: [
    // Primary brand name searches and common typos/variations
    'VERDE Perfumes',
    'VERDE Perfume',
    'VERDE',
    'Verde Parfums',
    'Verde Parfum',
    'verde perfumes egypt',
    'verdepefumes',
    'verde pefumes',
    'verd perfumes',
    'verde parfume',
    'verdi perfumes',
    'virdy perfumes',
    'verdeegypt',
    // Arabic brand searches & variations
    'فيردي',
    'فيردى',
    'عطور فيردي',
    'فيردي عطور',
    'عطر فيردي',
    'براند فيردي',
    'متجر فيردي',
    'VERDE عطور',
    'عطور VERDE',
    'براند عطور مصر',
    'عطور فاخرة مصر',
    // Category searches
    'عطور نيش مصر',
    'Extrait de Parfum مصر',
    'Perfumes Egypt',
    'متجر عطور اونلاين مصر',
    'عطور فاخرة',
  ],

  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Canonical always points to the new domain
  alternates: {
    canonical: SITE_URL,
  },

  verification: {
    google: GOOGLE_VERIFICATION,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    title: SITE_NAME,
    description:
      'VERDE Perfumes — عطور Extrait de Parfum فاخرة بتركيبات حصرية للرجال والنساء. توصيل لجميع محافظات مصر.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1086,
        height: 1448,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description:
      'VERDE Perfumes — عطور Extrait de Parfum فاخرة بتركيبات حصرية للرجال والنساء في مصر.',
    images: [DEFAULT_OG_IMAGE],
  },

  // Icons are auto-detected by Next.js App Router from files placed directly
  // in the app/ directory: favicon.ico, icon.png, apple-icon.png
  // No manual icons config needed — that would override the app/ files.
};

// ── JSON-LD Structured Data ───────────────────
const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization — tells Google exactly who VERDE Perfumes is
    {
      '@type': ['Organization', 'Brand', 'Store'],
      '@id': `${SITE_URL}/#organization`,
      name: 'VERDE Perfumes',
      alternateName: [
        'VERDE',
        'VERDE PARFUMS',
        'Verde Perfume',
        'Verde Parfum',
        'Verde Pefumes',
        'Verde Egypt',
        'فيردي',
        'فيردى',
        'عطور فيردي',
        'فيردي عطور',
        'براند فيردي',
        'متجر فيردي للعطور',
      ],
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      description:
        'VERDE Perfumes هي علامة تجارية مصرية متخصصة في عطور Extrait de Parfum الفاخرة وعطور النيش، مع توصيل لجميع محافظات مصر.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+201112333598',
        areaServed: 'EG',
        availableLanguage: ['Arabic', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'EG',
        addressRegion: 'Cairo',
      },
      sameAs: [
        SOCIAL_LINKS.instagram,
        SOCIAL_LINKS.facebook,
        SOCIAL_LINKS.tiktok,
        SOCIAL_LINKS.whatsapp,
      ],
    },
    // WebSite with SearchAction — enables Google Sitelinks Searchbox
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'VERDE Perfumes',
      description:
        'VERDE Perfumes — عطور فاخرة ونيش في مصر. Extrait de Parfum حصري.',
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: ['ar-EG', 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // SiteNavigationElement — Guides Google for generating Sitelinks
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#navigation`,
      name: 'Main Navigation Menu',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'جميع العطور',
          description: 'تشكيلة عطور VERDE الفاخرة Extrait de Parfum',
          url: `${SITE_URL}/products`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'Fortis Rex',
          description: 'العطر الأكثر مبيعاً والأعلى فخامة من فيردي',
          url: `${SITE_URL}/products/fortis-rex`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 3,
          name: 'Sultan Doré',
          description: 'عطر نيش عنبري ودافئ للجنسين',
          url: `${SITE_URL}/products/sultan-dore`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 4,
          name: 'Marin Bleu',
          description: 'عطر أروماتك منعش وبحري',
          url: `${SITE_URL}/products/marin-bleu`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 5,
          name: 'Frost Line',
          description: 'عطر بارد ومنعش للحضور المميز',
          url: `${SITE_URL}/products/frost-line`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 6,
          name: 'Blanc Pur',
          description: 'عطر نقي وأنيق للاستخدام اليومي الراقي',
          url: `${SITE_URL}/products/blanc-pur`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 7,
          name: 'Discover Box',
          description: 'مجموعة استكشاف عينات عطور فيردي الكاملة',
          url: `${SITE_URL}/products/discover-box`,
        },
        {
          '@type': 'SiteNavigationElement',
          position: 8,
          name: 'سلة المشتريات',
          description: 'عرض سلة التسوق وإتمام الطلب أونلاين',
          url: `${SITE_URL}/cart`,
        },
      ],
    },
  ],
};

// ── Root Layout ───────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default lang/dir are set here; LanguageContext updates them client-side.
    <html
      lang="ar"
      dir="rtl"
      className={`${cormorant.variable} ${montserrat.variable} ${inter.variable} ${cairo.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <FavoritesProvider>
                {children}
                <CartDrawer />
              </FavoritesProvider>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
