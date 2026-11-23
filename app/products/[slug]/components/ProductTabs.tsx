'use client';
import { useState } from 'react';
import styles from '../ProductPage.module.css';
import { translateNotes, Locale } from '@/app/lib/translations';

interface ProductTabsProps {
  longDescription: string;
  currentVolume: string;
  isDiscoverBox: boolean;
  hasNotes: boolean;
  effectiveTopNotes: string[];
  effectiveHeartNotes: string[];
  effectiveBaseNotes: string[];
  translatedFamily: string;
  translatedIntensity: string;
  translatedSeasons: string[];
  translatedOccasions: string[];
  stock: number;
  locale: Locale;
  t: {
    productPage: {
      description: string;
      notes: string;
      details: string;
      topNotes: string;
      heartNotes: string;
      baseNotes: string;
      volume: string;
      concentration: string;
      discoverySetValue: string;
      concentrationValue: string;
      olfactiveFamily: string;
      intensity: string;
      seasonDetail: string;
      occasionDetail: string;
      madeIn: string;
      madeInValue: string;
      stock: string;
      units: string;
    };
  };
}

export default function ProductTabs({
  longDescription,
  currentVolume,
  isDiscoverBox,
  hasNotes,
  effectiveTopNotes,
  effectiveHeartNotes,
  effectiveBaseNotes,
  translatedFamily,
  translatedIntensity,
  translatedSeasons,
  translatedOccasions,
  stock,
  locale,
  t,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'notes' | 'details'>('description');
  const availableTabs = hasNotes
    ? (['description', 'notes', 'details'] as const)
    : (['description', 'details'] as const);

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
            id={`tab-${tab}`}
          >
            {tab === 'description'
              ? t.productPage.description
              : tab === 'notes'
              ? t.productPage.notes
              : t.productPage.details}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'description' && (
          <p className={styles.longDesc}>{longDescription}</p>
        )}

        {activeTab === 'notes' && hasNotes && (
          <div className={styles.pyramid}>
            {[
              { label: t.productPage.topNotes, notes: translateNotes(effectiveTopNotes, locale), icon: '🌬️' },
              { label: t.productPage.heartNotes, notes: translateNotes(effectiveHeartNotes, locale), icon: '💚' },
              { label: t.productPage.baseNotes, notes: translateNotes(effectiveBaseNotes, locale), icon: '🪨' },
            ].map((row) => (
              <div key={row.label} className={styles.pyramidRow}>
                <div className={styles.pyramidLabel}>
                  <span className={styles.pyramidIcon}>{row.icon}</span>
                  <span>{row.label}</span>
                </div>
                <div className={styles.pyramidNotes}>
                  {row.notes.map((n) => (
                    <span key={n} className={styles.pyramidNote}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'details' && (
          <table className={styles.detailsTable}>
            <tbody>
              {[
                [t.productPage.volume, currentVolume],
                [
                  t.productPage.concentration,
                  isDiscoverBox
                    ? t.productPage.discoverySetValue
                    : t.productPage.concentrationValue,
                ],
                [t.productPage.olfactiveFamily, translatedFamily],
                [t.productPage.intensity, translatedIntensity],
                [t.productPage.seasonDetail, translatedSeasons.join(', ')],
                [t.productPage.occasionDetail, translatedOccasions.join(', ')],
                [t.productPage.madeIn, t.productPage.madeInValue],
                [t.productPage.stock, `${stock} ${t.productPage.units}`],
              ].map(([key, val]) => (
                <tr key={key} className={styles.detailRow}>
                  <td className={styles.detailKey}>{key}</td>
                  <td className={styles.detailVal}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
