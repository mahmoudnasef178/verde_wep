'use client';
import { useState } from 'react';
import styles from './AnnouncementBar.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function AnnouncementBar() {
  const [isPaused, setIsPaused] = useState(false);
  const { t, isAr } = useLanguage();
  const messages = t.announcements as readonly string[];

  return (
    <div
      className={styles.bar}
      role="region"
      aria-label="Announcements"
      aria-live="off"
      dir={isAr ? 'rtl' : 'ltr'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`${styles.track} ${isAr ? styles.trackRtl : styles.trackLtr}`}
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        {[0, 1].map((groupIdx) => (
          <div key={groupIdx} className={styles.group} aria-hidden={groupIdx === 1}>
            {messages.map((msg, i) => (
              <span key={`${groupIdx}-${i}`} className={styles.message}>
                {msg}
                <span className={styles.dot} aria-hidden="true">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
