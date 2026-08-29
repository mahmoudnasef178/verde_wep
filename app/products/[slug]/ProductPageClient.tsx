'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ApiProduct } from '@/app/lib/api';
import { useCart } from '@/app/context/CartContext';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from './ProductPage.module.css';

interface Props {
  product: ApiProduct;
  related?: ApiProduct[];
}

export default function ProductPageClient({ product }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'details'>('description');
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className={styles.breadcrumbInner}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href="/#products" className={styles.breadcrumbLink}>Shop</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{product.name}</span>
          </div>
        </div>

        {/* Product layout */}
        <section className={styles.product}>
          <div className={styles.container}>
            {/* ── Images ── */}
            <div className={styles.gallery}>
              {/* Thumbnails */}
              <div className={styles.thumbs}>
                {product.imgs.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                    id={`thumb-${i}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt={`${product.name} view ${i + 1}`} width={80} height={100} />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className={styles.mainImg}>
                <div className={styles.mainImgWrap}>
                  {product.tag && <span className={styles.imgTag}>{product.tag}</span>}
                  <Image
                    src={product.imgs[activeImg]}
                    alt={product.name}
                    width={600}
                    height={750}
                    className={styles.img}
                    priority
                  />
                  <div className={styles.imgGlow} />
                </div>
              </div>
            </div>

            {/* ── Info ── */}
            <div className={styles.info}>
              {/* Header */}
              <div className={styles.infoHeader}>
                <p className={styles.family}>{product.family}</p>
                <h1 className={styles.name}>{product.name}</h1>
                <p className={styles.subtitle}>{product.subtitle}</p>
                <p className={styles.desc}>{product.description}</p>

                {product.slug === 'discover-box' && (
                  <div className={styles.discoverPerfumesBox}>
                    <div className={styles.discoverPerfumesTitle}>🌿 العطور المتضمنة داخل البوكس (5 × 10 مل):</div>
                    <div className={styles.discoverPerfumesGrid}>
                      <div className={styles.discoverItem}>
                        <span className={styles.discoverNum}>1</span>
                        <div className={styles.discoverMeta}>
                          <strong>Fortis Rex</strong>
                          <span>مستوحى من Invictus</span>
                        </div>
                      </div>
                      <div className={styles.discoverItem}>
                        <span className={styles.discoverNum}>2</span>
                        <div className={styles.discoverMeta}>
                          <strong>Marin Bleu</strong>
                          <span>مستوحى من Megamare</span>
                        </div>
                      </div>
                      <div className={styles.discoverItem}>
                        <span className={styles.discoverNum}>3</span>
                        <div className={styles.discoverMeta}>
                          <strong>Frost Line</strong>
                          <span>مستوحى من Pacific Chill</span>
                        </div>
                      </div>
                      <div className={styles.discoverItem}>
                        <span className={styles.discoverNum}>4</span>
                        <div className={styles.discoverMeta}>
                          <strong>Blanc Pur</strong>
                          <span>مستوحى من Lacoste White</span>
                        </div>
                      </div>
                      <div className={styles.discoverItem}>
                        <span className={styles.discoverNum}>5</span>
                        <div className={styles.discoverMeta}>
                          <strong>Mangue Épicée</strong>
                          <span>مستوحى من God of Fire</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              {product.numReviews > 0 && (
                <div className={styles.rating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < Math.round(product.rating) ? '#5aad78' : '#333', fontSize: '1rem' }}>★</span>
                  ))}
                  <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '6px' }}>({product.numReviews} reviews)</span>
                </div>
              )}

              {/* Notes preview */}
              <div className={styles.notesPills}>
                {product.notes.map(n => (
                  <span key={n} className={styles.notePill}>{n}</span>
                ))}
                <span className={styles.intensityPill}>{product.intensity}</span>
              </div>

              {/* Price */}
              <div className={styles.priceRow}>
                <span className={styles.price}>{product.price.toLocaleString()} EGP</span>
                <span className={styles.volume}>{product.volume}</span>
              </div>

              {/* Season / Occasion */}
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>SEASON</span>
                  <span className={styles.metaVal}>{product.season.join(' · ')}</span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>OCCASION</span>
                  <span className={styles.metaVal}>{product.occasion.join(' · ')}</span>
                </div>
              </div>

              {/* Qty + Add to cart + Favorite */}
              <div className={styles.actions}>
                <div className={styles.qty}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    id="qty-minus"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className={styles.qtyNum}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => q + 1)}
                    id="qty-plus"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <button
                  className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
                  onClick={handleAddToCart}
                  id="add-to-cart-btn"
                >
                  {added ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      ADDED TO CART!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      ADD TO CART
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className={styles.guarantees}>
                {[
                  { icon: '🔒', text: '256-Bit SSL Encrypted Checkout' },
                  { icon: '✨', text: 'Authentic luxury quality' },
                  { icon: '🌿', text: 'IFRA compliant ingredients' },
                ].map(g => (
                  <div key={g.text} className={styles.guarantee}>
                    <span className={styles.guaranteeIcon}>{g.icon}</span>
                    <span className={styles.guaranteeText}>{g.text}</span>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className={styles.tabs}>
                <div className={styles.tabList} role="tablist">
                  {(['description', 'notes', 'details'] as const).map(tab => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={activeTab === tab}
                      className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                      onClick={() => setActiveTab(tab)}
                      id={`tab-${tab}`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className={styles.tabContent}>
                  {activeTab === 'description' && (
                    <p className={styles.longDesc}>{product.longDescription}</p>
                  )}

                  {activeTab === 'notes' && (
                    <div className={styles.pyramid}>
                      {[
                        { label: 'TOP NOTES', notes: product.topNotes, icon: '🌬️' },
                        { label: 'HEART NOTES', notes: product.heartNotes, icon: '💚' },
                        { label: 'BASE NOTES', notes: product.baseNotes, icon: '🪨' },
                      ].map(row => (
                        <div key={row.label} className={styles.pyramidRow}>
                          <div className={styles.pyramidLabel}>
                            <span className={styles.pyramidIcon}>{row.icon}</span>
                            <span>{row.label}</span>
                          </div>
                          <div className={styles.pyramidNotes}>
                            {row.notes.map(n => (
                              <span key={n} className={styles.pyramidNote}>{n}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <table className={styles.detailsTable}>
                      <tbody>
                        {[
                          ['Volume', product.volume],
                          ['Concentration', product.slug === 'discover-box' ? 'Discovery Fragrance Set' : 'Extrait De Parfum'],
                          ['Olfactive Family', product.family],
                          ['Intensity', product.intensity],
                          ['Season', product.season.join(', ')],
                          ['Occasion', product.occasion.join(', ')],
                          ['Made in', 'Cairo, Egypt'],
                          ['Stock', `${product.stock} units`],
                        ].map(([key, val]) => (
                          <tr key={key} className={styles.detailRow}>
                            <td className={styles.detailKey}>{key}</td>
                            <td className={styles.detailVal}>{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
