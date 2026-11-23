export interface Product {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number | null;
  price10ml?: number | null;
  originalPrice10ml?: number | null;
  img: string;
  imgs: string[];
  pyramidImg?: string;
  tag?: string;
  notes: string[];
  family: string;
  intensity: string;
  description: string;
  longDescription: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  volume: string;
  occasion: string[];
  season: string[];
}

const TEN_ML_PRICES: Record<string, number> = {
  'fortis-rex': 150,
  'blanc-pur': 125,
  'sultan-dore': 150,
  'velor': 150,
  'mangue-epicee': 150,
  'cavaro': 175,
  'rexon': 175,
  'solver': 175,
  'marin-bleu': 175,
  'marin-blue': 175,
  'incenso': 188,
  'frost-line': 225,
};

export function get10mlPrice(fullPrice: number, slug?: string): number {
  if (slug && TEN_ML_PRICES[slug]) {
    return TEN_ML_PRICES[slug];
  }
  const p = Number(fullPrice);
  if (p === 550) return 150;
  if (p === 650) return 175;
  const rawQuarter = Math.round(p / 4);
  if (rawQuarter === 137 || rawQuarter === 138) return 150;
  if (rawQuarter === 162 || rawQuarter === 163) return 175;
  return rawQuarter;
}

/**
 * Sale pricing helpers:
 * - 50 ML & Discover Boxes:
 *   - Fake original price: basePrice + 200 (e.g. 650 + 200 = 850) -> crossed out
 *   - Sale / Effective selling price: basePrice - 100 (e.g. 650 - 100 = 550) -> actual charge
 * - 10 ML:
 *   - Fake original price: base10ml + 50 (e.g. 175 + 50 = 225, or 150 + 50 = 200) -> crossed out
 *   - Sale / Effective selling price: base10ml - 25 (e.g. 175 - 25 = 150, or 150 - 25 = 125) -> actual charge
 */
export function getFakeOriginalPrice(basePrice: number): number {
  return Number(basePrice) + 200;
}

export function getSalePrice(basePrice: number): number {
  return Math.max(0, Number(basePrice) - 100);
}

export function getFakeOriginal10mlPrice(base10mlPrice: number): number {
  return Number(base10mlPrice) + 50;
}

export function getSale10mlPrice(base10mlPrice: number): number {
  return Math.max(0, Number(base10mlPrice) - 25);
}

export function getProduct50mlSalePrice(product: { price: number; originalPrice?: number | null }): number {
  if (product.originalPrice != null && Number(product.originalPrice) > 0) {
    return Number(product.price);
  }
  return getSalePrice(product.price);
}

export function getProduct50mlOriginalPrice(product: { price: number; originalPrice?: number | null }): number {
  if (product.originalPrice != null && Number(product.originalPrice) > 0) {
    return Number(product.originalPrice);
  }
  return getFakeOriginalPrice(product.price);
}

export function getProduct10mlSalePrice(product: { price: number; slug?: string; price10ml?: number | null }): number {
  if (product.price10ml != null && Number(product.price10ml) > 0) {
    return Number(product.price10ml);
  }
  return getSale10mlPrice(get10mlPrice(product.price, product.slug));
}

export function getProduct10mlOriginalPrice(product: { price: number; slug?: string; price10ml?: number | null; originalPrice10ml?: number | null }): number {
  if (product.originalPrice10ml != null && Number(product.originalPrice10ml) > 0) {
    return Number(product.originalPrice10ml);
  }
  const base10ml = product.price10ml != null && Number(product.price10ml) > 0
    ? Number(product.price10ml)
    : get10mlPrice(product.price, product.slug);
  return getFakeOriginal10mlPrice(base10ml);
}

import { products } from './productsData';
export { products };



export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getRelatedProducts(id: number): Product[] {
  return products.filter(p => p.id !== id).slice(0, 3);
}
