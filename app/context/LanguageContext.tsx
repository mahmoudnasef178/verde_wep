'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, type Locale } from '@/app/lib/translations';

interface LanguageContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: typeof translations.en;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('verde-locale')) as Locale | null;
    if (saved === 'ar' || saved === 'en') {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (locale === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      html.classList.add('ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      html.classList.remove('ar');
    }
    localStorage.setItem('verde-locale', locale);
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale(prev => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const value: LanguageContextType = {
    locale,
    toggleLocale,
    t: translations[locale] as typeof translations.en,
    isAr: locale === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

