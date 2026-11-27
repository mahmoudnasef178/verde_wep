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

/** Set cookie with options */
function setCookie(name, value, maxAgeSec, sameSite = 'Lax') {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSec}; path=/; SameSite=${sameSite}${secure}`;
}

// ── External ID (persistent first-party visitor identifier) ──

const EID_COOKIE = '_verde_eid';
const EID_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Get or create a persistent external_id cookie (UUID, 1 year).
 * Used as `external_id` on every server event (hashed server-side)
 * and in browser Advanced Matching (raw, Pixel hashes it).
 */
export function getOrCreateExternalId() {
  if (typeof document === 'undefined') return '';
  let eid = getCookie(EID_COOKIE);
  if (eid) return eid;
  eid = generateUUID();
  setCookie(EID_COOKIE, eid, EID_MAX_AGE);
  return eid;
}

// ── Session PII Persistence ──

const PII_KEY = 'verde_user_pii';

/**
 * Persist valid PII fields in sessionStorage so later events (ViewContent, AddToCart)
 * can include them even before the user reaches checkout on that session.
 * Only stores non-empty values; never overwrites with empty.
 */
export function persistUserData(user = {}) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const existing = JSON.parse(sessionStorage.getItem(PII_KEY) || '{}');
    const merged = { ...existing };
    if (user.email) merged.email = String(user.email).trim().toLowerCase();
    if (user.phone) merged.phone = String(user.phone).trim();
    if (user.firstName) merged.firstName = String(user.firstName).trim().toLowerCase();
    if (user.lastName) merged.lastName = String(user.lastName).trim().toLowerCase();
    if (user.city) merged.city = String(user.city).trim().toLowerCase();
    sessionStorage.setItem(PII_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

/**
 * Read persisted PII from sessionStorage.
 */
export function getPersistedUserData() {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(PII_KEY) || '{}');
  } catch {
    return {};
  }
}

let clientPbPromise = null;

/**
 * Lazily loads Meta's official `meta-capi-param-builder-clientjs` strictly on the client
 * (the UMD bundle references `self`, which would throw during Next.js SSR if imported at top level).
 */
function getClientParamBuilder() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!clientPbPromise) {
    clientPbPromise = import('meta-capi-param-builder-clientjs')
      .then((mod) => mod?.default || mod)
      .catch(() => null);
  }
  return clientPbPromise;
}

/**
 * Runs Meta Client ParamBuilder on the current URL so `_fbp` & `_fbc` cookies are populated
 * immediately (without waiting for fbevents.js) with ParamBuilder v2 tokens.
 */
export async function initParamBuilder() {
  if (typeof window === 'undefined') return { fbp: undefined, fbc: undefined };
  const fallbackFbc = ensureFbc() || getCookie('_fbc');
  try {
    const pb = await getClientParamBuilder();
    if (pb && typeof pb.processAndCollectAllParams === 'function') {
      const params = await pb.processAndCollectAllParams(window.location.href);
      return {
        fbp: params?._fbp || pb.getFbp?.() || getCookie('_fbp'),
        fbc: params?._fbc || pb.getFbc?.() || fallbackFbc,
      };
    }
  } catch {
    // Non-blocking fallback to raw cookies
  }
  return {
    fbp: getCookie('_fbp'),
    fbc: fallbackFbc,
  };
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
 * Call fbq('init', PIXEL_ID, { em, ph, fn, ln, ct, country, external_id })
 * with raw lowercase values once customer data is known (Pixel hashes them itself).
 * Also persists user data to sessionStorage for later events.
 */
export function initAdvancedMatching(user = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    // Persist for later events
    persistUserData(user);

    const em = user.email ? String(user.email).trim().toLowerCase() : '';
    const ph = user.phone ? normalizeEgyptPhoneRaw(user.phone) : '';
    const fn = user.firstName ? String(user.firstName).trim().toLowerCase() : '';
    const ln = user.lastName ? String(user.lastName).trim().toLowerCase() : '';
    const ct = user.city ? String(user.city).trim().toLowerCase().replace(/\s+/g, '') : '';
    const externalId = getOrCreateExternalId();

    if (!em && !ph && !fn && !ln && !ct && !externalId) return;

    const matchData = {
      ...(em ? { em } : {}),
      ...(ph ? { ph } : {}),
      ...(fn ? { fn } : {}),
      ...(ln ? { ln } : {}),
      ...(ct ? { ct } : {}),
      ...(externalId ? { external_id: externalId } : {}),
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
    return undefined;
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
 * 1. Runs Meta ParamBuilder (browser SDK) to ensure `_fbp` and `_fbc` cookies immediately
 * 2. Generates UUID event_id for Browser <-> Server deduplication
 * 3. Calls initAdvancedMatching with merged persisted + passed user data
 * 4. Fires fbq('track', eventName, custom_data, { eventID })
 *    (PageView is called with no custom params so Meta classifies it strictly as Standard Event)
 * 5. Sends same event + event_id + _fbp/_fbc + external_id to /api/meta/event (keepalive: true)
 */
export async function trackMeta(
  eventName,
  { products = [], value, currency = 'EGP', user = {}, eventId, extra = {} } = {}
) {
  const { fbp, fbc } = await initParamBuilder();
  const resolvedId = eventId || generateUUID();
  const isPageView = eventName === 'PageView';
  const customData = isPageView ? undefined : buildProductCustomData({ products, value, currency, extra });

  // Capture event_time and URL immediately at event occurrence so Browser & Server share the exact second
  const eventTime = Math.floor(Date.now() / 1000);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Merge persisted PII with passed user data for higher EMQ
  const persistedPii = getPersistedUserData();
  const mergedUser = { ...persistedPii, ...user };

  // Ensure external_id exists
  const externalId = getOrCreateExternalId();

  // 0. Browser Advanced Matching — call on every event (not just Purchase) so Pixel has user signals
  if (Object.keys(mergedUser).length > 0 || externalId) {
    initAdvancedMatching({ ...mergedUser, external_id: externalId });
  }

  // 1. Browser Pixel
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      if (isPageView) {
        window.fbq('track', 'PageView', undefined, { eventID: resolvedId });
      } else {
        window.fbq('track', eventName, customData || {}, { eventID: resolvedId });
      }
    } catch (err) {
      console.warn(`[Meta Pixel] Error firing ${eventName}:`, err);
    }
  }

  // 2. Server CAPI (never send Purchase via browser proxy — server owns Purchase CAPI)
  if (typeof window !== 'undefined' && eventName !== 'Purchase') {
    try {
      const resolvedFbp = fbp || getCookie('_fbp');
      const resolvedFbc = fbc || getCookie('_fbc');

      fetch('/api/meta/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event_name: eventName,
          event_id: resolvedId,
          event_time: eventTime,
          event_source_url: pageUrl,
          ...(customData ? { custom_data: customData } : {}),
          user: mergedUser,
          fbp: resolvedFbp,
          fbc: resolvedFbc,
          external_id: externalId,
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

  // Merge persisted PII with passed user for maximum match quality
  const persistedPii = getPersistedUserData();
  const mergedUser = { ...persistedPii, ...user };
  initAdvancedMatching(mergedUser);

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
