'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { translateNotes, translateFamily } from '@/app/lib/translations';
import { api } from '@/app/lib/api';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from './CartPage.module.css';

export default function CartPageClient() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const { t, locale, isAr } = useLanguage();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const grandTotal = Math.max(0, subtotal - discount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    try {
      const res = await api.validateCoupon(clean, subtotal);
      if (res.success && res.coupon) {
        setDiscount(res.coupon.discountAmount);
        setPromoSuccess(
          isAr
            ? `تم تفعيل كود الخصم (${res.coupon.code}) بنجاح! وفرت ${res.coupon.discountAmount.toLocaleString()} ج.م.`
            : `Coupon code (${res.coupon.code}) applied! Saved ${res.coupon.discountAmount.toLocaleString()} EGP.`
        );
      } else {
        setPromoError(res.message || (isAr ? 'كود الخصم غير صالح' : 'Invalid promo code'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isAr ? 'كود الخصم غير صالح أو انتهت صلاحيته' : 'Invalid or expired promo code');
      setPromoError(msg);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        {/* Header Banner */}
        <section className={styles.banner}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{t.cartPage.eyebrow}</p>
            <h1 className={styles.heading}>{t.cartPage.heading}</h1>
          </div>
        </section>

        {/* Content */}
        <section className={styles.content}>
          <div className={styles.container}>
            {items.length === 0 ? (
              <div className={styles.emptyCard}>
                <div className={styles.emptyIcon}>🌿</div>
                <h2 className={styles.emptyTitle}>{t.cartPage.empty}</h2>
                <p className={styles.emptyDesc}>
                  {t.cartPage.emptySub}
                </p>
                <Link href="/#products" className={styles.shopBtn} id="cart-empty-shop-btn">
                  {t.cartPage.browseCollection}
                </Link>
              </div>
            ) : (
              <div className={styles.grid}>
                {/* ── Left Column: Items Table ── */}
                <div className={styles.itemsCol}>
                  <div className={styles.colHeader}>
                    <span className={styles.colHeaderTitle}>{t.cartPage.items} ({totalItems})</span>
                    <button className={styles.clearBtn} onClick={clearCart} id="cart-clear-all">
                      {t.cartPage.clearAll}
                    </button>
                  </div>

                  <div className={styles.itemsList}>
                    {items.map(({ product, quantity }) => (
                      <div key={product._id} className={styles.itemCard} id={`cart-page-item-${product._id}`}>
                        <Link href={`/products/${product.slug}`} className={styles.imgWrap}>
                          <Image src={product.img} alt={product.name} width={110} height={140} className={styles.img} />
                        </Link>

                        <div className={styles.itemInfo}>
                          <div className={styles.itemMain}>
                            <div>
                              <p className={styles.itemFamily}>{translateFamily(product.family, locale)}</p>
                              <Link href={`/products/${product.slug}`} className={styles.itemName}>
                                {product.name}
                              </Link>
                              <p className={styles.itemVol}>{product.subtitle}</p>
                            </div>
                            <span className={styles.unitPrice}>
                              {product.price.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            </span>
                          </div>

                          <div className={styles.itemNotes}>
                            {translateNotes(product.notes, locale).map(n => (
                              <span key={n} className={styles.noteTag}>{n}</span>
                            ))}
                          </div>

                          <div className={styles.itemActions}>
                            <div className={styles.qtyBox}>
                              <button
                                className={styles.qtyBtn}
                                onClick={() => updateQuantity(product._id, quantity - 1)}
                                aria-label="Decrease quantity"
                              >−</button>
                              <span className={styles.qtyNum}>{quantity}</span>
                              <button
                                className={styles.qtyBtn}
                                onClick={() => updateQuantity(product._id, quantity + 1)}
                                aria-label="Increase quantity"
                              >+</button>
                            </div>

                            <span className={styles.itemTotal}>
                              {(product.price * quantity).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                            </span>

                            <button
                              className={styles.removeBtn}
                              onClick={() => removeFromCart(product._id)}
                              aria-label={`Remove ${product.name}`}
                              id={`cart-page-remove-${product._id}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.continueWrap}>
                    <Link href="/#products" className={styles.continueLink}>
                      {isAr ? '→' : '←'} {t.cartPage.continueShopping}
                    </Link>
                  </div>
                </div>

                {/* ── Right Column: Order Summary ── */}
                <div className={styles.summaryCol}>
                  <div className={styles.summaryCard}>
                    <h2 className={styles.summaryTitle}>{t.cartPage.orderSummary}</h2>

                    {/* Cost Breakdown */}
                    <div className={styles.breakdown}>
                      <div className={styles.row}>
                        <span className={styles.rowLabel}>{t.cartPage.subtotal}</span>
                        <span className={styles.rowVal}>{subtotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                      </div>

                      {discount > 0 && (
                        <div className={`${styles.row} ${styles.rowDiscount}`}>
                          <span className={styles.rowLabel}>{t.cartPage.discount}</span>
                          <span className={styles.rowVal}>−{discount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                        </div>
                      )}
                    </div>

                    {/* Promo Code Form */}
                    <form className={styles.promoForm} onSubmit={handleApplyPromo}>
                      <div className={styles.promoInputWrap}>
                        <input
                          type="text"
                          placeholder={t.cartPage.promoPlaceholder}
                          className={styles.promoInput}
                          value={promoCode}
                          onChange={e => setPromoCode(e.target.value.toUpperCase())}
                          id="cart-promo-input"
                        />
                        <button type="submit" className={styles.promoBtn} id="cart-promo-submit">
                          {t.cartPage.apply}
                        </button>
                      </div>
                      {promoError && <p className={styles.promoErr}>{promoError}</p>}
                      {promoSuccess && <p className={styles.promoOk}>{promoSuccess}</p>}
                    </form>

                    <div className={styles.divider} />

                    {/* Total */}
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>{t.cartPage.total}</span>
                      <span className={styles.totalVal}>{grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
                    </div>

                    {/* Checkout Button */}
                    <button
                      className={styles.checkoutBtn}
                      onClick={() => router.push('/checkout')}
                      id="cart-page-checkout-btn"
                    >
                      {t.cartPage.proceedCheckout}
                    </button>

                    {/* Payment methods icons */}
                    <div className={styles.paymentBadgesRow}>
                      <span>{t.cartPage.cash}</span>
                      <span>{t.cartPage.visa}</span>
                      <span>{t.cartPage.vodafoneWallet}</span>
                      <span>{t.cartPage.valu}</span>
                    </div>

                    {/* Secure Badges */}
                    <div className={styles.secureBox}>
                      <div className={styles.secureItem}>
                        <span>🔒</span>
                        <span>{t.cartPage.ssl}</span>
                      </div>
                      <div className={styles.secureItem}>
                        <span>🚚</span>
                        <span>{t.cartPage.shipping}: {t.cartPage.shippingFree}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
