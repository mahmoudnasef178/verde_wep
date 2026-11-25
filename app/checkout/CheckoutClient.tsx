'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import { get10mlPrice, getSalePrice, getSale10mlPrice } from '@/app/lib/products';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import CountdownBanner from '@/app/components/CountdownBanner';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from './Checkout.module.css';
import * as fbPixel from '@/app/lib/fbpixel';
import CheckoutOrderSummary from './components/CheckoutOrderSummary';

const EGYPT_GOVERNORATES = [
  { key: 'gharbia', value: 'Gharbia', price: 70 },
  { key: 'cairo', value: 'Cairo', price: 80 },
  { key: 'giza', value: 'Giza', price: 90 },
  { key: 'alexandria', value: 'Alexandria', price: 90 },
  { key: 'kafrElSheikh', value: 'Kafr El Sheikh', price: 90 },
  { key: 'sharqia', value: 'Sharqia', price: 90 },
  { key: 'dakahlia', value: 'Dakahlia', price: 90 },
  { key: 'beheira', value: 'Beheira', price: 90 },
  { key: 'qalyubia', value: 'Qalyubia', price: 90 },
  { key: 'monufia', value: 'Monufia', price: 90 },
  { key: 'damietta', value: 'Damietta', price: 90 },
  { key: 'portSaid', value: 'Port Said', price: 100 },
  { key: 'ismailia', value: 'Ismailia', price: 100 },
  { key: 'suez', value: 'Suez', price: 100 },
  { key: 'fayoum', value: 'Fayoum', price: 110 },
  { key: 'beniSuef', value: 'Beni Suef', price: 110 },
  { key: 'minya', value: 'Minya', price: 110 },
  { key: 'asyut', value: 'Asyut', price: 110 },
  { key: 'matrouh', value: 'Matrouh', price: 120 },
  { key: 'sohag', value: 'Sohag', price: 130 },
  { key: 'qena', value: 'Qena', price: 130 },
  { key: 'luxor', value: 'Luxor', price: 130 },
  { key: 'aswan', value: 'Aswan', price: 130 },
  { key: 'redSea', value: 'Red Sea', price: 130 },
  { key: 'newValley', value: 'New Valley', price: 140 },
  { key: 'northSinai', value: 'North Sinai', price: 140 },
  { key: 'southSinai', value: 'South Sinai', price: 140 },
  { key: 'other', value: 'Other', price: 90 },
] as const;

const VERDE_VODAFONE_NUMBER = '01014048468';
const VERDE_VODAFONE_DISPLAY = '0101 404 8468';

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const { t, isAr } = useLanguage();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'Cairo',
    address: '',
    building: '',
    notes: '',
    walletNumber: '',
    txId: '',
  });

  const [copiedNumber, setCopiedNumber] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'WALLET'>('COD');
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
  const currentGov = EGYPT_GOVERNORATES.find(
    g => g.value.toLowerCase() === (formData.city || '').toLowerCase() ||
         g.key.toLowerCase() === (formData.city || '').toLowerCase()
  ) || EGYPT_GOVERNORATES[1]; // default Cairo
  const rawShippingPrice = currentGov ? currentGov.price : 80;
  const isFreeShipping = Boolean(appliedCoupon || subtotal >= 1000);
  const shippingPrice = isFreeShipping ? 0 : rawShippingPrice;
  const grandTotal = Math.max(0, subtotal - discountAmount) + shippingPrice;

  // ── Meta Pixel + CAPI: InitiateCheckout ─────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;
    const numItems = items.reduce((a, i) => a + i.quantity, 0);
    fbPixel.initiateCheckout({
      items: items.map(i => ({ id: i.product._id, slug: i.product.slug })),
      value: subtotal,
      numItems,
      userData: {
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyNumber = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(VERDE_VODAFONE_NUMBER);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2200);
    }
  };

  const handleApplyCoupon = async (e: React.SyntheticEvent) => {
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
          text: isAr
            ? `تم تفعيل الكوبون (${res.coupon.code}) بنجاح! خصم ${res.coupon.discountAmount.toLocaleString()} ج.م + شحن مجاني 🎁`
            : `Coupon ${res.coupon.code} applied! Saved ${res.coupon.discountAmount.toLocaleString()} EGP + Free Shipping 🎁`,
        });
      } else {
        setCouponMessage({
          type: 'error',
          text: res.message || t.checkout.couponInvalid,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t.checkout.couponInvalid;
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

    const orderItemsPayload = items.map(item => {
      const isDiscover = item.product.slug.includes('discover');
      const is10ml = item.size === '10 ML';
      const itemSize = isDiscover ? (item.product.volume || '5 x 10 ML') : (is10ml ? '10 ML' : '50 ML');
      const fallbackPrice = is10ml
        ? (item.product.price10ml != null && Number(item.product.price10ml) > 0 ? Number(item.product.price10ml) : getSale10mlPrice(get10mlPrice(item.product.price, item.product.slug)))
        : (item.product.originalPrice != null && Number(item.product.originalPrice) > 0 ? Number(item.product.price) : getSalePrice(item.product.price));
      const unitPrice = item.price ?? fallbackPrice;
      const itemName = is10ml ? `${item.product.name} (10 ML)` : (isDiscover ? item.product.name : `${item.product.name} (50 ML)`);

      return {
        product: item.product._id,
        name: itemName,
        size: itemSize,
        price: unitPrice,
        quantity: item.quantity,
        img: item.product.img,
      };
    });

    const isWallet = paymentMethod === 'WALLET';
    const customerWallet = isWallet ? (formData.walletNumber.trim() || formData.phone.trim()) : undefined;
    const vodafoneNote = `فودافون كاش | محفظة العميل: ${customerWallet}${formData.txId ? ' | رقم المعاملة: ' + formData.txId : ''}${formData.notes ? ' | ملاحظات: ' + formData.notes : ''}`;
    const codNote = `الدفع عند الاستلام (COD)${formData.notes ? ' | ملاحظات: ' + formData.notes : ''}`;

    const payload = {
      orderItems: orderItemsPayload,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      email: formData.email,
      shippingAddress: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        building: formData.building,
      },
      paymentMethod,
      shippingPrice,
      senderPhone: isWallet ? customerWallet : undefined,
      walletNumber: isWallet ? customerWallet : undefined,
      txId: isWallet && formData.txId ? formData.txId.trim() : undefined,
      notes: isWallet ? vodafoneNote : codNote,
    };

    try {
      const result = await api.createOrder(payload);
      if (!result || result.success === false) {
        setOrderError((result as any)?.message || t.checkout.orderErrorDefault);
        setIsSubmitting(false);
        return;
      }
      // ── Meta Pixel + CAPI: Purchase with exact order ID deduplication ──
      const createdOrderId = String((result as any)?.order?._id ?? (result as any)?._id ?? 'unknown');
      fbPixel.purchase({
        orderId: createdOrderId,
        items: items.map(i => ({ id: i.product._id, slug: i.product.slug })),
        value: grandTotal,
        numItems: items.reduce((a, i) => a + i.quantity, 0),
        userData: {
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
      });
      clearCart();
      router.push('/order-success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t.checkout.orderErrorDefault;
      setOrderError(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <>
        <AnnouncementBar />
        <CountdownBanner />
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.emptyCard}>
              <span className={styles.emptyIcon}>🛍️</span>
              <h2>{t.checkout.title}</h2>
              <p>{t.checkout.emptySub}</p>
              <Link href="/#products" className={styles.emptyBtn}>{t.checkout.exploreCollection}</Link>
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
      <CountdownBanner />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <p className={styles.eyebrow}>{t.checkout.eyebrow}</p>
            <h1 className={styles.heading}>
              {t.checkout.headingMain} <em>{t.checkout.headingHighlight}</em>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.checkoutGrid}>
            {/* ── Left Column: Form & Payment ── */}
            <div className={styles.formCol}>

              {/* 1. Customer & Shipping Info */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.stepNum}>{t.checkout.step1}</span>
                  <h2>{t.checkout.step1Title}</h2>
                </div>

                <div className={styles.fieldsGrid}>
                  <div className={styles.field}>
                    <label>{t.checkout.firstName}</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder={t.checkout.firstNamePlaceholder}
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>{t.checkout.lastName}</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder={t.checkout.lastNamePlaceholder}
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>{t.checkout.phone}</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder={t.checkout.phonePlaceholder}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>{t.checkout.email}</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder={t.checkout.emailPlaceholder}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.fieldFull}>
                    <label>{t.checkout.city}</label>
                    <select name="city" value={formData.city} onChange={handleChange}>
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov.key} value={gov.value}>
                          {t.checkout.cities[gov.key as keyof typeof t.checkout.cities]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldFull}>
                    <label>{t.checkout.address}</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder={t.checkout.addressPlaceholder}
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.fieldFull}>
                    <label>{t.checkout.notes}</label>
                    <input
                      type="text"
                      name="notes"
                      placeholder={t.checkout.notesPlaceholder}
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <span className={styles.stepNum}>{t.checkout.step2}</span>
                  <h2>{t.checkout.step2Title}</h2>
                </div>

                {/* Payment Methods Selector Tabs */}
                <div className={styles.paymentMethodsGrid}>
                  <button
                    type="button"
                    className={`${styles.paymentMethodTab} ${paymentMethod === 'COD' ? styles.paymentMethodTabActive : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className={styles.paymentMethodRadio}>
                      {paymentMethod === 'COD' && <div className={styles.paymentMethodRadioDot} />}
                    </div>
                    <div className={styles.paymentMethodTabContent}>
                      <span className={styles.paymentMethodTabTitle}>💵 {t.checkout.codTitle}</span>
                      <span className={styles.paymentMethodTabDesc}>{t.checkout.codDesc}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`${styles.paymentMethodTab} ${paymentMethod === 'WALLET' ? styles.paymentMethodTabActive : ''}`}
                    onClick={() => setPaymentMethod('WALLET')}
                  >
                    <div className={styles.paymentMethodRadio}>
                      {paymentMethod === 'WALLET' && <div className={styles.paymentMethodRadioDot} />}
                    </div>
                    <div className={styles.paymentMethodTabContent}>
                      <span className={styles.paymentMethodTabTitle}>📱 {t.checkout.vodafoneTitle}</span>
                      <span className={styles.paymentMethodTabDesc}>{t.checkout.vodafoneDesc}</span>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'COD' ? (
                  <div className={styles.codCard}>
                    <div className={styles.codHeader}>
                      <div className={styles.codBrand}>
                        <div className={styles.codIcon}>💵</div>
                        <div className={styles.codTitles}>
                          <h3>{t.checkout.codTitle}</h3>
                          <p>{t.checkout.codDesc}</p>
                        </div>
                      </div>
                      <span className={styles.codBadge}>{t.checkout.codBadge}</span>
                    </div>

                    {/* Amount to pay on delivery */}
                    <div className={styles.transferAmountBox}>
                      <span className={styles.transferAmountLabel}>{t.checkout.payOnDeliveryAmount}</span>
                      <span className={styles.transferAmountValue}>
                        {grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                    </div>

                    <div className={styles.codNoticeBox}>
                      <span>🚚</span>
                      <span>{t.checkout.codNotice}</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.vodafoneCard}>
                    <div className={styles.vodafoneHeader}>
                      <div className={styles.vodafoneBrand}>
                        <div className={styles.vodafoneIcon}>
                          <span>VF</span>
                        </div>
                        <div className={styles.vodafoneTitles}>
                          <h3>{t.checkout.vodafoneTitle}</h3>
                          <p>{t.checkout.vodafoneDesc}</p>
                        </div>
                      </div>
                      <span className={styles.vodafoneBadge}>{t.checkout.officialBadge}</span>
                    </div>

                    {/* Transfer Amount */}
                    <div className={styles.transferAmountBox}>
                      <span className={styles.transferAmountLabel}>{t.checkout.transferAmount}</span>
                      <span className={styles.transferAmountValue}>
                        {grandTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                      </span>
                    </div>

                    {/* Wallet Number to transfer to */}
                    <div className={styles.walletNumberRow}>
                      <div className={styles.walletNumberWrap}>
                        <span className={styles.walletNumberLabel}>{t.checkout.walletNumberLabel}</span>
                        <span className={styles.walletNumberDigits}>{VERDE_VODAFONE_DISPLAY}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className={styles.copyBtn}
                        title={t.checkout.copyNumber}
                      >
                        {copiedNumber ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span>{t.checkout.copied}</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            <span>{t.checkout.copyNumber}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Steps */}
                    <div className={styles.vodafoneSteps}>
                      <p>
                        <span>1️⃣</span>
                        <span>
                          {isAr ? (
                            <>قم بتحويل مبلغ <strong>{grandTotal.toLocaleString()} جنيه</strong> إلى رقم فودافون كاش أعلاه.</>
                          ) : (
                            <>Transfer <strong>{grandTotal.toLocaleString()} EGP</strong> to the Vodafone Cash number above.</>
                          )}
                        </span>
                      </p>
                      <p>
                        <span>2️⃣</span>
                        <span>{t.checkout.step2Desc}</span>
                      </p>
                    </div>

                    {/* Inputs for verification */}
                    <div className={styles.fieldsGrid}>
                      <div className={styles.fieldFull}>
                        <label>{t.checkout.walletNumberInputLabel}</label>
                        <input
                          type="tel"
                          name="walletNumber"
                          required={paymentMethod === 'WALLET'}
                          placeholder={t.checkout.walletNumberPlaceholder}
                          value={formData.walletNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div className={styles.fieldFull}>
                        <label>{t.checkout.txIdLabel}</label>
                        <input
                          type="text"
                          name="txId"
                          placeholder={t.checkout.txIdPlaceholder}
                          value={formData.txId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* ── Right Column: Order Summary (Modular Component) ── */}
            <CheckoutOrderSummary
              items={items}
              isAr={isAr}
              subtotal={subtotal}
              shippingPrice={shippingPrice}
              rawShippingPrice={rawShippingPrice}
              isFreeShipping={isFreeShipping}
              appliedCoupon={appliedCoupon}
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              handleApplyCoupon={handleApplyCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
              couponLoading={couponLoading}
              couponMessage={couponMessage}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              orderError={orderError}
              t={t}
            />
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
