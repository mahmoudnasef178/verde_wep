'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import CountdownBanner from '@/app/components/CountdownBanner';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { trackMeta } from '@/lib/meta';
import type { ApiProduct } from '@/app/lib/api';
import {
  products as staticProducts,
  get10mlPrice,
  getFakeOriginalPrice,
  getSalePrice,
  getFakeOriginal10mlPrice,
  getSale10mlPrice,
} from '@/app/lib/products';
import {
  translateSeason,
  translateOccasion,
  translateFamily,
  translateIntensity,
  translateNotes,
} from '@/app/lib/translations';

import ProductGallery from './components/ProductGallery';
import DiscoverBoxItems from './components/DiscoverBoxItems';
import ProductTabs from './components/ProductTabs';
import styles from './ProductPage.module.css';

interface Props {
  product: ApiProduct;
  related?: ApiProduct[];
}

export default function ProductPageClient({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { t, locale, isAr } = useLanguage();
  const inStock = product.inStock !== false;

  const isDiscoverBox = product.slug === 'discover-box' || product.slug === 'winter-discover-box';
  const isWinterBox = product.slug === 'winter-discover-box';
  const [selectedSize, setSelectedSize] = useState<'50 ML' | '10 ML'>('50 ML');
  const is10mlSelected = !isDiscoverBox && selectedSize === '10 ML';

  // ── Pricing calculations ──
  const effectiveSellingPrice = is10mlSelected
    ? (product.price10ml != null && Number(product.price10ml) > 0
        ? Number(product.price10ml)
        : getSale10mlPrice(get10mlPrice(product.price, product.slug)))
    : (product.originalPrice != null && Number(product.originalPrice) > 0
        ? Number(product.price)
        : getSalePrice(product.price));

  const fakeOriginalPrice = is10mlSelected
    ? (product.originalPrice10ml != null && Number(product.originalPrice10ml) > 0
        ? Number(product.originalPrice10ml)
        : getFakeOriginal10mlPrice(product.price10ml != null && Number(product.price10ml) > 0 ? Number(product.price10ml) : get10mlPrice(product.price, product.slug)))
    : (product.originalPrice != null && Number(product.originalPrice) > 0
        ? Number(product.originalPrice)
        : getFakeOriginalPrice(product.price));

  const currentPrice = effectiveSellingPrice;
  const currentVolume = is10mlSelected ? '10 ML' : (product.volume || '50 ML');

  // ── Gallery Images ──
  const galleryImages = useMemo(() => {
    if (product.imgs && product.imgs.length > 1) {
      return product.imgs;
    }
    const staticMatch = staticProducts.find((p) => p.slug === product.slug);
    if (staticMatch?.imgs && staticMatch.imgs.length > 1) {
      return staticMatch.imgs;
    }
    return product.img ? [product.img] : [];
  }, [product.imgs, product.slug, product.img]);

  const lastTrackedView = useRef<string>('');

  // ── Meta Pixel + CAPI: ViewContent (exact variant ID for 50 ML vs 10 ML) ──
  useEffect(() => {
    const activeSize = isDiscoverBox ? (product.volume || '5 x 10 ML') : selectedSize;
    const key = `${product.slug}:${activeSize}:${currentPrice}`;
    if (lastTrackedView.current === key) return;
    lastTrackedView.current = key;

    trackMeta('ViewContent', {
      products: [
        {
          id: product._id,
          slug: product.slug,
          size: activeSize,
          quantity: 1,
          price: currentPrice,
        },
      ],
      value: currentPrice,
      currency: 'EGP',
      extra: {
        content_name: selectedSize === '10 ML' && !isDiscoverBox ? `${product.name} (10 ML)` : product.name,
      },
    });
  }, [product._id, product.name, currentPrice, product.slug, product.volume, selectedSize, isDiscoverBox]);

  // ── Translations & notes ──
  const effectiveNotes = isDiscoverBox ? [] : (product.notes || []);
  const effectiveTopNotes = isDiscoverBox ? [] : (product.topNotes || []);
  const effectiveHeartNotes = isDiscoverBox ? [] : (product.heartNotes || []);
  const effectiveBaseNotes = isDiscoverBox ? [] : (product.baseNotes || []);

  const translatedSeasons = translateSeason(product.season, locale);
  const translatedOccasions = translateOccasion(product.occasion, locale);
  const translatedFamily = translateFamily(product.family, locale);
  const translatedIntensity = translateIntensity(product.intensity, locale);
  const translatedNotesList = translateNotes(effectiveNotes, locale);

  const hasNotes = !isDiscoverBox && (effectiveNotes.length > 0 || effectiveTopNotes.length > 0);

  const handleAddToCart = () => {
    if (!inStock) return;
    const finalSize = isDiscoverBox ? (product.volume || '5 x 10 ML') : selectedSize;
    addToCart(product, qty, finalSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <AnnouncementBar />
      <CountdownBanner />
      <Navbar />
      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className={styles.breadcrumbInner}>
            <Link href="/" className={styles.breadcrumbLink}>{t.productPage.home}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <Link href="/#products" className={styles.breadcrumbLink}>{t.productPage.shop}</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{product.name}</span>
          </div>
        </div>

        {/* Product layout */}
        <section className={styles.product}>
          <div className={styles.container}>
            {/* ── Product Image Gallery (Modular Component) ── */}
            <ProductGallery
              galleryImages={galleryImages}
              productName={product.name}
              productTag={product.tag}
              locale={locale}
            />

            {/* ── Product Info ── */}
            <div className={styles.info}>
              {/* Header */}
              <div className={styles.infoHeader}>
                <p className={styles.family}>{translatedFamily}</p>
                <h1 className={styles.name}>{product.name}</h1>
                <p className={styles.subtitle}>{product.subtitle}</p>
                <p className={styles.desc}>{product.description}</p>

                {isDiscoverBox && (
                  <DiscoverBoxItems
                    isWinterBox={isWinterBox}
                    isAr={isAr}
                    inspiredByText={t.productPage.inspiredBy}
                  />
                )}
              </div>

              {/* Rating */}
              {product.numReviews > 0 && (
                <div className={styles.rating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < Math.round(product.rating) ? '#5aad78' : '#333', fontSize: '1rem' }}>★</span>
                  ))}
                  <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '6px' }}>
                    ({product.numReviews} {t.products.reviews})
                  </span>
                </div>
              )}

              {/* Notes pills preview */}
              {!isDiscoverBox && translatedNotesList.length > 0 && (
                <div className={styles.notesPills}>
                  {translatedNotesList.map((n) => (
                    <span key={n} className={styles.notePill}>{n}</span>
                  ))}
                  <span className={styles.intensityPill}>{translatedIntensity}</span>
                </div>
              )}

              {/* Size Selector */}
              {!isDiscoverBox && (
                <div className={styles.sizeSection}>
                  <div className={styles.sizeHeader}>
                    <span className={styles.sizeLabel}>{isAr ? 'الحجم:' : 'Size:'}</span>
                  </div>
                  <div className={styles.sizeButtonsRow}>
                    <button
                      type="button"
                      className={`${styles.sizePillBtn} ${selectedSize === '50 ML' ? styles.sizePillBtnActive : ''}`}
                      onClick={() => setSelectedSize('50 ML')}
                      aria-label="50 ML"
                    >
                      {isAr ? '50 مل' : '50 ML'}
                    </button>
                    <button
                      type="button"
                      className={`${styles.sizePillBtn} ${selectedSize === '10 ML' ? styles.sizePillBtnActive : ''}`}
                      onClick={() => setSelectedSize('10 ML')}
                      aria-label="10 ML"
                    >
                      {isAr ? '10 مل' : '10 ML'}
                    </button>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className={styles.priceRow}>
                {fakeOriginalPrice && (
                  <span className={styles.fakeOriginalPrice}>
                    {fakeOriginalPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                )}
                <span className={styles.price}>{currentPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                <span className={styles.volume}>{currentVolume}</span>
                {!inStock && (
                  <span className={styles.outOfStockPill}>
                    ● {t.productPage.outOfStock || (isAr ? 'نفد من المخزون' : 'OUT OF STOCK')}
                  </span>
                )}
              </div>

              {/* Season / Occasion */}
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t.productPage.season}</span>
                  <span className={styles.metaVal}>{translatedSeasons.join(' · ')}</span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t.productPage.occasion}</span>
                  <span className={styles.metaVal}>{translatedOccasions.join(' · ')}</span>
                </div>
              </div>

              {/* Qty + Add to cart */}
              <div className={styles.actions}>
                <div className={`${styles.qty} ${!inStock ? styles.qtyDisabled : ''}`}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => inStock && setQty((q) => Math.max(1, q - 1))}
                    disabled={!inStock}
                    id="qty-minus"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className={styles.qtyNum}>{inStock ? qty : 0}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => inStock && setQty((q) => q + 1)}
                    disabled={!inStock}
                    id="qty-plus"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
                <button
                  className={`${styles.addBtn} ${!inStock ? styles.addBtnDisabled : added ? styles.addBtnAdded : ''}`}
                  onClick={inStock ? handleAddToCart : undefined}
                  disabled={!inStock}
                  id="add-to-cart-btn"
                >
                  {!inStock ? (
                    <span>{t.productPage.outOfStock || (isAr ? 'نفد من المخزون' : 'OUT OF STOCK')}</span>
                  ) : added ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {t.productPage.addedToCart}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      {t.productPage.addToCart}
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className={styles.guarantees}>
                {[
                  { icon: '🔒', text: t.productPage.sslGuarantee },
                  { icon: '✨', text: t.productPage.authenticGuarantee },
                  { icon: '🌿', text: t.productPage.ifraGuarantee },
                ].map((g) => (
                  <div key={g.text} className={styles.guarantee}>
                    <span className={styles.guaranteeIcon}>{g.icon}</span>
                    <span className={styles.guaranteeText}>{g.text}</span>
                  </div>
                ))}
              </div>

              {/* Tabs Section (Modular Component) */}
              <ProductTabs
                longDescription={product.longDescription}
                currentVolume={currentVolume}
                isDiscoverBox={isDiscoverBox}
                hasNotes={hasNotes}
                effectiveTopNotes={effectiveTopNotes}
                effectiveHeartNotes={effectiveHeartNotes}
                effectiveBaseNotes={effectiveBaseNotes}
                translatedFamily={translatedFamily}
                translatedIntensity={translatedIntensity}
                translatedSeasons={translatedSeasons}
                translatedOccasions={translatedOccasions}
                stock={product.stock}
                locale={locale}
                t={t}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
