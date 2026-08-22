'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useFavorites } from '@/app/context/FavoritesContext';
import { useCart } from '@/app/context/CartContext';
import styles from './Favorites.module.css';

export default function FavoritesClient() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart, openDrawer } = useCart();
  const [addedItems, setAddedItems] = useState<{ [id: string]: boolean }>({});

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedItems(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product._id]: false }));
    }, 2000);
    openDrawer();
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>YOUR PERSONAL WISHLIST</p>
            <h1 className={styles.heading}>Saved <em>Fragrances</em></h1>
            <p className={styles.countText}>
              {favorites.length === 0
                ? 'Your wishlist is currently empty.'
                : `You have saved ${favorites.length} ${favorites.length === 1 ? 'fragrance' : 'fragrances'}.`}
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>No Favorites Saved Yet</h2>
              <p className={styles.emptySub}>
                Explore our luxury fragrance collection and tap the heart icon on any fragrance to save it here for later.
              </p>
              <Link href="/#products" className={styles.exploreBtn}>
                EXPLORE COLLECTION
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {favorites.map(product => {
                const isAdded = !!addedItems[product._id];
                return (
                  <div key={product._id} className={styles.card} id={`fav-card-${product._id}`}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => toggleFavorite(product)}
                      title="Remove from favorites"
                      aria-label="Remove from favorites"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>

                    <div className={styles.imgWrap}>
                      <Image
                        src={product.img}
                        alt={product.name}
                        width={400}
                        height={500}
                        className={styles.img}
                      />
                    </div>

                    <div className={styles.cardContent}>
                      <div>
                        <h3 className={styles.cardTitle}>{product.name}</h3>
                        <p className={styles.cardSubtitle}>{product.subtitle}</p>
                        <div className={styles.cardPrice}>
                          {product.price.toLocaleString()} EGP
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          className={`${styles.addBtn} ${isAdded ? styles.addBtnAdded : ''}`}
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          {isAdded ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              ADDED
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <path d="M16 10a4 4 0 0 1-8 0"/>
                              </svg>
                              ADD TO CART
                            </>
                          )}
                        </button>

                        <Link href={`/products/${product.slug}`} className={styles.viewBtn}>
                          VIEW
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
