'use client';
import styles from '../ProductPage.module.css';

interface DiscoverBoxItemsProps {
  isWinterBox: boolean;
  isAr: boolean;
  inspiredByText: string;
}

export default function DiscoverBoxItems({
  isWinterBox,
  isAr,
  inspiredByText,
}: DiscoverBoxItemsProps) {
  const winterItems = [
    { num: '1', name: 'Cavaro', inspired: 'Layton' },
    { num: '2', name: 'Rexon', inspired: 'Althaïr' },
    { num: '3', name: 'Incenso', inspired: 'Interlude 53' },
    { num: '4', name: 'Velor', inspired: 'Dior Homme Intense' },
    { num: '5', name: 'Solvér', inspired: 'Naxos' },
  ];

  const summerItems = [
    { num: '1', name: 'Fortis Rex', inspired: 'Invictus' },
    { num: '2', name: 'Marin Bleu', inspired: 'Megamare' },
    { num: '3', name: 'Frost Line', inspired: 'Pacific Chill' },
    { num: '4', name: 'Blanc Pur', inspired: 'Lacoste White' },
    { num: '5', name: 'Mangue Épicée', inspired: 'God of Fire' },
  ];

  const items = isWinterBox ? winterItems : summerItems;

  return (
    <div className={styles.discoverPerfumesBox}>
      <div className={styles.discoverPerfumesTitle}>
        {isWinterBox
          ? (isAr ? 'عطور مجموعة الشتاء الفاخرة' : 'Included Winter Fragrances')
          : (isAr ? 'عطور مجموعة الصيف الفاخرة' : 'Included Summer Fragrances')}
      </div>
      <div className={styles.discoverPerfumesGrid}>
        {items.map((item) => (
          <div key={item.num} className={styles.discoverItem}>
            <span className={styles.discoverNum}>{item.num}</span>
            <div className={styles.discoverMeta}>
              <strong>{item.name}</strong>
              <span>{inspiredByText} {item.inspired}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
