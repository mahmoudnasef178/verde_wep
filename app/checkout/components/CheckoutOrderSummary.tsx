'use client';
import Image from 'next/image';
import styles from '../Checkout.module.css';
import { get10mlPrice, getSale10mlPrice, getSalePrice } from '@/app/lib/products';
import type { CartItem } from '@/app/context/CartContext';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  isAr: boolean;
  subtotal: number;
  shippingPrice: number;
  rawShippingPrice: number;
  isFreeShipping: boolean;
  appliedCoupon: { code: string; discountAmount: number } | null;
  couponInput: string;
  setCouponInput: (val: string) => void;
  handleApplyCoupon: (e: React.SyntheticEvent) => void | Promise<void>;
  handleRemoveCoupon: () => void;
  couponLoading: boolean;
  couponMessage: { type: 'success' | 'error'; text: string } | null;
  grandTotal: number;
  isSubmitting: boolean;
  orderError: string | null;
  t: {
    checkout: {
      orderItems: string;
      promoCodeTitle: string;
      promoCodePlaceholder: string;
      apply: string;
      applying: string;
      remove: string;
      subtotal: string;
      shippingFee?: string;
      couponDiscount: string;
      totalToPay: string;
      processingOrder: string;
      confirmOrder: string;
      sslSecurity: string;
    };
  };
}

export default function CheckoutOrderSummary({
  items,
  isAr,
  subtotal,
  shippingPrice,
  rawShippingPrice,
  isFreeShipping,
  appliedCoupon,
  couponInput,
  setCouponInput,
  handleApplyCoupon,
  handleRemoveCoupon,
  couponLoading,
  couponMessage,
  grandTotal,
  isSubmitting,
  orderError,
  t,
}: CheckoutOrderSummaryProps) {
  return (
    <div className={styles.summaryCol}>
      <div className={styles.summaryCard}>
        <h2 className={styles.summaryTitle}>{t.checkout.orderItems}</h2>

        <div className={styles.itemsScroll}>
          {items.map(({ product, quantity, size, price: itemPrice }) => {
            const is10ml = size === '10 ML';
            const fallbackPrice = is10ml
              ? (product.price10ml != null && Number(product.price10ml) > 0
                  ? Number(product.price10ml)
                  : getSale10mlPrice(get10mlPrice(product.price, product.slug)))
              : (product.originalPrice != null && Number(product.originalPrice) > 0
                  ? Number(product.price)
                  : getSalePrice(product.price));
            const unitPrice = itemPrice ?? fallbackPrice;
            const itemKey = `${product._id}_${size || '50ML'}`;
            const displaySubtitle = size ? `${size} — Extrait de Parfum` : product.subtitle;

            return (
              <div key={itemKey} className={styles.summaryItem}>
                <div className={styles.itemImgWrap}>
                  <Image src={product.img} alt={product.name} width={60} height={75} />
                  <span className={styles.itemBadge}>{quantity}</span>
                </div>
                <div className={styles.itemMeta}>
                  <h4>
                    {product.name} {size === '10 ML' ? <span style={{ fontSize: '0.75rem', color: '#5aad78' }}>({size})</span> : null}
                  </h4>
                  <p>{displaySubtitle}</p>
                </div>
                <span className={styles.itemPrice}>
                  {(unitPrice * quantity).toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
            );
          })}
        </div>

        <div className={styles.divider} />

        {/* Promo Code Section */}
        <div className={styles.couponBox}>
          <div className={styles.couponHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>{t.checkout.promoCodeTitle}</span>
          </div>

          {!appliedCoupon ? (
            <div className={styles.couponInputRow}>
              <div className={styles.couponInputWrap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <input
                  type="text"
                  placeholder={t.checkout.promoCodePlaceholder}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon(e as any);
                    }
                  }}
                  className={styles.couponInput}
                  disabled={couponLoading}
                  id="coupon-input"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className={styles.couponBtn}
                id="coupon-apply-btn"
              >
                {couponLoading ? t.checkout.applying : t.checkout.apply}
              </button>
            </div>
          ) : (
            <div className={styles.couponAppliedCard}>
              <div className={styles.couponAppliedInfo}>
                <span className={styles.couponTagBadge}>
                  🏷️ {appliedCoupon.code}
                </span>
                <span className={styles.couponDiscountSaved}>
                  -{appliedCoupon.discountAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className={styles.removeCouponBtn}
                title={t.checkout.remove}
              >
                {t.checkout.remove}
              </button>
            </div>
          )}

          {couponMessage && (
            <div className={couponMessage.type === 'success' ? styles.couponSuccessBanner : styles.couponErrorBanner}>
              {couponMessage.type === 'success' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
              <span>{couponMessage.text}</span>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Costs Breakdown */}
        <div className={styles.costs}>
          <div className={styles.costRow}>
            <span>{t.checkout.subtotal}</span>
            <span>{subtotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
          </div>

          <div className={styles.costRow}>
            <span>{t.checkout.shippingFee || (isAr ? 'مصاريف الشحن' : 'Shipping Fee')}</span>
            {isFreeShipping ? (
              <span style={{ color: '#4ade80', fontWeight: 600 }}>
                {rawShippingPrice > 0 && (
                  <span style={{ textDecoration: 'line-through', opacity: 0.6, margin: '0 6px' }}>
                    {rawShippingPrice} {isAr ? 'ج.م' : 'EGP'}
                  </span>
                )}
                {isAr ? 'شحن مجاني 🚚' : 'FREE 🚚'}
              </span>
            ) : (
              <span>{shippingPrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
            )}
          </div>

          {appliedCoupon && (
            <div className={`${styles.costRow} ${styles.discountRow}`}>
              <span>{t.checkout.couponDiscount} ({appliedCoupon.code})</span>
              <span>-{appliedCoupon.discountAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
            </div>
          )}

          <div className={`${styles.costRow} ${styles.grandTotalRow}`}>
            <span>{t.checkout.totalToPay}</span>
            <span>{grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.placeOrderBtn}
          id="checkout-submit-btn"
        >
          {isSubmitting ? (
            t.checkout.processingOrder
          ) : (
            <>{t.checkout.confirmOrder} · {grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}</>
          )}
        </button>

        {orderError && (
          <p style={{ color: '#e05c5c', textAlign: 'center', fontSize: '0.85rem', marginTop: '12px' }}>
            ⚠️ {orderError}
          </p>
        )}

        <div className={styles.securityFooter}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5aad78" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>{t.checkout.sslSecurity}</span>
        </div>
      </div>
    </div>
  );
}
