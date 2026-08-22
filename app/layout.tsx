import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import CartDrawer from "./components/CartDrawer";

export const metadata: Metadata = {
  title: "VERDE | Luxury Fragrances",
  description: "Discover VERDE — where nature's finest essences meet modern artistry. Handcrafted luxury fragrances inspired by the lush and timeless world of green.",
  keywords: "verde, luxury perfume, niche fragrance, eau de parfum, premium scent",
  openGraph: {
    title: "VERDE | Luxury Fragrances",
    description: "Handcrafted luxury fragrances inspired by nature's finest essences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              {children}
              <CartDrawer />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
