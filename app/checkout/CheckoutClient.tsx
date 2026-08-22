'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { api } from '@/app/lib/api';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from './Checkout.module.css';

type PaymentMethod = 'cod' | 'card' | 'wallet' | 'valu';

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
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

  const FREE_SHIPPING = 500;
  const shippingFee = subtotal >= FREE_SHIPPING || items.length === 0 ? 0 : 50;
  const grandTotal = Math.max(0, subtotal + shippingFee);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);
    setIsSubmitting(true);

    // If logged in, send order to API
    if (isAuthenticated) {
      try {
        await api.createOrder({
          shippingAddress: {
            fullName: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
            building: formData.building,
          },
          paymentMethod,
          notes: formData.notes,
        });
        clearCart();
        router.push('/order-success');
      } catch (err) {
        setOrderError((err as Error).message || 'حدث خطأ، حاول مرة أخرى');
        setIsSubmitting(false);
      }
    } else {
      // Guest checkout — skip API, just clear cart and navigate
      setTimeout(() => {
        clearCart();
        router.push('/order-success');
      }, 1500);
    }
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
                    <label>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="ahmed@example.com"
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

                {/* Costs */}
                <div className={styles.costs}>
                  <div className={styles.costRow}>
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} EGP</span>
                  </div>
                  <div className={styles.costRow}>
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? <strong style={{ color: '#5aad78' }}>FREE</strong> : `${shippingFee} EGP`}</span>
                  </div>
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
