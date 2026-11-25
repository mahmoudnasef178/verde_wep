/**
 * fbpixel.ts
 * ─────────────────────────────────────────────────────────────────
 * Re-exports & wraps the unified metaPixel module to guarantee 100%
 * backwards compatibility and exact event deduplication.
 */

import {
  metaTrack,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  UserTrackingData,
} from './metaPixel';

export { metaTrack };

export function viewContent(product: {
  id: string;
  slug?: string;
  name: string;
  price: number;
  currency?: string;
}) {
  return trackViewContent(product);
}

export function addToCart(product: {
  id: string;
  slug?: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  return trackAddToCart(product);
}

export function initiateCheckout(payload: {
  items?: Array<{ id?: string; slug?: string; price?: number; quantity?: number }>;
  value: number;
  numItems: number;
  currency?: string;
  userData?: UserTrackingData;
}) {
  return trackInitiateCheckout({
    items: payload.items || [],
    value: payload.value,
    numItems: payload.numItems,
    currency: payload.currency,
    userData: payload.userData,
  });
}

export function purchase(payload: {
  orderId: string;
  items?: Array<{ id?: string; slug?: string }>;
  value: number;
  currency?: string;
  numItems: number;
  userData?: UserTrackingData;
}) {
  return trackPurchase({
    orderId: payload.orderId,
    items: payload.items || [],
    value: payload.value,
    currency: payload.currency,
    numItems: payload.numItems,
    userData: payload.userData,
  });
}
