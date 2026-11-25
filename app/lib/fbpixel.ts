/**
 * fbpixel.ts
 * ─────────────────────────────────────────────────────────────────
 * Re-exports & wraps metaPixel.ts so all imports share trackMeta & toContentId.
 */

import {
  trackMeta,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  ensureFbc,
  initAdvancedMatching,
  type UserTrackingData,
} from './metaPixel';
import type { MetaTrackProduct } from '@/lib/meta';

export { trackMeta, ensureFbc, initAdvancedMatching };

export function viewContent(product: {
  id?: string;
  slug?: string;
  name: string;
  size?: string;
  price: number;
  currency?: string;
}) {
  return trackViewContent(product);
}

export function addToCart(product: {
  id?: string;
  slug?: string;
  name: string;
  size?: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  return trackAddToCart(product);
}

export function initiateCheckout(payload: {
  items?: MetaTrackProduct[];
  value: number;
  currency?: string;
  userData?: UserTrackingData;
}) {
  return trackInitiateCheckout({
    items: payload.items || [],
    value: payload.value,
    currency: payload.currency,
    userData: payload.userData,
  });
}

export function purchase(payload: {
  orderId: string;
  items?: MetaTrackProduct[];
  value: number;
  currency?: string;
  userData?: UserTrackingData;
}) {
  return trackPurchase({
    orderId: payload.orderId,
    items: payload.items || [],
    value: payload.value,
    currency: payload.currency,
    userData: payload.userData,
  });
}
