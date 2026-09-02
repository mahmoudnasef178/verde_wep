import type { Metadata, Viewport } from 'next';
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
    default: SITE_NAME_AR,
    template: `%s | ${SITE_NAME}`,
  },

  description:
    'VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر. اكتشف تشكيلة Extrait de Parfum الفاخرة المستوحاة من أرقى المكونات العطرية العالمية.',

  keywords: [
    'VERDE',
    'VERDE Perfumes',
    'VERDE عطور',
    'عطور VERDE',
    'VERDE Egypt',
    'براند عطور مصر',
    'عطور فاخرة',
    'عطور نيش مصر',
    'Extrait de Parfum',
    'Perfumes Egypt',
  ],

  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: '/',
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
    title: SITE_NAME_AR,
    description:
      'VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 800,
        alt: 'VERDE Luxury Fragrances - عطور VERDE الفاخرة',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME_AR,
    description:
      'VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.',
    images: [DEFAULT_OG_IMAGE],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

// ── JSON-LD Structured Data ───────────────────
const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization / Brand
    {
      '@type': ['Organization', 'Brand'],
      '@id': `${SITE_URL}/#organization`,
      name: 'VERDE',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 800,
      },
      description:
        'VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+201112333598',
        areaServed: 'EG',
        availableLanguage: ['Arabic', 'English'],
      },
      sameAs: [
        SOCIAL_LINKS.instagram,
        SOCIAL_LINKS.facebook,
        SOCIAL_LINKS.tiktok,
      ],
    },
    // WebSite
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME_AR,
      description:
        'VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.',
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: ['ar-EG', 'en-US'],
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
    <html lang="ar" dir="rtl">
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
