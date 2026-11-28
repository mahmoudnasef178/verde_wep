'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const { isAr } = useLanguage();

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.banner}>
        <Image
          src="/hero/verde-packaging.png"
          alt={isAr ? 'تغليف فيردي الفاخر' : 'Verde luxury fragrance packaging'}
          fill
          priority
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.content}>
          <p className={styles.eyebrow}>VERDE PARFUMS · CAIRO</p>
          <h2 className={styles.title}>
            {isAr ? 'تفاصيل تُصبح' : 'Details that become'}
            <span>{isAr ? ' جزءًا من حضورك.' : ' part of your presence.'}</span>
          </h2>
          <p className={styles.description}>
            {isAr
              ? 'مجموعة عطور مركّزة بتوقيع فيردي، مصممة للحظات التي تستحق أن تُتذكر.'
              : 'A concentrated fragrance collection by Verde, created for moments worth remembering.'}
          </p>
          <Link href="/products" className={styles.cta}>
            {isAr ? 'اكتشف المجموعة' : 'Explore the collection'}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className={styles.location}>
          <span>VERDE</span>
          <span>EXTRAIT DE PARFUM · EGYPT</span>
        </div>
      </div>

      <div className={styles.assurances} aria-label={isAr ? 'مميزات التسوق' : 'Shopping assurances'}>
        <span>{isAr ? 'تغليف أنيق وجاهز للإهداء' : 'Gift-ready presentation'}</span>
        <span>{isAr ? 'توصيل إلى جميع أنحاء مصر' : 'Delivery across Egypt'}</span>
        <span>{isAr ? 'دعم مخصص عبر واتساب' : 'Dedicated WhatsApp support'}</span>
      </div>
    </section>
  );
}
