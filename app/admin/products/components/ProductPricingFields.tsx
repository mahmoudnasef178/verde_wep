'use client';
import styles from '../form.module.css';
import type { ProductFormData } from '../ProductForm';

interface ProductPricingFieldsProps {
  form: ProductFormData;
  errors: Partial<Record<keyof ProductFormData, string>>;
  set: (key: keyof ProductFormData, value: string | boolean) => void;
  submitting: boolean;
}

export default function ProductPricingFields({
  form,
  errors,
  set,
  submitting,
}: ProductPricingFieldsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Pricing & Sizes / الأسعار والأحجام (EGP)</div>
      <div className={styles.grid2}>
        {/* 50 ML Sale Price */}
        <div className={styles.field}>
          <label className={styles.label}>
            سعر الـ 50 مل (سعر البيع الحالي) <span className={styles.required}>*</span>
          </label>
          <input
            id="pf-price"
            type="number"
            min="1"
            step="0.01"
            className={`${styles.input} ${errors.price ? styles.error : ''}`}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="مثال: 550 أو 650"
            disabled={submitting}
          />
          <span className={styles.fieldHint}>السعر الفعلي المطلوب دفعه لزجاجة الـ 50 مل</span>
          {errors.price && <span className={styles.fieldError}>{errors.price}</span>}
        </div>

        {/* 50 ML Original Price */}
        <div className={styles.field}>
          <label className={styles.label}>
            سعر الـ 50 مل قبل الخصم (سعر الشطب)
          </label>
          <input
            id="pf-originalPrice"
            type="number"
            min="1"
            step="0.01"
            className={`${styles.input} ${errors.originalPrice ? styles.error : ''}`}
            value={form.originalPrice}
            onChange={(e) => set('originalPrice', e.target.value)}
            placeholder="مثال: 750 أو 850 (اختياري)"
            disabled={submitting}
          />
          <span className={styles.fieldHint}>السعر القديم الذي يظهر مشطوباً فوق سعر الـ 50 مل</span>
          {errors.originalPrice && <span className={styles.fieldError}>{errors.originalPrice}</span>}
        </div>

        {/* 10 ML Sale Price */}
        <div className={styles.field}>
          <label className={styles.label}>
            سعر الـ 10 مل (سعر البيع)
          </label>
          <input
            id="pf-price10ml"
            type="number"
            min="1"
            step="0.01"
            className={`${styles.input} ${errors.price10ml ? styles.error : ''}`}
            value={form.price10ml}
            onChange={(e) => set('price10ml', e.target.value)}
            placeholder="مثال: 150 أو 175 (اختياري)"
            disabled={submitting}
          />
          <span className={styles.fieldHint}>السعر الفعلي لحجم الـ 10 مل (اتركه فارغاً للحساب التلقائي)</span>
          {errors.price10ml && <span className={styles.fieldError}>{errors.price10ml}</span>}
        </div>

        {/* 10 ML Original Price */}
        <div className={styles.field}>
          <label className={styles.label}>
            سعر الـ 10 مل قبل الخصم (سعر الشطب)
          </label>
          <input
            id="pf-originalPrice10ml"
            type="number"
            min="1"
            step="0.01"
            className={`${styles.input} ${errors.originalPrice10ml ? styles.error : ''}`}
            value={form.originalPrice10ml}
            onChange={(e) => set('originalPrice10ml', e.target.value)}
            placeholder="مثال: 200 أو 225 (اختياري)"
            disabled={submitting}
          />
          <span className={styles.fieldHint}>السعر القديم المشطوب فوق سعر الـ 10 مل</span>
          {errors.originalPrice10ml && <span className={styles.fieldError}>{errors.originalPrice10ml}</span>}
        </div>
      </div>
    </div>
  );
}
