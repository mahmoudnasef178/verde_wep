// ── Meta Pixel Helper ─────────────────────────────────────────────────────
// Centralised utility for firing Facebook / Meta Pixel events.
// Pixel base code is loaded in app/layout.tsx via next/script.

declare global {
  interface Window {
    fbq: (
      action: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/** Fire a standard or custom Meta Pixel event (client-side only). */
function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, params);
}

// ── Standard Events ──────────────────────────────────────────────────────

/**
 * ViewContent — fire when a user views a product page.
 * @example fbPixel.viewContent({ id: product._id, name: product.name, price: product.price })
 */
export function viewContent(product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}) {
  track('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: product.currency ?? 'EGP',
  });
}

/**
 * AddToCart — fire when a user adds a product to the cart.
 */
export function addToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  track('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * (product.quantity ?? 1),
    currency: product.currency ?? 'EGP',
    num_items: product.quantity ?? 1,
  });
}

/**
 * InitiateCheckout — fire when user navigates to the checkout page.
 */
export function initiateCheckout(payload: {
  value: number;
  numItems: number;
  currency?: string;
}) {
  track('InitiateCheckout', {
    value: payload.value,
    num_items: payload.numItems,
    currency: payload.currency ?? 'EGP',
  });
}

/**
 * Purchase — fire after a successful order is placed.
 */
export function purchase(payload: {
  orderId: string;
  value: number;
  currency?: string;
  numItems: number;
}) {
  track('Purchase', {
    content_type: 'product',
    order_id: payload.orderId,
    value: payload.value,
    currency: payload.currency ?? 'EGP',
    num_items: payload.numItems,
  });
}
