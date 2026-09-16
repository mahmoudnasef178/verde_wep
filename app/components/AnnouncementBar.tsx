'use client';
import { useState } from 'react';
import styles from './AnnouncementBar.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function AnnouncementBar() {
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useLanguage();
  const messages = t.announcements as readonly string[];

  return (
    <div
      className={styles.bar}
      role="marquee"
      aria-label="Announcements"
      aria-live="off"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.track} style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span key={i} className={styles.message} aria-hidden={i >= messages.length}>
            {msg}
            <span className={styles.dot} aria-hidden="true">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
