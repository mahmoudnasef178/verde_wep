'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';
import { translateTag } from '@/app/lib/translations';
import styles from './HeroSection.module.css';

const heroProducts = [
  { name: 'Fortis Rex', price: 500, img: '/products/Fortis Rex.png', slug: 'fortis-rex', tag: 'BEST SELLER' },
  { name: 'Sultan Doré', price: 550, img: '/products/Sultan Dore.png', slug: 'sultan-dore', tag: 'LUXURY NICHE' },
  { name: 'Marin Bleu', price: 650, img: '/products/Marin Blue.png', slug: 'marin-bleu', tag: 'MOST POPULAR' },
  { name: 'Frost Line', price: 850, img: '/products/Frost Line.png', slug: 'frost-line', tag: 'PREMIUM' },
  { name: 'Blanc Pur', price: 450, img: '/products/Blanc Pur.png', slug: 'blanc-pur', tag: 'FRESH & CLEAN' },
  { name: 'Mangue Épicée', price: 550, img: '/products/Mangue Epicee.png', slug: 'mangue-epicee', tag: 'TRENDING' },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { locale } = useLanguage();

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
    }, 4000);
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
            {heroProducts.map((prod, i) => (
              <div
                key={prod.slug}
                className={`${styles.slide} ${i === index ? styles.slideActive : styles.slideHidden}`}
              >
                <div className={styles.imageCard}>
                  <Image
                    src={prod.img}
                    alt={prod.name}
                    width={1200}
                    height={800}
                    priority={i === 0}
                    className={styles.perfumeImg}
                  />
                  <div className={styles.tagBadge}>
                    <span>{translateTag(prod.tag, locale)}</span>
                  </div>
                </div>
              </div>
            ))}
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Bottom Pagination Dots */}
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
