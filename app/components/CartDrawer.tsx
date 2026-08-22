'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const router = useRouter();



  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, closeDrawer]);

  const handleCheckoutClick = () => {
    closeDrawer();
    router.push('/checkout');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeDrawer} id="cart-drawer-overlay">
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.icon}>🛍️</span>
            <h2>YOUR CART</h2>
            <span className={styles.badge}>{totalItems}</span>
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Close cart" id="cart-drawer-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>



        {/* Cart Items List */}
        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🌿</div>
              <p className={styles.emptyTitle}>Your cart is empty</p>
              <p className={styles.emptySub}>Discover our handcrafted luxury fragrances and add your favorite scent.</p>
              <Link href="/#products" onClick={closeDrawer} className={styles.emptyBtn}>
                EXPLORE COLLECTION
              </Link>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product._id} className={styles.item} id={`cart-item-${product._id}`}>
                <Link href={`/products/${product.slug}`} onClick={closeDrawer} className={styles.itemImgWrap}>
                  <Image src={product.img} alt={product.name} width={90} height={115} className={styles.itemImg} />
                </Link>

                <div className={styles.itemDetails}>
                  <div className={styles.itemTop}>
                    <div>
                      <Link href={`/products/${product.slug}`} onClick={closeDrawer} className={styles.itemName}>
                        {product.name}
                      </Link>
                      <p className={styles.itemVolume}>{product.subtitle}</p>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(product._id)}
                      aria-label={`Remove ${product.name}`}
                      id={`remove-item-${product._id}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>

                  <div className={styles.itemBottom}>
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className={styles.qtyNum}>{quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className={styles.itemPrice}>{(product.price * quantity).toLocaleString()} EGP</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>SUBTOTAL</span>
              <span className={styles.subtotalVal}>{subtotal.toLocaleString()} EGP</span>
            </div>
            <p className={styles.taxNote}>Taxes and shipping calculated at checkout</p>

            <div className={styles.footerActions}>
              <Link href="/cart" onClick={closeDrawer} className={styles.viewCartBtn} id="cart-drawer-view-page">
                VIEW CART PAGE
              </Link>
              <button
                className={styles.checkoutBtn}
                onClick={handleCheckoutClick}
                id="cart-drawer-checkout"
              >
                CHECKOUT · {subtotal.toLocaleString()} EGP
              </button>
              <div className={styles.sslSecurityNote}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5aad78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>🔒 256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
