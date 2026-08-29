'use client';
import { useRef, useState } from 'react';
import styles from './AnnouncementBar.module.css';
import { useLanguage } from '../context/LanguageContext';

export default function AnnouncementBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useLanguage();
  const messages = t.announcements as readonly string[];

  return (
    <div
      className={styles.bar}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={styles.track} ref={trackRef} style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span key={i} className={styles.message}>
            {msg}
            <span className={styles.dot}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

