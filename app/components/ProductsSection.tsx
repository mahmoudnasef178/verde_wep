'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { translateNotes, translateTag } from '@/app/lib/translations';
import { api, type ApiProduct } from '@/app/lib/api';
import { products as staticProducts } from '@/app/lib/products';
import styles from './ProductsSection.module.css';

const PYRAMID_IMAGES: Record<string, string> = {
  'fortis-rex': '/pyramids/fortis-rex.jpg',
  'sultan-dore': '/pyramids/sultan-dore.jpg',
  'marin-bleu': '/pyramids/marin-bleu.jpg',
  'marin-blue': '/pyramids/marin-bleu.jpg',
  'frost-line': '/pyramids/frost-line.jpg',
  'blanc-pur': '/pyramids/blanc-pur.jpg',
  'mangue-epicee': '/pyramids/mangue-epicee.jpg',
};

function ProductCard({ product }: { product: ApiProduct }) {
  const [hovering, setHovering] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { t, locale, isAr } = useLanguage();

  const topNotes = translateNotes(product.topNotes, locale);
  const heartNotes = translateNotes(product.heartNotes, locale);
  const baseNotes = translateNotes(product.baseNotes, locale);

  const hasPyramid = topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0;
  const pyramidImg = PYRAMID_IMAGES[product.slug];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      id={`product-card-${product._id}`}
    >
      <Link
        href={`/products/${product.slug}`}
        className={styles.imgWrap}
        aria-label={`View ${product.name}`}
      >
        {product.tag && (
          <span className={`${styles.tag} ${product.tag === 'NEW' ? styles.tagNew : ''}`}>
            {translateTag(product.tag, locale)}
          </span>
        )}
        <Image
          src={product.img}
          alt={`عطر ${product.name} الفاخر من VERDE Perfumes`}
          width={400}
          height={500}
          loading="lazy"
          sizes="(max-width: 480px) 47vw, (max-width: 960px) 33vw, 22vw"
          className={`${styles.img} ${hovering ? styles.imgHovered : ''}`}
        />

        {hasPyramid && (
          <div className={`${styles.imgOverlay} ${hovering ? styles.overlayVisible : ''}`}>
            {/* Pyramid Visual + Notes Grid */}
            <div className={styles.pyramidLayout}>
              {/* Left Column: Sliced Pyramid */}
              <div className={styles.pyramidVisualCol}>
                {pyramidImg ? (
                  <img
                    src={pyramidImg}
                    alt={`${product.name} Olfactory Pyramid`}
                    className={styles.pyramidImg}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.pyramidSvgFallback}>
                    <svg viewBox="0 0 100 100" className={styles.pyramidSvg}>
                      <polygon points="50,6 26,45 74,45" fill="rgba(90, 173, 120, 0.4)" stroke="#3d8b5c" strokeWidth="1" />
                      <polygon points="25,48 10,75 90,75 75,48" fill="rgba(42, 107, 65, 0.45)" stroke="#3d8b5c" strokeWidth="1" />
                      <polygon points="9,78 0,98 100,98 91,78" fill="rgba(26, 74, 46, 0.5)" stroke="#3d8b5c" strokeWidth="1" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Right Column: 3-Tier Notes List */}
              <div className={styles.pyramidNotesCol}>
                {topNotes.length > 0 && (
                  <div className={styles.tierBlock}>
                    <div className={styles.tierTitle}>
                      {t.products.topNotesClean || (isAr ? 'القمة العطرية' : 'Top Notes')}
                    </div>
                    <div className={styles.tierDesc}>
                      {topNotes.join(isAr ? '، ' : ', ')}
                    </div>
                  </div>
                )}

                {heartNotes.length > 0 && (
                  <div className={styles.tierBlock}>
                    <div className={styles.tierTitle}>
                      {t.products.heartNotesClean || (isAr ? 'قلب العطر' : 'Heart Notes')}
                    </div>
                    <div className={styles.tierDesc}>
                      {heartNotes.join(isAr ? '، ' : ', ')}
                    </div>
                  </div>
                )}

                {baseNotes.length > 0 && (
                  <div className={styles.tierBlock}>
                    <div className={styles.tierTitle}>
                      {t.products.baseNotesClean || (isAr ? 'القاعدة العطرية' : 'Base Notes')}
                    </div>
                    <div className={styles.tierDesc}>
                      {baseNotes.join(isAr ? '، ' : ', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Pill Button */}
            <div className={styles.quickAddWrap}>
              <button
                type="button"
                className={`${styles.quickAddBtn} ${added ? styles.quickAddBtnAdded : ''}`}
                onClick={handleAddToCart}
                aria-label={`Quick add ${product.name} to cart`}
              >
                {added ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t.products.added || (isAr ? 'تمت الإضافة' : 'Added')}</span>
                  </>
                ) : (
                  <>
                    <span className={styles.quickAddPlus}>+</span>
                    <span>{t.products.quickAdd || (isAr ? 'إضافة سريعة' : 'Quick add')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Link>

      <div className={styles.info}>
        <div className={styles.infoTop}>
          <Link href={`/products/${product.slug}`} className={styles.nameLink}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>
          <p className={styles.subtitle}>{product.subtitle}</p>
        </div>
        <div className={styles.infoBottom}>
          <span className={styles.price}>{product.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
          <button
            className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
            id={`add-to-cart-${product._id}`}
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {t.products.added}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t.products.add}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Map static products to ApiProduct shape as fallback
function mapStatic(): ApiProduct[] {
  return staticProducts.map(p => ({
    ...p,
    _id: String(p.id),
    rating: 0,
    numReviews: 0,
    stock: 99,
    reviews: [],
  }));
}

export default function ProductsSection() {
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.getProducts();
      const validSlugs = staticProducts.map(p => p.slug);
      const matched = res.data?.filter(p => validSlugs.includes(p.slug));
      if (matched && matched.length > 0) {
        setApiProducts(matched);
      } else {
        setApiProducts(mapStatic());
      }
    } catch {
      setApiProducts(mapStatic());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <section className={styles.section} id="products">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t.products.eyebrow}</p>
          <h2 className={styles.heading}>
            {t.products.heading}
          </h2>
          <p className={styles.subheading}>
            {t.products.subheading}
          </p>
        </div>

        <div className={styles.grid}>
          {loading
            ? mapStatic().map(p => <ProductCard key={p._id} product={p} />)
            : apiProducts.map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </div>
    </section>
  );
}
