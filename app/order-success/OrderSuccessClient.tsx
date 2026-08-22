'use client';
import Link from 'next/link';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from './OrderSuccess.module.css';

export default function OrderSuccessClient() {
  const orderId = `VRD-${Math.floor(100000 + Math.random() * 900000)}`;

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

            <p className={styles.eyebrow}>ORDER CONFIRMED</p>
            <h1 className={styles.heading}>Thank You For Your <em>Order</em></h1>
            <p className={styles.subtext}>
              Your luxury fragrance journey has begun. We are carefully preparing your package.
            </p>

            <div className={styles.orderBox}>
              <div className={styles.orderRow}>
                <span>ORDER NUMBER</span>
                <strong>#{orderId}</strong>
              </div>
              <div className={styles.orderRow}>
                <span>ESTIMATED DELIVERY</span>
                <strong>2 – 4 Business Days</strong>
              </div>
              <div className={styles.orderRow}>
                <span>STATUS</span>
                <span className={styles.statusBadge}>Processing (قيد التجهيز)</span>
              </div>
            </div>

            <p className={styles.whatsappNote}>
              📱 A confirmation message with tracking details will be sent to your WhatsApp shortly.
            </p>

            <div className={styles.actions}>
              <Link href="/" className={styles.homeBtn}>
                RETURN TO HOME
              </Link>
              <a
                href="https://wa.me/201112333598"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.supportBtn}
              >
                NEED HELP? CONTACT WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
