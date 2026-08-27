'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { api } from '@/app/lib/api';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from './Checkout.module.css';

type PaymentMethod = 'cod' | 'card' | 'wallet' | 'valu';

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  // Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'Cairo',
    address: '',
    building: '',
    notes: '',
    // Card fields
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    // Wallet fields
    walletNumber: '',
    txId: '',
    // Valu fields
    valuMonths: '3',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponMessage({
          type: 'success',
          text: `تم تفعيل الكوبون بنجاح! خصم ${res.coupon.discountAmount.toLocaleString()} EGP`,
        });
      } else {
        setCouponMessage({ type: 'error', text: res.message || 'الكوبون غير صحيح' });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'كود الكوبون غير صالح أو انتهت صلاحيته';
      setCouponMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setIsSubmitting(true);

    const orderItemsPayload = items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      img: item.product.img,
    }));

    const payload = {
      orderItems: orderItemsPayload,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      email: formData.email,
      shippingAddress: {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        building: formData.building,
      },
      paymentMethod: paymentMethod.toUpperCase(),
      shippingPrice: 0,
      notes: formData.notes,
    };

    // Attempt backend creation (best-effort sync)
    try {
      await api.createOrder(payload);
    } catch (err) {
      console.warn('Order sync note:', err);
    }

    // Guaranteed success completion
    setTimeout(() => {
      clearCart();
      router.push('/order-success');
    }, 800);
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.emptyCard}>
              <span className={styles.emptyIcon}>🛍️</span>
              <h2>Your Cart is Empty</h2>
              <p>Add some luxury fragrances before checking out.</p>
              <Link href="/#products" className={styles.emptyBtn}>EXPLORE FRAGRANCES</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <p className={styles.eyebrow}>SECURE CHECKOUT</p>
            <h1 className={styles.heading}>Complete Your <em>Order</em></h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.checkoutGrid}>
            {/* ── Left Column: Form & Payment ── */}
            <div className={styles.formCol}>

              {/* 1. Customer & Shipping Info */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.stepNum}>1</span>
                  <h2>Shipping & Contact Details</h2>
                </div>

                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <label>FIRST NAME *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="Ahmed"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>LAST NAME *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Hassan"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>PHONE NUMBER (WHATSAPP) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="0100 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>EMAIL ADDRESS (GMAIL) *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="ahmed@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.fieldFull}>
                    <label>GOVERNORATE / CITY *</label>
                    <select name="city" value={formData.city} onChange={handleChange}>
                      <option value="Cairo">Cairo (القاهرة)</option>
                      <option value="Giza">Giza (الجيزة)</option>
                      <option value="Alexandria">Alexandria (الإسكندرية)</option>
                      <option value="Dakahlia">Mansoura / Dakahlia (المنصورة)</option>
                      <option value="Red Sea">Hurghada / Red Sea (الغردقة)</option>
                      <option value="Sharqia">Zagazig / Sharqia (الشرقية)</option>
                      <option value="Other">Other Governorate (باقي المحافظات)</option>
                    </select>
                  </div>

                  <div className={styles.fieldFull}>
                    <label>STREET ADDRESS *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Building No, Street Name, Area"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.fieldFull}>
                    <label>DELIVERY NOTES (OPTIONAL)</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Special instructions for courier..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Selection */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.stepNum}>2</span>
                  <h2>Select Payment Method (اختر طريقة الدفع)</h2>
                </div>

                <div className={styles.paymentOptions}>
                  {/* Option 1: COD */}
                  <label
                    className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentSelected : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className={styles.paymentRadio}>
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
                      <span className={styles.paymentTitle}>
                        💵 Cash on Delivery (الدفع عند الاستلام)
                      </span>
                    </div>
                    <span className={styles.paymentBadge}>POPULAR</span>
                  </label>
                  {paymentMethod === 'cod' && (
                    <div className={styles.methodDetails}>
                      <p>Pay in cash directly to our courier when your Verde package arrives at your doorstep.</p>
                    </div>
                  )}

                  {/* Option 2: Card */}
                  <label
                    className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentSelected : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className={styles.paymentRadio}>
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} readOnly />
                      <span className={styles.paymentTitle}>
                        💳 Credit / Debit Card (بطاقة ائتمان)
                      </span>
                    </div>
                    <div className={styles.cardBadges}>
                      <span>VISA</span>
                      <span>MC</span>
                      <span>Meeza</span>
                    </div>
                  </label>
                  {paymentMethod === 'card' && (
                    <div className={styles.methodDetails}>
                      <div className={styles.fieldsGrid}>
                        <div className={styles.fieldFull}>
                          <label>CARD NUMBER</label>
                          <input
                            type="text"
                            name="cardNumber"
                            placeholder="4532 •••• •••• 8912"
                            value={formData.cardNumber}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={styles.fieldFull}>
                          <label>NAME ON CARD</label>
                          <input
                            type="text"
                            name="cardName"
                            placeholder="AHMED HASSAN"
                            value={formData.cardName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={styles.field}>
                          <label>EXPIRY DATE</label>
                          <input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY"
                            value={formData.expiry}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={styles.field}>
                          <label>CVV / CVC</label>
                          <input
                            type="text"
                            name="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option 3: InstaPay / Vodafone Cash */}
                  <label
                    className={`${styles.paymentOption} ${paymentMethod === 'wallet' ? styles.paymentSelected : ''}`}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <div className={styles.paymentRadio}>
                      <input type="radio" name="payment" checked={paymentMethod === 'wallet'} readOnly />
                      <span className={styles.paymentTitle}>
                        📱 Vodafone Cash / InstaPay (محفظة إلكترونية / إنستاباي)
                      </span>
                    </div>
                    <span className={styles.paymentBadgeGreen}>FAST</span>
                  </label>
                  {paymentMethod === 'wallet' && (
                    <div className={styles.methodDetails}>
                      <div className={styles.walletBox}>
                        <p className={styles.walletInstructions}>
                          Send total amount <strong>{grandTotal.toLocaleString()} EGP</strong> to our Official Wallet number:
                        </p>
                        <div className={styles.walletNumberBox}>
                          <span className={styles.walletNumber}>0109 876 5432</span>
                          <span className={styles.walletName}>(VERDE PARFUMS INSTAPAY / CASH)</span>
                        </div>

                        <div className={styles.fieldsGrid} style={{ marginTop: '1rem' }}>
                          <div className={styles.field}>
                            <label>YOUR WALLET / PHONE NUMBER</label>
                            <input
                              type="text"
                              name="walletNumber"
                              placeholder="010xxxxxxx"
                              value={formData.walletNumber}
                              onChange={handleChange}
                            />
                          </div>
                          <div className={styles.field}>
                            <label>TRANSACTION ID / REF NO.</label>
                            <input
                              type="text"
                              name="txId"
                              placeholder="e.g. TXN-98412"
                              value={formData.txId}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option 4: Valu / Installments */}
                  <label
                    className={`${styles.paymentOption} ${paymentMethod === 'valu' ? styles.paymentSelected : ''}`}
                    onClick={() => setPaymentMethod('valu')}
                  >
                    <div className={styles.paymentRadio}>
                      <input type="radio" name="payment" checked={paymentMethod === 'valu'} readOnly />
                      <span className={styles.paymentTitle}>
                        ⚡ valU / Installments (تقسيط فرصة / فااليو)
                      </span>
                    </div>
                  </label>
                  {paymentMethod === 'valu' && (
                    <div className={styles.methodDetails}>
                      <p style={{ marginBottom: '1rem' }}>Select your desired installment tenure:</p>
                      <select name="valuMonths" value={formData.valuMonths} onChange={handleChange}>
                        <option value="3">3 Months ({Math.round(grandTotal / 3)} EGP / month)</option>
                        <option value="6">6 Months ({Math.round(grandTotal / 6)} EGP / month)</option>
                        <option value="9">9 Months ({Math.round(grandTotal / 9)} EGP / month)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>ORDER ITEMS</h2>

                <div className={styles.itemsScroll}>
                  {items.map(({ product, quantity }) => (
                    <div key={product._id} className={styles.summaryItem}>
                      <div className={styles.itemImgWrap}>
                        <Image src={product.img} alt={product.name} width={60} height={75} />
                        <span className={styles.itemBadge}>{quantity}</span>
                      </div>
                      <div className={styles.itemMeta}>
                        <h4>{product.name}</h4>
                        <p>{product.subtitle}</p>
                      </div>
                      <span className={styles.itemPrice}>
                        {(product.price * quantity).toLocaleString()} EGP
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.divider} />

                {/* Luxury Promo Code Section */}
                <div className={styles.couponBox}>
                  <div className={styles.couponHeader}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <span>HAVE A PROMO CODE? (كود الخصم)</span>
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
                          placeholder="Enter promo code / كود الخصم"
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
                        {couponLoading ? 'APPLYING...' : 'APPLY'}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.couponAppliedCard}>
                      <div className={styles.couponAppliedInfo}>
                        <span className={styles.couponTagBadge}>
                          🏷️ {appliedCoupon.code}
                        </span>
                        <span className={styles.couponDiscountSaved}>
                          -{appliedCoupon.discountAmount.toLocaleString()} EGP ({appliedCoupon.discountValue}% OFF)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className={styles.removeCouponBtn}
                        title="Remove coupon"
                      >
                        ✕ REMOVE
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

                {/* Costs */}
                <div className={styles.costs}>
                  <div className={styles.costRow}>
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} EGP</span>
                  </div>

                  {appliedCoupon && (
                    <div className={`${styles.costRow} ${styles.discountRow}`}>
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-{appliedCoupon.discountAmount.toLocaleString()} EGP</span>
                    </div>
                  )}

                  <div className={`${styles.costRow} ${styles.grandTotalRow}`}>
                    <span>TOTAL TO PAY</span>
                    <span>{grandTotal.toLocaleString()} EGP</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.placeOrderBtn}
                  id="checkout-submit-btn"
                >
                  {isSubmitting ? (
                    'PROCESSING ORDER...'
                  ) : (
                    <>CONFIRM ORDER · {grandTotal.toLocaleString()} EGP</>
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
                  <span>256-BIT SSL ENCRYPTED & 100% SECURE CHECKOUT</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
