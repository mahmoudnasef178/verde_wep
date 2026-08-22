'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products as allProducts, type Product } from '@/app/lib/products';
import styles from './SearchModal.module.css';

const suggestions = ['Oud', 'Fresh', 'For Him', 'For Her', 'Vetiver', 'Musk'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length > 0
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        p.notes.some(n => n.toLowerCase().includes(query.toLowerCase())) ||
        p.family.toLowerCase().includes(query.toLowerCase()) ||
        (p.tag?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : [];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} id="search-overlay">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            placeholder="Search fragrances, notes..."
            className={styles.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close search" id="search-close-btn">
            ESC
          </button>
        </div>

        {/* Suggestions (no query) */}
        {!query && (
          <div className={styles.suggestions}>
            <p className={styles.suggestLabel}>POPULAR SEARCHES</p>
            <div className={styles.suggestTags}>
              {suggestions.map(s => (
                <button
                  key={s}
                  className={styles.tag}
                  onClick={() => setQuery(s)}
                  id={`suggestion-${s.toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className={styles.results}>
            {results.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🌿</span>
                <p className={styles.emptyTitle}>No results for "{query}"</p>
                <p className={styles.emptyHint}>Try searching for a note like "oud" or "musk"</p>
              </div>
            ) : (
              <>
                <p className={styles.resultCount}>{results.length} FRAGRANCE{results.length > 1 ? 'S' : ''} FOUND</p>
                <div className={styles.resultGrid}>
                  {results.map(p => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={onClose}
                      className={styles.card}
                      id={`search-result-${p.id}`}
                    >
                      <div className={styles.cardImg}>
                        <Image src={p.img} alt={p.name} width={120} height={150} className={styles.img} />
                        {p.tag && <span className={styles.cardTag}>{p.tag}</span>}
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardName}>{p.name}</h3>
                        <p className={styles.cardNotes}>{p.notes.join(' · ')}</p>
                        <p className={styles.cardPrice}>{p.price.toLocaleString()} EGP</p>
                        <span className={styles.cardBtn}>
                          VIEW DETAILS
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
