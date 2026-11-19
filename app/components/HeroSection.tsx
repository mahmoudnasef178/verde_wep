'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { translateTag } from '@/app/lib/translations';
import { getSalePrice, getFakeOriginalPrice } from '@/app/lib/products';
import styles from './HeroSection.module.css';

const heroProducts = [
  { name: 'Cavaro', price: 650, img: '/products/Cavaro.webp', slug: 'cavaro', tag: 'SIGNATURE NICHE', subtitle: 'Royal Apple & Warm Vanilla' },
  { name: 'Solvér', price: 700, img: '/products/Solver.webp', slug: 'solver', tag: 'ROYAL MASTERPIECE', subtitle: 'Honey, Tobacco & Citrus Majesty' },
  { name: 'Rexon', price: 650, img: '/products/Rexon.webp', slug: 'rexon', tag: 'NEW ARRIVAL', subtitle: 'Warm Bourbon Vanilla & Praline' },
  { name: 'Incenso', price: 750, img: '/products/Incenso.webp', slug: 'incenso', tag: 'ULTRA NICHE', subtitle: 'Smoky Amber & Deep Resins' },
  { name: 'Velor', price: 600, img: '/products/Velor.webp', slug: 'velor', tag: 'ELEGANT & LUXURIOUS', subtitle: 'Powdery Tuscan Iris & Amber' },
  { name: 'Fortis Rex', price: 550, img: '/products/Fortis Rex.webp', slug: 'fortis-rex', tag: 'BEST SELLER', subtitle: 'Royal Pineapple & Smoky Birch' },
  { name: 'Sultan Doré', price: 600, img: '/products/Sultan Dore.webp', slug: 'sultan-dore', tag: 'LUXURY NICHE', subtitle: 'Golden Honey & Rich Tobacco' },
  { name: 'Frost Line', price: 900, img: '/products/Frost Line.webp', slug: 'frost-line', tag: 'PREMIUM', subtitle: 'Crisp Bergamot & Icy Vetiver' },
  { name: 'Marin Bleu', price: 700, img: '/products/Marin Blue.webp', slug: 'marin-bleu', tag: 'MOST POPULAR', subtitle: 'Fresh Oceanic Grapefruit & Cedar' },
  { name: 'Blanc Pur', price: 500, img: '/products/Blanc Pur.webp', slug: 'blanc-pur', tag: 'FRESH & CLEAN', subtitle: 'Pure White Woods & Neroli' },
  { name: 'Mangue Épicée', price: 600, img: '/products/Mangue Epicee.webp', slug: 'mangue-epicee', tag: 'TRENDING', subtitle: 'Juicy Mango & Warm Ginger' },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { locale, isAr } = useLanguage();

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % heroProducts.length);
  }, []);

  const prevSlide = useCallback(() => {
    setIndex((prev) => (prev - 1 + heroProducts.length) % heroProducts.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const activeProduct = heroProducts[index];

  return (
    <section 
      className={styles.hero} 
      id="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Background */}
      <div className={styles.bg}>
        <div className={styles.bgGradient} />
        <div className={styles.bgNoise} />
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      {/* Full-Width Slider Container */}
      <div className={styles.sliderWrapper}>
        <Link href={`/products/${activeProduct.slug}`} className={styles.slideLink} aria-label={`View ${activeProduct.name}`}>
          <div className={styles.imagesTrack}>
            {heroProducts.map((prod, i) => {
              const isCurrent = i === index;
              const salePrice = getSalePrice(prod.price);
              const fakePrice = getFakeOriginalPrice(prod.price);

              return (
                <div
                  key={prod.slug}
                  className={`${styles.slide} ${isCurrent ? styles.slideActive : styles.slideHidden}`}
                  style={{ display: isCurrent ? 'flex' : 'none' }}
                  aria-hidden={!isCurrent}
                >
                  <div className={styles.imageCard}>
                    <Image
                      src={prod.img}
                      alt={`عطر ${prod.name} الفاخر من VERDE Perfumes`}
                      width={720}
                      height={960}
                      priority={i === 0}
                      quality={85}
                      fetchPriority={i === 0 ? 'high' : 'low'}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 600px) 340px, (max-width: 900px) 480px, 530px"
                      className={styles.perfumeImg}
                    />

                    {/* Luxury Glass Info Banner */}
                    <div className={styles.slideInfoBanner}>
                      <div className={styles.badgeRow}>
                        <span className={styles.brandPill}>VERDE HAUTE PARFUMERIE</span>
                        <div className={styles.tagBadge}>
                          <span>{translateTag(prod.tag, locale)}</span>
                        </div>
                      </div>

                      <div className={styles.titleRow}>
                        <div>
                          <h2 className={styles.fragranceTitle}>{prod.name}</h2>
                          <p className={styles.fragranceSubtitle}>{prod.subtitle}</p>
                        </div>
                      </div>

                      <div className={styles.actionRow}>
                        <div className={styles.priceGroup}>
                          <span className={styles.fakePrice}>
                            {fakePrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                          <span className={styles.salePrice}>
                            {salePrice.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        </div>

                        <span className={styles.discoverBtn}>
                          {isAr ? 'اكتشف العطر' : 'Discover'}
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isAr ? 'rotate(180deg)' : 'none' }}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Link>

        {/* Navigation Arrows */}
        <button
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={(e) => {
            e.preventDefault();
            prevSlide();
          }}
          aria-label="Previous Slide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={(e) => {
            e.preventDefault();
            nextSlide();
          }}
          aria-label="Next Slide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Bottom Pagination Indicators */}
        <div className={styles.indicators}>
          {heroProducts.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
