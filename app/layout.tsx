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
  preload: false,
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
  preload: false,
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
    // Home page: "VERDE Perfumes | عطور فاخرة مصر"
    default: SITE_NAME_AR,
    // Product pages: "Fortis Rex | VERDE Perfumes"
    template: `%s | ${SITE_NAME}`,
  },

  description:
    'VERDE Perfumes — متجر عطور فاخرة ونيش في مصر. تشكيلة Extrait de Parfum بتركيبات حصرية للرجال والنساء. توصيل سريع لجميع محافظات مصر من verdepefumes.com',

  keywords: [
    // Primary brand name searches
    'VERDE Perfumes',
    'VERDE',
    'verde perfumes egypt',
    'verdepefumes',
    'verde parfums',
    // Arabic brand searches
    'VERDE عطور',
    'عطور VERDE',
    'فيردي عطور',
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
    title: 'VERDE Perfumes | عطور فاخرة مصر',
    description:
      'VERDE Perfumes — عطور Extrait de Parfum فاخرة بتركيبات حصرية للرجال والنساء. توصيل لجميع محافظات مصر.',
    url: SITE_URL,
    siteName: 'VERDE Perfumes',
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1086,
        height: 1448,
        alt: 'VERDE Perfumes — عطور فاخرة مصر',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'VERDE Perfumes | عطور فاخرة مصر',
    description:
      'VERDE Perfumes — عطور Extrait de Parfum فاخرة بتركيبات حصرية للرجال والنساء في مصر.',
    images: [DEFAULT_OG_IMAGE],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
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
      alternateName: ['VERDE', 'VERDE PARFUMS', 'فيردي عطور', 'عطور فيردي'],
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
        width: 1086,
        height: 1448,
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
