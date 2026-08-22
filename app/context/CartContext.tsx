'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api, type ApiProduct } from '@/app/lib/api';

// CartProduct is simply ApiProduct — always has _id, slug, and all required fields
export type CartProduct = ApiProduct;


export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
  const addToCart = (product: CartProduct, quantity = 1) => {
    const pid = product._id;
    setItems(prev => {
      const ex = prev.find(i => i.product._id === pid);
      if (ex) {
        syncUpdate(pid, ex.quantity + quantity);
        return prev.map(i => i.product._id === pid ? { ...i, quantity: i.quantity + quantity } : i);
      }
      syncAdd(pid, quantity);
      return [...prev, { product, quantity }];
    });
    setIsDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product._id !== productId));
    syncRemove(productId);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
    syncUpdate(productId, quantity);
  };

  const clearCart = () => {
    setItems([]);
    syncClear();
  };

  const totalItems = items.reduce((a, i) => a + i.quantity, 0);
  const subtotal   = items.reduce((a, i) => a + i.product.price * i.quantity, 0);

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
