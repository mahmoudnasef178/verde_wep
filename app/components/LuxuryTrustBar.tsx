'use client';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './LuxuryTrustBar.module.css';

export default function LuxuryTrustBar() {
  const { isAr } = useLanguage();

  const trustItems = [
    {
      title: isAr ? 'تركيز Extrait de Parfum' : 'Extrait de Parfum Strength',
      desc: isAr ? 'أعلى تركيز عطري يضمن ثباتاً وفوحاناً استثنائياً يدوم لأيام' : 'Exceptional concentration for unrivaled projection and days of longevity',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      title: isAr ? 'زيوت فرنسية نقية 100%' : '100% Pure French Oils',
      desc: isAr ? 'مستخلصة من أرقى مزارع جراس بفرنسا لأنقى وأرقى تجربة عطرية' : 'Sourced from the finest distilleries in Grasse, France',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
    },
    {
      title: isAr ? 'تغليف وإهداء ملكي فاخر' : 'Royal Luxury Gifting',
      desc: isAr ? 'عبوات زجاجية مصقولة مع علب فخمة تليق بذوقك الرفيع ومثالية للإهداء' : 'Polished flacons and bespoke cases crafted for distinguished gifting',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      ),
    },
    {
      title: isAr ? 'ضمان فيردي الذهبي' : 'Verde Golden Guarantee',
      desc: isAr ? 'معاينة وتجربة طلبك عند الاستلام مع إمكانية الاستبدال بكل سهولة وراحة' : 'Inspect upon delivery with effortless exchanges and premium customer care',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.trustSection} aria-label={isAr ? 'مزايا الفخامة من فيردي' : 'Verde Luxury Standards'}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {trustItems.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconWrapper} aria-hidden="true">
                {item.icon}
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
