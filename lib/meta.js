import { toContentId } from './meta-ids';

export const PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '2318055825266250').split(',')[0].trim();

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
 * Synchronously get or create a persistent external_id cookie (UUID, 1 year).
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

// ── Persistent PII Storage (localStorage + sessionStorage fallback, clearable on logout) ──

const PII_STORAGE_KEY = 'verde_user_pii_v1';
const LEGACY_SESSION_PII_KEY = 'verde_user_pii';

export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

export function isValidEgyptPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Persist valid PII fields in localStorage (and mirror to sessionStorage) so returning visitors
 * and subsequent events (PageView, ViewContent, AddToCart) carry higher match quality signals.
 * Stores a `clearable: true` flag so logout can cleanly purge user PII without touching _verde_eid.
 */
export function persistUserData(user = {}, source = 'checkout') {
  if (typeof window === 'undefined') return;
  try {
    const existing = getPersistedUserData();
    const merged = { ...existing, clearable: true, source };
    if (user.email && isValidEmail(user.email)) {
      merged.email = String(user.email).trim().toLowerCase();
    }
    if (user.phone && isValidEgyptPhone(user.phone)) {
      merged.phone = String(user.phone).trim();
    }
    if (user.firstName && String(user.firstName).trim()) {
      merged.firstName = String(user.firstName).trim().toLowerCase();
    }
    if (user.lastName && String(user.lastName).trim()) {
      merged.lastName = String(user.lastName).trim().toLowerCase();
    }
    if (user.city && String(user.city).trim()) {
      merged.city = String(user.city).trim().toLowerCase();
    }
    const rawState = user.state || user.st;
    if (rawState && String(rawState).trim()) {
      merged.st = String(rawState).trim().toLowerCase();
    }
    const rawZip = user.zip || user.zp;
    if (rawZip && String(rawZip).trim()) {
      merged.zp = String(rawZip).trim().toLowerCase();
    }
    const serialized = JSON.stringify(merged);
    try { localStorage.setItem(PII_STORAGE_KEY, serialized); } catch { /* ignore */ }
    try { sessionStorage.setItem(LEGACY_SESSION_PII_KEY, serialized); } catch { /* ignore */ }
  } catch {
    // ignore
  }
}

/**
 * Read persisted PII from localStorage (falling back to sessionStorage if needed).
 * Strips internal metadata keys (`clearable`, `source`) before attaching to user_data.
 */
export function getPersistedUserData() {
  if (typeof window === 'undefined') return {};
  try {
    let raw = null;
    try { raw = localStorage.getItem(PII_STORAGE_KEY); } catch { /* ignore */ }
    if (!raw) {
      try { raw = sessionStorage.getItem(LEGACY_SESSION_PII_KEY); } catch { /* ignore */ }
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const { clearable: _c, source: _s, ...pii } = parsed;
    return pii;
  } catch {
    return {};
  }
}

/**
 * Clear persisted user PII (e.g. on customer logout).
 */
export function clearPersistedUserData() {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(PII_STORAGE_KEY); } catch { /* ignore */ }
  try { sessionStorage.removeItem(LEGACY_SESSION_PII_KEY); } catch { /* ignore */ }
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
 * with ParamBuilder v2 tokens for improved Match Quality.
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
 * If fbclid exists in the URL, set (or update) _fbc preserving the exact original fbclid casing:
 *   fb.1.{timestamp_ms}.{fbclid} (90 days, path=/, SameSite=Lax)
 * Otherwise return existing _fbc cookie if present.
 */
export function ensureFbc() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
  try {
    const existing = getCookie('_fbc');
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (!fbclid) return existing;

    // Preserve exact fbclid casing; reuse existing cookie only if it already corresponds to this exact fbclid
    if (existing && existing.endsWith(`.${fbclid}`)) {
      return existing;
    }

    const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
    const maxAge = 90 * 24 * 60 * 60;
    setCookie('_fbc', fbcValue, maxAge);
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
 * Calls fbq('init', PIXEL_ID, matchData) only when matchData changes (prevents duplicate init spam),
 * with raw lowercase values (Pixel hashes them itself) and persists valid PII.
 */
export function initAdvancedMatching(user = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    persistUserData(user);

    const em = user.email ? String(user.email).trim().toLowerCase() : '';
    const ph = user.phone ? normalizeEgyptPhoneRaw(user.phone) : '';
    const fn = user.firstName ? String(user.firstName).trim().toLowerCase() : '';
    const ln = user.lastName ? String(user.lastName).trim().toLowerCase() : '';
    const ct = user.city ? String(user.city).trim().toLowerCase().replace(/\s+/g, '') : '';
    const stRaw = user.st || user.state;
    const st = stRaw ? String(stRaw).trim().toLowerCase() : '';
    const zpRaw = user.zp || user.zip;
    const zp = zpRaw ? String(zpRaw).trim().toLowerCase() : '';
    const externalId = user.external_id || getOrCreateExternalId();

    if (!em && !ph && !fn && !ln && !ct && !st && !zp && !externalId) return;

    const matchData = {
      ...(em ? { em } : {}),
      ...(ph ? { ph } : {}),
      ...(fn ? { fn } : {}),
      ...(ln ? { ln } : {}),
      ...(ct ? { ct } : {}),
      ...(st ? { st } : {}),
      ...(zp ? { zp } : {}),
      ...(externalId ? { external_id: externalId } : {}),
      country: 'eg',
    };

    const key = JSON.stringify(matchData);
    if (window.__verdeAmKey === key) return;
    window.__verdeAmKey = key;

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
 * Send CAPI event reliably from the browser using fetch(keepalive) with sendBeacon fallback on error.
 */
function dispatchServerEvent(payload) {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(payload);

  const sendBeaconFallback = () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([serialized], { type: 'application/json' });
        navigator.sendBeacon('/api/meta/event', blob);
      }
    } catch {
      // Non-blocking
    }
  };

  try {
    fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: serialized,
    })
      .then((res) => {
        if (!res.ok && res.status >= 500) {
          sendBeaconFallback();
        }
      })
      .catch(() => {
        sendBeaconFallback();
      });
  } catch {
    sendBeaconFallback();
  }
}

/**
 * Shared Meta tracking helper:
 * 1. Synchronously generates event_id, _verde_eid (external_id), and _fbc from URL fbclid
 * 2. Updates browser Advanced Matching & fires fbq('track', eventName, custom_data, { eventID }) immediately
 * 3. Sends the exact same event_name + event_id + _fbp/_fbc + external_id + persisted PII to /api/meta/event
 *    (even if the Pixel script is blocked by an ad blocker!)
 */
export async function trackMeta(
  eventName,
  { products = [], value, currency = 'EGP', user = {}, eventId, extra = {} } = {}
) {
  // Generate event_id and capture synchronous browser signals immediately before any async gap
  const resolvedId = eventId || generateUUID();
  const eventTime = Math.floor(Date.now() / 1000);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const isPageView = eventName === 'PageView';
  const customData = isPageView ? undefined : buildProductCustomData({ products, value, currency, extra });

  const externalId = getOrCreateExternalId();
  const syncFbc = ensureFbc() || getCookie('_fbc');
  const syncFbp = getCookie('_fbp');

  // Merge persisted PII (from localStorage) with explicitly passed user data
  const persistedPii = getPersistedUserData();
  const mergedUser = { ...persistedPii, ...user };

  // 1. Browser Pixel (wrapped cleanly so ad-blocker / fbq errors NEVER prevent the server CAPI call)
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      initAdvancedMatching({ ...mergedUser, external_id: externalId });
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
    // Wait at most 150ms for ParamBuilder only if _fbp or _fbc is still missing; never delay navigation
    let resolvedFbp = syncFbp;
    let resolvedFbc = syncFbc;
    if (!resolvedFbp || !resolvedFbc) {
      try {
        const pbResult = await Promise.race([
          initParamBuilder(),
          new Promise((resolve) => setTimeout(() => resolve(null), 150)),
        ]);
        if (pbResult) {
          resolvedFbp = resolvedFbp || pbResult.fbp || getCookie('_fbp');
          resolvedFbc = resolvedFbc || pbResult.fbc || getCookie('_fbc');
        }
      } catch {
        // Use synchronous cookie values
      }
    }

    dispatchServerEvent({
      event_name: eventName,
      event_id: resolvedId,
      event_time: eventTime,
      event_source_url: pageUrl,
      ...(customData ? { custom_data: customData } : {}),
      user: mergedUser,
      fbp: resolvedFbp,
      fbc: resolvedFbc,
      external_id: externalId,
    });
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

  const externalId = getOrCreateExternalId();
  const persistedPii = getPersistedUserData();
  const mergedUser = { ...persistedPii, ...user, external_id: externalId };
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
