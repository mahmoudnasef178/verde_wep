import type { Metadata } from 'next';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = {
  title: 'Shopping Cart | VERDE PARFUMS',
  description: 'Review your selected luxury fragrances, apply promo codes, and proceed to checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
