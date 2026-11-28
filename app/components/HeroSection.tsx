'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const { isAr } = useLanguage();

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>VERDE PARFUMS · CAIRO</p>
          <h2 className={styles.title}>
            {isAr ? 'اختيارك' : 'A scent'}
            <span>{isAr ? ' يسبق حضورك.' : ' before the room.'}</span>
          </h2>
          <p className={styles.description}>
            {isAr
              ? 'عطور مركّزة، بتفاصيل محسوبة، صُممت لتُصبح جزءًا طبيعيًا من حضورك اليومي.'
              : 'Concentrated fragrances with considered details, created to become part of your everyday presence.'}
          </p>

          <div className={styles.signature}>
            <span>{isAr ? 'تركيز فاخر' : 'EXTRAIT DE PARFUM'}</span>
            <span aria-hidden="true" />
            <span>{isAr ? 'صناعة مصرية' : 'MADE IN EGYPT'}</span>
          </div>

          <div className={styles.actions}>
            <Link href="/products" className={styles.primaryAction}>
              {isAr ? 'تسوّق المجموعة' : 'Shop the collection'}
            </Link>
            <Link href="/products/cavaro" className={styles.secondaryAction}>
              {isAr ? 'تعرّف على كافارو' : 'Discover Cavaro'}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <Link href="/products/cavaro" className={styles.visual} aria-label={isAr ? 'تعرّف على عطر كافارو' : 'Discover Cavaro'}>
          <div className={styles.imageFrame}>
            <Image
              src="/products/Cavaro.webp"
              alt={isAr ? 'عطر كافارو من فيردي' : 'Cavaro fragrance by Verde'}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 43vw"
              className={styles.image}
            />
          </div>
          <div className={styles.productMeta}>
            <span>{isAr ? 'الإصدار الأول' : 'THE FIRST EDITION'}</span>
            <strong>CAVARO</strong>
            <span>EXTRAIT DE PARFUM · 50 ML</span>
          </div>
        </Link>
      </div>

      <div className={styles.assurances} aria-label={isAr ? 'مميزات التسوق' : 'Shopping assurances'}>
        <span>{isAr ? 'تغليف أنيق وجاهز للإهداء' : 'Gift-ready presentation'}</span>
        <span>{isAr ? 'شحن إلى جميع أنحاء مصر' : 'Delivery across Egypt'}</span>
        <span>{isAr ? 'دعم سريع عبر واتساب' : 'Dedicated WhatsApp support'}</span>
      </div>
    </section>
  );
}
