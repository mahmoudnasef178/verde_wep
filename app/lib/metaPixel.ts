/**
 * metaPixel.ts
 * ─────────────────────────────────────────────────────────────────
 * Unified Meta Tracking Helper: Browser Pixel + Conversions API (CAPI)
 * with automatic event_id deduplication.
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
    _fbq?: unknown;
    _initialPageViewFired?: boolean;
  }
}

/** Generate a single standard UUID (v4) per event for Meta deduplication */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Read cookie value by name */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export interface UserTrackingData {
  email?: string;
  phone?: string;
}

export interface MetaTrackOptions {
  eventId?: string;
  userData?: UserTrackingData;
}

/**
 * Universal Meta Track function:
 * 1. Generates or uses a single event_id
 * 2. Fires fbq('track', eventName, params, { eventID }) in browser
 * 3. Sends POST /api/meta/event to server for Conversions API deduplication
 */
export async function metaTrack(
  eventName: string,
  params: Record<string, unknown> = {},
  options: MetaTrackOptions = {}
): Promise<string> {
  const eventId = options.eventId || generateUUID();
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // 1. Browser Pixel with eventID option for 100% deduplication
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params, { eventID: eventId });
    } catch (err) {
      console.warn(`[Meta Pixel] Error firing ${eventName}:`, err);
    }
  }

  // 2. Server CAPI via Next.js proxy -> Backend (non-blocking)
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/meta/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_time: Math.floor(Date.now() / 1000),
          page_url: pageUrl,
          user_data: options.userData || {},
          custom_data: params,
          fbp,
          fbc,
        }),
      }).catch(() => {
        /* Fail silently — never disrupt user experience */
      });
    } catch {
      /* Ignore client network error */
    }
  }

  return eventId;
}

// ── Standard Events ──────────────────────────────────────────────────────────

/**
 * ViewContent — Fires when visiting a product page
 * content_ids is always an array containing the exact product slug (matching g:id in catalog feed).
 */
export function trackViewContent(product: {
  id: string;
  slug?: string;
  name: string;
  price: number;
  currency?: string;
}) {
  const slug = (product.slug || product.id || '').trim().toLowerCase();
  return metaTrack('ViewContent', {
    content_ids: [slug],
    content_name: product.name,
    content_type: 'product',
    value: Number(product.price) || 0,
    currency: product.currency || 'EGP',
  });
}

/**
 * AddToCart — Fires when adding an item to the shopping cart
 * content_ids is always an array containing the exact product slug (matching g:id in catalog feed).
 */
export function trackAddToCart(product: {
  id: string;
  slug?: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  const slug = (product.slug || product.id || '').trim().toLowerCase();
  const qty = Number(product.quantity) || 1;
  const price = Number(product.price) || 0;

  return metaTrack('AddToCart', {
    content_ids: [slug],
    content_name: product.name,
    content_type: 'product',
    value: price * qty,
    currency: product.currency || 'EGP',
    num_items: qty,
  });
}

/**
 * InitiateCheckout — Fires when beginning checkout
 * content_ids = all cart item slugs
 */
export function trackInitiateCheckout(payload: {
  items: Array<{ id?: string; slug?: string; price?: number; quantity?: number }>;
  value: number;
  numItems: number;
  currency?: string;
  userData?: UserTrackingData;
}) {
  const contentIds = payload.items
    .map(i => (i.slug || i.id || '').trim().toLowerCase())
    .filter(Boolean);

  return metaTrack(
    'InitiateCheckout',
    {
      content_ids: contentIds,
      content_type: 'product',
      value: Number(payload.value) || 0,
      currency: payload.currency || 'EGP',
      num_items: Number(payload.numItems) || 1,
    },
    { userData: payload.userData }
  );
}

/**
 * Purchase — Fires browser Pixel event upon order completion.
 *
 * IMPORTANT ARCHITECTURE RULE:
 * - Server CAPI receives the Purchase event directly from the backend order creation endpoint (order.controller.js -> capiPurchase).
 * - Therefore, this function ONLY fires the browser pixel with `eventID: orderId`.
 * - It does NOT send another Purchase event to /api/meta/event, ensuring exactly ONE server-side path to CAPI.
 * - Guarded by sessionStorage keyed by orderId so refreshing the page cannot fire Purchase twice.
 */
export function trackPurchase(payload: {
  orderId: string;
  items: Array<{ id?: string; slug?: string }>;
  value: number;
  numItems: number;
  currency?: string;
  userData?: UserTrackingData;
}) {
  const orderId = String(payload.orderId).trim();
  if (!orderId || orderId === 'unknown') return '';

  // Prevent duplicate firing on page reload / refresh
  if (typeof window !== 'undefined') {
    const guardKey = `verde_purchase_${orderId}`;
    try {
      if (sessionStorage.getItem(guardKey)) {
        console.log(`[Meta Pixel] Purchase for order ${orderId} already fired. Skipping duplicate.`);
        return orderId;
      }
      sessionStorage.setItem(guardKey, '1');
    } catch {
      // In case private mode blocks sessionStorage
    }
  }

  const contentIds = payload.items
    .map(i => (i.slug || i.id || '').trim().toLowerCase())
    .filter(Boolean);

  const params: Record<string, unknown> = {
    content_ids: contentIds,
    content_type: 'product',
    value: Number(payload.value) || 0,
    currency: payload.currency || 'EGP',
    num_items: Number(payload.numItems) || 1,
    order_id: orderId,
  };

  // Browser Pixel only — server sends to CAPI independently during order creation
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'Purchase', params, { eventID: orderId });
    } catch (err) {
      console.warn('[Meta Pixel] Error firing Purchase:', err);
    }
  }

  return orderId;
}
