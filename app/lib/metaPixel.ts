/**
 * metaPixel.ts
 * ─────────────────────────────────────────────────────────────────
 * TypeScript wrapper around @/lib/meta so all product events use the
 * exact same trackMeta / toContentId / ensureFbc / initAdvancedMatching logic.
 */

import {
  trackMeta,
  trackPurchaseBrowser,
  ensureFbc,
  initAdvancedMatching,
  type MetaUserData,
  type MetaTrackProduct,
} from '@/lib/meta';

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
    _fbq?: unknown;
  }
}

export { trackMeta, ensureFbc, initAdvancedMatching };
export type UserTrackingData = MetaUserData;

/** ViewContent — fires with exact variant ID (50ml vs 10ml) */
export function trackViewContent(product: {
  id?: string;
  slug?: string;
  name: string;
  size?: string;
  price: number;
  currency?: string;
}) {
  return trackMeta('ViewContent', {
    products: [
      {
        id: product.id,
        slug: product.slug,
        size: product.size || '50 ML',
        quantity: 1,
        price: Number(product.price) || 0,
      },
    ],
    value: Number(product.price) || 0,
    currency: product.currency || 'EGP',
    extra: {
      content_name: product.name,
    },
  });
}

/** AddToCart — fires with exact variant ID (50ml vs 10ml) */
export function trackAddToCart(product: {
  id?: string;
  slug?: string;
  name: string;
  size?: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  const qty = Number(product.quantity) || 1;
  const price = Number(product.price) || 0;

  return trackMeta('AddToCart', {
    products: [
      {
        id: product.id,
        slug: product.slug,
        size: product.size || '50 ML',
        quantity: qty,
        price,
      },
    ],
    value: price * qty,
    currency: product.currency || 'EGP',
    extra: {
      content_name: product.name,
    },
  });
}

/** InitiateCheckout — fires with all cart variant IDs, contents[], and value */
export function trackInitiateCheckout(payload: {
  items: MetaTrackProduct[];
  value: number;
  currency?: string;
  userData?: MetaUserData;
}) {
  return trackMeta('InitiateCheckout', {
    products: payload.items,
    value: Number(payload.value) || 0,
    currency: payload.currency || 'EGP',
    user: payload.userData || {},
  });
}

/** Purchase — Browser Pixel only on /order-success (server owns Purchase CAPI) */
export function trackPurchase(payload: {
  orderId: string;
  items: MetaTrackProduct[];
  value: number;
  currency?: string;
  userData?: MetaUserData;
}) {
  return trackPurchaseBrowser({
    orderId: payload.orderId,
    products: payload.items,
    value: Number(payload.value) || 0,
    currency: payload.currency || 'EGP',
    user: payload.userData || {},
  });
}
