import type { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
  title: 'My Favorites | VERDE PARFUMS',
  description: 'Your saved luxury fragrances. Review and add your favorite scents directly to your cart.',
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
