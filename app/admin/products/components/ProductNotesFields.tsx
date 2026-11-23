'use client';
import styles from '../form.module.css';
import type { ProductFormData } from '../ProductForm';

interface ProductNotesFieldsProps {
  form: ProductFormData;
  set: (key: keyof ProductFormData, value: string | boolean) => void;
  submitting: boolean;
}

const NOTE_FIELDS = [
  { key: 'topNotes' as const, label: 'Top Notes' },
  { key: 'heartNotes' as const, label: 'Heart Notes' },
  { key: 'baseNotes' as const, label: 'Base Notes' },
  { key: 'notes' as const, label: 'General Notes' },
  { key: 'occasion' as const, label: 'Occasion' },
  { key: 'season' as const, label: 'Season' },
];

export default function ProductNotesFields({
  form,
  set,
  submitting,
}: ProductNotesFieldsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Fragrance Notes (comma-separated)</div>
      <div className={styles.grid2}>
        {NOTE_FIELDS.map(({ key, label }) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{label}</label>
            <input
              className={styles.input}
              value={form[key] as string}
              onChange={(e) => set(key, e.target.value)}
              placeholder="e.g. Rose, Oud, Musk"
              disabled={submitting}
            />
            <span className={styles.fieldHint}>Comma-separated</span>
          </div>
        ))}
      </div>
    </div>
  );
}
