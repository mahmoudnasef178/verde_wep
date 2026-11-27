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
          <p className={styles.eyebrow}>{isAr ? 'دار فيردي للعطور' : 'THE HOUSE OF VERDE'}</p>
          <h2 className={styles.title}>
            {isAr ? 'عطر يترك' : 'A fragrance'}
            <span>{isAr ? ' أثرًا لا يُنسى' : ' to be remembered'}</span>
          </h2>
          <p className={styles.description}>
            {isAr
              ? 'تكوينات عطرية مختارة بعناية، مصنوعة لترافق حضورك اليومي وتبقى في الذاكرة.'
              : 'Considered fragrance compositions, crafted to accompany your presence and stay in memory.'}
          </p>
          <div className={styles.actions}>
            <Link href="/products" className={styles.primaryAction}>
              {isAr ? 'اكتشفي المجموعة' : 'Discover the collection'}
            </Link>
            <Link href="/products/cavaro" className={styles.secondaryAction}>
              {isAr ? 'اكتشفي كافارو' : 'Meet Cavaro'}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        <Link href="/products/cavaro" className={styles.visual} aria-label={isAr ? 'اكتشفي عطر كافارو' : 'Discover Cavaro'}>
          <div className={styles.imageFrame}>
            <Image
              src="/products/Cavaro.webp"
              alt={isAr ? 'عطر كافارو من فيردي' : 'Cavaro fragrance by Verde'}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 50vw"
              className={styles.image}
            />
          </div>
          <div className={styles.caption}>
            <span>{isAr ? 'إصدار مختار' : 'Featured creation'}</span>
            <strong>CAVARO</strong>
          </div>
        </Link>
      </div>

      <div className={styles.assurances} aria-label={isAr ? 'مميزات التسوق' : 'Shopping assurances'}>
        <div><span>01</span>{isAr ? 'تركيز Extrait de Parfum' : 'Extrait de Parfum concentration'}</div>
        <div><span>02</span>{isAr ? 'تغليف أنيق وجاهز للإهداء' : 'Elegant, gift-ready packaging'}</div>
        <div><span>03</span>{isAr ? 'توصيل إلى جميع أنحاء مصر' : 'Delivery across Egypt'}</div>
      </div>
    </section>
  );
}
