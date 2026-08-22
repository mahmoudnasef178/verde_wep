'use client';
import { useState } from 'react';
import styles from './FAQSection.module.css';

const faqs = [
  {
    q: 'How long do Verde fragrances last?',
    a: 'Our fragrances are formulated to last 6–8 hours on skin and longer on fabric. Longevity may vary based on skin type, weather conditions, and application area. For best results, apply to pulse points such as wrists, neck, and behind the ears.',
  },
  {
    q: 'What is your shipping policy?',
    a: 'Orders are processed within 1–2 business days and delivered within 3–5 business days across Egypt. You\'ll receive a tracking link via WhatsApp once your order is shipped.',
  },
  {
    q: 'Do you accept returns or exchanges?',
    a: 'Due to the nature of our products, we do not accept returns or exchanges unless the product is defective or damaged. In such cases, please contact us within 5 days of receiving your order with photos, and we\'ll ensure it\'s resolved promptly.',
  },
  {
    q: 'How do I contact Verde?',
    a: 'The fastest way to reach us is via Instagram DM @verde_perfumes or WhatsApp. Our team responds within 24 hours on business days.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>HAVE QUESTIONS?</p>
          <h2 className={styles.heading}>We Have <em>Answers</em></h2>
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
