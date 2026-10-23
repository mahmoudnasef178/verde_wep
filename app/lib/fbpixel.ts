// ── Meta Pixel Helper ─────────────────────────────────────────────────────
// Centralised utility for firing Facebook / Meta Pixel events.
// Pixel base code is loaded in app/layout.tsx via next/script.

declare global {
  interface Window {
    fbq: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string }
    ) => void;
  }
}

/** Generate a unique event ID for deduplication between Browser Pixel and CAPI */
function genEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Fire a standard or custom Meta Pixel event (client-side only). */
function track(event: string, params?: Record<string, unknown>, eventID?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, params, eventID ? { eventID } : undefined);
}

// ── Standard Events ──────────────────────────────────────────────────────

/**
 * ViewContent — fire when a user views a product page.
 * @param slug — product slug (used as content_id to match Meta Catalog)
 * @example fbPixel.viewContent({ id: product._id, slug: product.slug, name: product.name, price: product.price })
 */
export function viewContent(product: {
  id: string;
  slug?: string;
  name: string;
  price: number;
  currency?: string;
}) {
  const contentId = product.slug || product.id;
  track('ViewContent', {
    content_ids:  [contentId],
    content_name: product.name,
    content_type: 'product',
    value:        product.price,
    currency:     product.currency ?? 'EGP',
  });
}

/**
 * AddToCart — fire when a user adds a product to the cart.
 */
export function addToCart(product: {
  id: string;
  slug?: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  const contentId = product.slug || product.id;
  track('AddToCart', {
    content_ids:  [contentId],
    content_name: product.name,
    content_type: 'product',
    value:        product.price * (product.quantity ?? 1),
    currency:     product.currency ?? 'EGP',
    num_items:    product.quantity ?? 1,
  });
}

/**
 * InitiateCheckout — fire when user navigates to the checkout page.
 * Returns the generated eventID so it can be sent to CAPI for deduplication.
 */
export function initiateCheckout(payload: {
  value: number;
  numItems: number;
  currency?: string;
}): string {
  const eventId = genEventId('checkout');
  track('InitiateCheckout', {
    value:     payload.value,
    num_items: payload.numItems,
    currency:  payload.currency ?? 'EGP',
  }, eventId);
  return eventId;
}

/**
 * Purchase — fire after a successful order is placed.
 * Pass the same orderId used in CAPI for deduplication.
 */
export function purchase(payload: {
  orderId: string;
  value: number;
  currency?: string;
  numItems: number;
}) {
  const eventId = `purchase_${payload.orderId}`; // matches CAPI event_id
  track('Purchase', {
    content_type: 'product',
    order_id:     payload.orderId,
    value:        payload.value,
    currency:     payload.currency ?? 'EGP',
    num_items:    payload.numItems,
  }, eventId);
}
