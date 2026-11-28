'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './HeroSection.module.css';

const scentEdits = [
  { name: 'FORTIS REX', image: '/products/Fortis Rex.webp', slug: 'fortis-rex', ar: 'منعش وواثق', en: 'Fresh & assured', number: '01' },
  { name: 'VELOR', image: '/products/Velor.webp', slug: 'velor', ar: 'دافئ وهادئ', en: 'Warm & composed', number: '02' },
  { name: 'CAVARO', image: '/products/Cavaro.webp', slug: 'cavaro', ar: 'لافت ومميز', en: 'Distinct & magnetic', number: '03' },
];

export default function HeroSection() {
  const { isAr } = useLanguage();

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>VERDE · THE SCENT EDIT</p>
        <h2 className={styles.title}>
          {isAr ? 'اختَر عطرك' : 'Find the scent'}
          <span>{isAr ? ' كما تريد أن تُتذكَر.' : ' you want remembered.'}</span>
        </h2>
        <p className={styles.description}>
          {isAr
            ? 'ثلاث شخصيات عطرية، وثلاث طرق مختلفة لترك أثرٍ يخصك.'
            : 'Three scent personalities, and three different ways to make your mark.'}
        </p>
      </div>

      <div className={styles.edits}>
        {scentEdits.map((edit) => (
          <Link key={edit.slug} href={`/products/${edit.slug}`} className={styles.editCard}>
            <div className={styles.imageWrap}>
              <Image
                src={edit.image}
                alt={isAr ? `عطر ${edit.name} من فيردي` : `${edit.name} fragrance by Verde`}
                fill
                sizes="(max-width: 720px) 100vw, 33vw"
                className={styles.image}
              />
              <span className={styles.number}>{edit.number}</span>
            </div>
            <div className={styles.cardCopy}>
              <div>
                <h3>{edit.name}</h3>
                <p>{isAr ? edit.ar : edit.en}</p>
              </div>
              <span className={styles.cardArrow} aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.footerLine}>
        <span>{isAr ? 'اكتشف المجموعة الكاملة' : 'Explore the complete collection'}</span>
        <Link href="/products" className={styles.collectionLink}>
          {isAr ? 'كل العطور' : 'View all fragrances'} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
