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
}

export function generateUUID(): string;
export function getCookie(name: string): string | undefined;
export function ensureFbc(): string | undefined;
export function initAdvancedMatching(user?: MetaUserData): void;

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
