'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, type ApiProduct } from '@/app/lib/api';

interface FavoritesContextType {
  favorites: ApiProduct[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: ApiProduct) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const FAV_KEY = 'verde_favorites_v1';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('verde_auth_token');
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Load from localStorage first, then API if logged in
  useEffect(() => {
    const saved = localStorage.getItem(FAV_KEY);
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch { /* ignore */ }
    }
    if (getToken()) {
      setLoading(true);
      api.getFavorites()
        .then(res => { if (res.data) setFavorites(res.data); })
        .catch(() => { /* keep local */ })
        .finally(() => setLoading(false));
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch { /* ignore */ }
  }, [favorites]);

  const isFavorite = useCallback((productId: string) =>
    favorites.some(f => f._id === productId), [favorites]);

  const toggleFavorite = useCallback(async (product: ApiProduct) => {
    const isAlreadyFav = favorites.some(f => f._id === product._id);
    // Optimistic update
    setFavorites(prev =>
      isAlreadyFav
        ? prev.filter(f => f._id !== product._id)
        : [...prev, product]
    );
    // Sync with API if logged in
    if (getToken()) {
      try {
        await api.toggleFavorite(product._id);
      } catch {
        // Rollback on error
        setFavorites(prev =>
          isAlreadyFav
            ? [...prev, product]
            : prev.filter(f => f._id !== product._id)
        );
      }
    }
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
