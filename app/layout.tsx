import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { LanguageProvider } from "./context/LanguageContext";
import CartDrawer from "./components/CartDrawer";

const SITE_URL = "https://verde-wep.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VERDE | عطور فاخرة",
    template: "%s | VERDE",
  },
  description: "VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر. اكتشف تشكيلة العطور الفاخرة المستوحاة من أرقى المكونات والزيوت العطرية العالمية.",
  keywords: [
    "VERDE",
    "VERDE Perfumes",
    "VERDE عطور",
    "عطور VERDE",
    "براند عطور",
    "عطور فاخرة",
    "عطور في مصر",
    "Perfumes Egypt",
    "عطور نيش",
    "Extrait de Parfum",
  ],
  authors: [{ name: "VERDE" }],
  creator: "VERDE",
  publisher: "VERDE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "JRweTA70ugg5goMiSM2Lof6dD6oitQkFTa3SRF8Wgvw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "VERDE | عطور فاخرة",
    description: "VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.",
    url: SITE_URL,
    siteName: "VERDE Perfumes",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
    type: "website",
    images: [
      {
        url: "/products/Fortis Rex.png",
        width: 1200,
        height: 800,
        alt: "VERDE Luxury Fragrances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VERDE | عطور فاخرة",
    description: "VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.",
    images: ["/products/Fortis Rex.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "VERDE",
      url: SITE_URL,
      logo: `${SITE_URL}/products/Fortis%20Rex.png`,
      description: "VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "EG",
        availableLanguage: ["Arabic", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "VERDE | عطور فاخرة",
      description: "VERDE براند عطور فاخرة يقدم عطورًا مميزة للرجال والنساء في مصر.",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: ["ar-EG", "en-US"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="ar">
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
