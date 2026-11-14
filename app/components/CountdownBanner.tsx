'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './CountdownBanner.module.css';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const STORAGE_KEY = 'verde_bf_end_time';
const DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days in milliseconds

export default function CountdownBanner() {
  const { isAr } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Determine end time: check localStorage or initialize with 3 days from now
    let endTime: number;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    
    if (stored) {
      endTime = parseInt(stored, 10);
      // If already expired, restart for another 3 days cycle to keep promo alive
      if (isNaN(endTime) || endTime <= Date.now()) {
        endTime = Date.now() + DURATION_MS;
        localStorage.setItem(STORAGE_KEY, endTime.toString());
      }
    } else {
      endTime = Date.now() + DURATION_MS;
      localStorage.setItem(STORAGE_KEY, endTime.toString());
    }

    const calculateTimeLeft = (): TimeLeft => {
      const diff = Math.max(0, endTime - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        // Reset 3 days if it hits 0
        const newEnd = Date.now() + DURATION_MS;
        localStorage.setItem(STORAGE_KEY, newEnd.toString());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerInner}>
        {/* Left Side: Tag & Title */}
        <div className={styles.leftContent}>
          <div className={styles.badge}>
            <span className={styles.flame}>🔥</span>
            <span className={styles.badgeText}>BLACK FRIDAY</span>
          </div>
          <span className={styles.promoText}>
            {isAr ? 'عروض الجمعة البيضاء الحصرية — خصومات كبرى لفترة محدودة' : 'Exclusive Black Friday Offers — Big Savings for a Limited Time'}
          </span>
        </div>

        {/* Right Side: Countdown Timer */}
        <div className={styles.timerContainer}>
          <span className={styles.endsInLabel}>
            {isAr ? 'ينتهي العرض خلال:' : 'Offers end in:'}
          </span>
          <div className={styles.digitsRow}>
            {/* Days */}
            <div className={styles.timeBox}>
              <span className={styles.digit}>{timeLeft ? formatNum(timeLeft.days) : '03'}</span>
              <span className={styles.label}>{isAr ? 'يوم' : 'Days'}</span>
            </div>
            <span className={styles.colon}>:</span>
            {/* Hours */}
            <div className={styles.timeBox}>
              <span className={styles.digit}>{timeLeft ? formatNum(timeLeft.hours) : '00'}</span>
              <span className={styles.label}>{isAr ? 'ساعة' : 'Hours'}</span>
            </div>
            <span className={styles.colon}>:</span>
            {/* Minutes */}
            <div className={styles.timeBox}>
              <span className={styles.digit}>{timeLeft ? formatNum(timeLeft.minutes) : '00'}</span>
              <span className={styles.label}>{isAr ? 'دقيقة' : 'Mins'}</span>
            </div>
            <span className={styles.colon}>:</span>
            {/* Seconds */}
            <div className={styles.timeBox}>
              <span className={styles.digit}>{timeLeft ? formatNum(timeLeft.seconds) : '00'}</span>
              <span className={styles.label}>{isAr ? 'ثانية' : 'Secs'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
