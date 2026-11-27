export const PIXEL_ID: string;

export interface MetaTrackProduct {
  id?: string;
  slug?: string | null;
  size?: string | null;
  quantity?: number;
  price?: number;
  item_price?: number;
}

export interface MetaUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  st?: string;
  zip?: string;
  zp?: string;
  external_id?: string;
}

export function generateUUID(): string;
export function getCookie(name: string): string | undefined;
export function ensureFbc(): string | undefined;
export function initParamBuilder(): Promise<{ fbp?: string; fbc?: string }>;
export function initAdvancedMatching(user?: MetaUserData): void;

/** Get or create a persistent external_id cookie (UUID, 1 year) */
export function getOrCreateExternalId(): string;

/** Persist PII fields in localStorage (with clear flag) for returning visitors & later events */
export function persistUserData(user?: MetaUserData, source?: string): void;

/** Read persisted PII from localStorage */
export function getPersistedUserData(): Partial<MetaUserData>;

/** Clear persisted PII on logout */
export function clearPersistedUserData(): void;

/** Field validation helpers for checkout PII persistence */
export function isValidEmail(email: string): boolean;
export function isValidEgyptPhone(phone: string): boolean;

export function trackMeta(
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | string,
  payload?: {
    products?: MetaTrackProduct[];
    value?: number;
    currency?: string;
    user?: MetaUserData;
    eventId?: string;
    extra?: Record<string, unknown>;
  }
): Promise<string>;

export function trackPurchaseBrowser(payload: {
  orderId: string;
  products?: MetaTrackProduct[];
  value: number;
  currency?: string;
  user?: MetaUserData;
}): string;
