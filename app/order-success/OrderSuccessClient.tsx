'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import { trackPurchaseBrowser, type MetaTrackProduct, type MetaUserData } from '@/lib/meta';
import styles from './OrderSuccess.module.css';

interface StoredOrder {
  orderId: string;
  value: number;
  products: MetaTrackProduct[];
  user?: MetaUserData;
}

function OrderSuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const queryOrderId = searchParams?.get('orderId') || '';
  const [displayOrderId, setDisplayOrderId] = useState<string>(queryOrderId);

  useEffect(() => {
    let resolvedOrderId = queryOrderId;
    let storedOrder: StoredOrder | null = null;

    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('verde_last_order');
        if (raw) {
          const parsed = JSON.parse(raw) as StoredOrder;
          if (parsed?.orderId && (!resolvedOrderId || parsed.orderId === resolvedOrderId)) {
            storedOrder = parsed;
            resolvedOrderId = parsed.orderId;
          }
        }
      } catch {
        // ignore storage parse error
      }
    }

    if (resolvedOrderId) {
      setDisplayOrderId(resolvedOrderId);

      // Fire Browser Pixel Purchase ONCE per orderId when confirmed order details are present.
      // Never fire a blank Purchase without content_ids/value; server CAPI already fired in order.controller.js.
      if (storedOrder && Array.isArray(storedOrder.products) && storedOrder.products.length > 0) {
        trackPurchaseBrowser({
          orderId: resolvedOrderId,
          products: storedOrder.products,
          value: Number(storedOrder.value) || 0,
          currency: 'EGP',
          user: storedOrder.user || {},
        });
      }
    }
  }, [queryOrderId]);

  const formattedOrderNumber = displayOrderId
    ? `#${displayOrderId.slice(-6).toUpperCase()}`
    : '—';

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.iconCircle}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <p className={styles.eyebrow}>{t.orderSuccess.title}</p>
            <h1 className={styles.heading}>{t.orderSuccess.title}</h1>
            <p className={styles.subtext}>
              {t.orderSuccess.subtitle}
            </p>

            <div className={styles.orderBox}>
              <div className={styles.orderRow}>
                <span>{t.orderSuccess.orderNumber}</span>
                <strong title={displayOrderId || undefined}>{formattedOrderNumber}</strong>
              </div>
              <div className={styles.orderRow}>
                <span>{t.orderSuccess.estimatedDelivery}</span>
                <strong>{t.orderSuccess.deliveryTime}</strong>
              </div>
              <div className={styles.orderRow}>
                <span>{t.orderSuccess.status}</span>
                <span className={styles.statusBadge}>{t.orderSuccess.statusValue}</span>
              </div>
            </div>

            <p className={styles.whatsappNote}>
              📱 {t.orderSuccess.message}
            </p>

            <div className={styles.actions}>
              <Link href="/" className={styles.homeBtn}>
                {t.orderSuccess.continueShopping}
              </Link>
              <a
                href="https://wa.me/201112333598"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportBtn}
              >
                {t.orderSuccess.whatsappSupport}
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderSuccessClient() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
