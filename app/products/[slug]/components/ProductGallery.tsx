'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from '../ProductPage.module.css';
import { translateTag, Locale } from '@/app/lib/translations';

interface ProductGalleryProps {
  galleryImages: string[];
  productName: string;
  productTag?: string;
  locale: Locale;
}

export default function ProductGallery({
  galleryImages,
  productName,
  productTag,
  locale,
}: ProductGalleryProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentMainImg = galleryImages[activeImgIndex] || '';

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <>
      <div className={styles.gallery}>
        {/* Side Thumbnails Column */}
        {galleryImages.length > 1 && (
          <div className={styles.thumbnails} role="tablist" aria-label="Product image gallery">
            {galleryImages.map((src, idx) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={activeImgIndex === idx}
                aria-label={`${productName} - ${idx + 1}`}
                className={`${styles.thumbBtn} ${activeImgIndex === idx ? styles.thumbBtnActive : ''}`}
                onClick={() => setActiveImgIndex(idx)}
                onMouseEnter={() => setActiveImgIndex(idx)}
              >
                <Image
                  src={src}
                  alt={`${productName} - ${idx + 1}`}
                  width={100}
                  height={100}
                  sizes="100px"
                  className={styles.thumbImg}
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className={styles.mainImg}>
          <div
            className={styles.mainImgWrap}
            onClick={() => setIsLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Click to enlarge image"
          >
            {/* Ambient Blurred Glow */}
            <div
              className={styles.blurredBg}
              style={{ backgroundImage: `url("${currentMainImg}")` }}
            />

            {productTag && (
              <span className={styles.imgTag}>
                {translateTag(productTag, locale)}
              </span>
            )}

            {/* Image counter pill */}
            {galleryImages.length > 1 && (
              <span className={styles.counterPill}>
                {activeImgIndex + 1} / {galleryImages.length}
              </span>
            )}

            {/* Fullscreen zoom icon */}
            <button
              type="button"
              className={styles.zoomBadge}
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              aria-label="Zoom in"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            {/* Prev/Next arrows on main image */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navArrowPrev}`}
                  onClick={handlePrevImg}
                  aria-label="Previous image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navArrowNext}`}
                  onClick={handleNextImg}
                  aria-label="Next image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {currentMainImg && (
              <Image
                key={currentMainImg}
                src={currentMainImg}
                alt={`عطر ${productName} الفاخر من VERDE PARFUMS`}
                width={700}
                height={700}
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.img}
                priority
              />
            )}
            <div className={styles.imgGlow} />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className={styles.lightboxModal}
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navArrowPrev}`}
                  style={{ left: '-20px' }}
                  onClick={handlePrevImg}
                  aria-label="Previous"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navArrowNext}`}
                  style={{ right: '-20px' }}
                  onClick={handleNextImg}
                  aria-label="Next"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {currentMainImg && (
              <Image
                src={currentMainImg}
                alt={`${productName} - ${activeImgIndex + 1}`}
                width={1200}
                height={1200}
                className={styles.lightboxImg}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
