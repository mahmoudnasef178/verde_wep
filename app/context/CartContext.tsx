'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api, type ApiProduct } from '@/app/lib/api';
import * as fbPixel from '@/app/lib/fbpixel';

// CartProduct is simply ApiProduct — always has _id, slug, and all required fields
export type CartProduct = ApiProduct;


export interface CartItem {
  product: CartProduct;
  quantity: number;
  size?: string;
  price?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = 'verde_cart_v2';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('verde_auth_token');
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const syncing = useRef(false);

  // ── On mount: load from localStorage, then optionally sync from API ──
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setReady(true);

    // If logged in, fetch cart from API and merge
    if (getToken()) {
      api.getCart().then(res => {
        if (res.data?.items?.length) {
          const apiItems: CartItem[] = res.data.items.map(i => ({
            product: i.product as CartProduct,
            quantity: i.quantity,
          }));
          setItems(apiItems);
        }
      }).catch(() => { /* keep local */ });
    }
  }, []);

  // ── Persist to localStorage ──
  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* ignore */ }
    }
  }, [items, ready]);

  // ── Sync a single operation to API (best-effort) ──
  const syncAdd = useCallback(async (productId: string, qty: number) => {
    if (!getToken() || syncing.current) return;
    syncing.current = true;
    try { await api.addToCart(productId, qty); } finally { syncing.current = false; }
  }, []);

  const syncUpdate = useCallback(async (productId: string, qty: number) => {
    if (!getToken() || syncing.current) return;
    syncing.current = true;
    try { await api.updateCartItem(productId, qty); } finally { syncing.current = false; }
  }, []);

  const syncRemove = useCallback(async (productId: string) => {
    if (!getToken() || syncing.current) return;
    syncing.current = true;
    try { await api.removeCartItem(productId); } finally { syncing.current = false; }
  }, []);

  const syncClear = useCallback(async () => {
    if (!getToken()) return;
    try { await api.clearCart(); } catch { /* ignore */ }
  }, []);

  // ── Cart operations ──
  const addToCart = (product: CartProduct, quantity = 1, size?: string) => {
    const pid = product._id;
    const isDiscover = product.slug === 'discover-box' || product.slug === 'winter-discover-box' || product.slug.includes('discover');
    const itemSize = isDiscover ? (product.volume || '5 x 10 ML') : (size || '50 ML');
    const is10ml = itemSize === '10 ML';
    const itemPrice = is10ml ? Math.round(product.price / 4) : product.price;

    setItems(prev => {
      const exIndex = prev.findIndex(i => i.product._id === pid && (i.size || '50 ML') === itemSize);
      if (exIndex > -1) {
        const updated = [...prev];
        const newQty = updated[exIndex].quantity + quantity;
        updated[exIndex] = {
          ...updated[exIndex],
          quantity: newQty,
          size: itemSize,
          price: itemPrice,
        };
        syncUpdate(pid, newQty);
        return updated;
      }
      syncAdd(pid, quantity);
      return [...prev, { product, quantity, size: itemSize, price: itemPrice }];
    });

    // ── Meta Pixel: AddToCart ──
    fbPixel.addToCart({
      id:       product._id,
      slug:     product.slug,
      name:     is10ml ? `${product.name} (10 ML)` : product.name,
      price:    itemPrice,
      quantity,
    });
    setIsDrawerOpen(true);
  };

  const removeFromCart = (productId: string, size?: string) => {
    setItems(prev => prev.filter(i => !(i.product._id === productId && (!size || (i.size || '50 ML') === size))));
    syncRemove(productId);
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems(prev => prev.map(i => {
      if (i.product._id === productId && (!size || (i.size || '50 ML') === size)) {
        return { ...i, quantity };
      }
      return i;
    }));
    syncUpdate(productId, quantity);
  };

  const clearCart = () => {
    setItems([]);
    syncClear();
  };

  const totalItems = items.reduce((a, i) => a + i.quantity, 0);
  const subtotal   = items.reduce((a, i) => {
    const p = i.price ?? (i.size === '10 ML' ? Math.round(i.product.price / 4) : i.product.price);
    return a + p * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      isDrawerOpen, openDrawer: () => setIsDrawerOpen(true), closeDrawer: () => setIsDrawerOpen(false),
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
