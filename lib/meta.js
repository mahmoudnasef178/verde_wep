import { toContentId } from './meta-ids';

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2318055825266250';

/** Generate RFC4122 v4 UUID for event deduplication */
export function generateUUID() {
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
export function getCookie(name) {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * If _fbc cookie is missing and fbclid exists in the URL, set _fbc as:
 *   fb.1.{timestamp_ms}.{fbclid} (90 days, path=/, SameSite=Lax)
 */
export function ensureFbc() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
  try {
    const existing = getCookie('_fbc');
    if (existing) return existing;

    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (!fbclid) return undefined;

    const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
    const maxAge = 90 * 24 * 60 * 60;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `_fbc=${encodeURIComponent(fbcValue)}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`;
    return fbcValue;
  } catch {
    return undefined;
  }
}

function normalizeEgyptPhoneRaw(phone) {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('0020')) digits = digits.slice(2);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('01') && digits.length === 11) digits = '20' + digits.slice(1);
  else if (digits.startsWith('1') && digits.length === 10) digits = '20' + digits;
  return digits;
}

/**
 * Browser Advanced Matching:
 * Call fbq('init', PIXEL_ID, { em, ph, fn, ln, ct, country: 'eg' })
 * with raw lowercase values once customer data is known (Pixel hashes them itself).
 */
export function initAdvancedMatching(user = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    const em = user.email ? String(user.email).trim().toLowerCase() : '';
    const ph = user.phone ? normalizeEgyptPhoneRaw(user.phone) : '';
    const fn = user.firstName ? String(user.firstName).trim().toLowerCase() : '';
    const ln = user.lastName ? String(user.lastName).trim().toLowerCase() : '';
    const ct = user.city ? String(user.city).trim().toLowerCase().replace(/\s+/g, '') : '';

    if (!em && !ph && !fn && !ln && !ct) return;

    const matchData = {
      ...(em ? { em } : {}),
      ...(ph ? { ph } : {}),
      ...(fn ? { fn } : {}),
      ...(ln ? { ln } : {}),
      ...(ct ? { ct } : {}),
      country: 'eg',
    };

    window.fbq('init', PIXEL_ID, matchData);
  } catch {
    // Non-blocking
  }
}

/** Build standard Meta custom_data from a list of products */
function buildProductCustomData({ products = [], value, currency = 'EGP', extra = {} }) {
  const contentIds = [];
  const contents = [];
  let totalItems = 0;

  for (const item of products) {
    const qty = Number(item.quantity) || 1;
    const itemPrice = Number(item.price ?? item.item_price) || 0;
    const contentId = toContentId(item, item.size);

    if (!contentId) {
      console.warn('[Meta Pixel] Skipping product without slug:', item);
      continue;
    }

    contentIds.push(contentId);
    contents.push({
      id: contentId,
      quantity: qty,
      item_price: itemPrice,
    });
    totalItems += qty;
  }

  if (products.length === 0 && value == null) {
    return { ...extra };
  }

  return {
    content_type: 'product',
    content_ids: contentIds,
    contents,
    num_items: totalItems || 1,
    value: Number(value) || 0,
    currency: currency || 'EGP',
    ...extra,
  };
}

/**
 * Shared Meta tracking helper:
 * 1. Ensures _fbc cookie from fbclid if present
 * 2. Generates UUID event_id
 * 3. Fires fbq('track', eventName, custom_data, { eventID })
 * 4. Sends same event + event_id + _fbp/_fbc to /api/meta/event (keepalive: true)
 */
export async function trackMeta(
  eventName,
  { products = [], value, currency = 'EGP', user = {}, eventId, extra = {} } = {}
) {
  const fbc = ensureFbc() || getCookie('_fbc');
  const fbp = getCookie('_fbp');
  const resolvedId = eventId || generateUUID();
  const customData = buildProductCustomData({ products, value, currency, extra });

  // 1. Browser Pixel
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, customData, { eventID: resolvedId });
    } catch (err) {
      console.warn(`[Meta Pixel] Error firing ${eventName}:`, err);
    }
  }

  // 2. Server CAPI (never send Purchase via browser proxy — server owns Purchase CAPI)
  if (typeof window !== 'undefined' && eventName !== 'Purchase') {
    try {
      fetch('/api/meta/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event_name: eventName,
          event_id: resolvedId,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: window.location.href,
          custom_data: customData,
          user,
          fbp,
          fbc,
        }),
      }).catch(() => {
        /* Fail silently */
      });
    } catch {
      /* Ignore */
    }
  }

  return resolvedId;
}

/**
 * Fires Browser Pixel Purchase ONCE on /order-success using the exact backend orderId
 * so it deduplicates with server-side capiPurchase (event_id = String(order._id)).
 */
export function trackPurchaseBrowser({ orderId, products = [], value, currency = 'EGP', user = {} }) {
  const id = String(orderId || '').trim();
  if (!id || id === 'unknown') return '';

  if (typeof window !== 'undefined') {
    const guardKey = `verde_purchase_${id}`;
    try {
      if (sessionStorage.getItem(guardKey)) {
        return id;
      }
      sessionStorage.setItem(guardKey, '1');
    } catch {
      // ignore sessionStorage restrictions
    }
  }

  initAdvancedMatching(user);

  const customData = buildProductCustomData({
    products,
    value,
    currency,
    extra: { order_id: id },
  });

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'Purchase', customData, { eventID: id });
    } catch (err) {
      console.warn('[Meta Pixel] Error firing Purchase:', err);
    }
  }

  return id;
}
