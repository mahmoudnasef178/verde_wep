'use client';
import { useState } from 'react';
import styles from './FAQSection.module.css';
import { useLanguage } from '@/app/context/LanguageContext';

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useLanguage();
  const faqs = t.faq.items;

  return (
    <section className={styles.section} id="faq">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t.faq.eyebrow}</p>
          <h2 className={styles.heading}>{t.faq.heading}</h2>
        </div>

        <div className={styles.list}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}
              id={`faq-item-${i}`}
            >
              <button
                className={styles.question}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className={styles.qNum}>0{i + 1}</span>
                <span className={styles.qText}>{faq.q}</span>
                <span className={styles.icon}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ transform: open === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}
                  >
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </span>
              </button>

              <div className={`${styles.answer} ${open === i ? styles.answerOpen : ''}`}>
                <p className={styles.answerText}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
