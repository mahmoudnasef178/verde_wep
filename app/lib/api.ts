const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('verde_auth_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const base: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) return { ...base, Authorization: `Bearer ${token}` };
  return base;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: { ...authHeaders(), ...(options.headers ?? {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'API Error');
    return data as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ────── Products ────── */
export const api = {
  /* Products */
  getProducts: async (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await request<{ success: boolean; count?: number; products?: ApiProduct[]; data?: ApiProduct[] }>(`/api/products${qs}`);
    return {
      success: res.success,
      data: res.products || res.data || [],
    };
  },
  getProductBySlug: async (slug: string) => {
    const res = await request<{ success: boolean; product?: ApiProduct; data?: ApiProduct; related?: ApiProduct[] }>(`/api/products/slug/${slug}`);
    return {
      success: res.success,
      data: res.product || res.data,
      related: res.related || [],
    };
  },
  getProductById: async (id: string) => {
    const res = await request<{ success: boolean; product?: ApiProduct; data?: ApiProduct }>(`/api/products/${id}`);
    return {
      success: res.success,
      data: res.product || res.data,
    };
  },

  /* Cart */
  getCart: () =>
    request<{ success: boolean; data: ApiCart }>('/api/cart'),
  addToCart: (productId: string, quantity: number) =>
    request<{ success: boolean; data: ApiCart }>('/api/cart/item', {
      method: 'POST', body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (productId: string, quantity: number) =>
    request<{ success: boolean; data: ApiCart }>(`/api/cart/item/${productId}`, {
      method: 'PUT', body: JSON.stringify({ quantity }),
    }),
  removeCartItem: (productId: string) =>
    request<{ success: boolean; data: ApiCart }>(`/api/cart/item/${productId}`, { method: 'DELETE' }),
  clearCart: () =>
    request<{ success: boolean }>('/api/cart', { method: 'DELETE' }),

  /* Favorites */
  getFavorites: async () => {
    const res = await request<{ success: boolean; favorites?: ApiProduct[]; data?: ApiProduct[] }>('/api/favorites');
    return {
      success: res.success,
      data: res.favorites || res.data || [],
    };
  },
  toggleFavorite: (productId: string) =>
    request<{ success: boolean; action: 'added' | 'removed'; data?: ApiProduct[] }>(
      '/api/favorites/toggle', { method: 'POST', body: JSON.stringify({ productId }) }
    ),
  removeFavorite: (productId: string) =>
    request<{ success: boolean }>(`/api/favorites/${productId}`, { method: 'DELETE' }),

  /* Orders */
  createOrder: (body: CreateOrderPayload) =>
    request<{ success: boolean; data: ApiOrder; order?: ApiOrder }>('/api/orders', {
      method: 'POST', body: JSON.stringify(body),
    }),
  getMyOrders: async () => {
    const res = await request<{ success: boolean; orders?: ApiOrder[]; data?: ApiOrder[] }>('/api/orders/my-orders');
    return {
      success: res.success,
      data: res.orders || res.data || [],
    };
  },

  /* Reviews */
  addReview: (productId: string, rating: number, comment: string) =>
    request<{ success: boolean; data?: ApiProduct; product?: ApiProduct }>(`/api/products/${productId}/reviews`, {
      method: 'POST', body: JSON.stringify({ rating, comment }),
    }),

  /* Auth — Password Reset */
  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST', body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ success: boolean; message: string }>(`/api/auth/reset-password/${token}`, {
      method: 'PUT', body: JSON.stringify({ password }),
    }),

  /* Users */
  getAllUsers: () =>
    request<{ success: boolean; count: number; users: any[] }>('/api/users'),
};


/* ────── Types ────── */
export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  subtitle: string;
  price: number;
  img: string;
  imgs: string[];
  tag?: string;
  notes: string[];
  family: string;
  intensity: string;
  description: string;
  longDescription: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  volume: string;
  occasion: string[];
  season: string[];
  rating: number;
  numReviews: number;
  stock: number;
  reviews: ApiReview[];
}

export interface ApiReview {
  _id: string;
  user: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiCartItem {
  product: ApiProduct;
  quantity: number;
}

export interface ApiCart {
  _id: string;
  items: ApiCartItem[];
  total: number;
}

export interface CreateOrderPayload {
  orderItems?: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    img: string;
  }>;
  email?: string;
  shippingAddress: {
    fullName: string;
    email?: string;
    phone: string;
    city: string;
    address: string;
    building?: string;
  };
  paymentMethod: string;
  shippingPrice?: number;
  notes?: string;
}

export interface ApiOrder {
  _id: string;
  orderNumber: string;
  items: { product: ApiProduct; quantity: number; price: number }[];
  totalPrice: number;
  status: string;
  paymentMethod: string;
  shippingAddress: Record<string, string>;
  createdAt: string;
}
