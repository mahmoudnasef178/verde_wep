'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { translateNotes } from '@/app/lib/translations';
import { api, type ApiProduct } from '@/app/lib/api';
import { products as staticProducts } from '@/app/lib/products';
import styles from './ProductsSection.module.css';

function ProductCard({ product }: { product: ApiProduct }) {
  const [hovering, setHovering] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { t, locale } = useLanguage();

  const topNotes = translateNotes(product.topNotes, locale);
  const heartNotes = translateNotes(product.heartNotes, locale);
  const baseNotes = translateNotes(product.baseNotes, locale);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={styles.card}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      id={`product-card-${product._id}`}
    >
      <div className={styles.imgWrap}>
        {product.tag && (
          <span className={`${styles.tag} ${product.tag === 'NEW' ? styles.tagNew : ''}`}>
            {product.tag}
          </span>
        )}
        <Image
          src={product.img}
          alt={product.name}
          width={400}
          height={500}
          className={`${styles.img} ${hovering ? styles.imgHovered : ''}`}
        />
        <div className={`${styles.imgOverlay} ${hovering ? styles.overlayVisible : ''}`}>
          <div className={styles.pyramidCard}>
            <div className={styles.pyramidTitle}>{t.products.olfactoryPyramid}</div>
            
            {topNotes.length > 0 && (
              <div className={styles.pyramidLevel}>
                <span className={styles.levelTag}>{t.products.topNotes}</span>
                <span className={styles.levelNotes}>{topNotes.join(' · ')}</span>
              </div>
            )}

            {heartNotes.length > 0 && (
              <div className={styles.pyramidLevel}>
                <span className={styles.levelTag}>{t.products.heartNotes}</span>
                <span className={styles.levelNotes}>{heartNotes.join(' · ')}</span>
              </div>
            )}

            {baseNotes.length > 0 && (
              <div className={styles.pyramidLevel}>
                <span className={styles.levelTag}>{t.products.baseNotes}</span>
                <span className={styles.levelNotes}>{baseNotes.join(' · ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.infoTop}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.subtitle}>{product.subtitle}</p>
        </div>
        <div className={styles.infoBottom}>
          <span className={styles.price}>{product.price.toLocaleString()} EGP</span>
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
    </Link>
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
