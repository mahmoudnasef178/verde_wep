'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './form.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ProductFormData {
  name: string;
  slug: string;
  subtitle: string;
  price: string;
  description: string;
  longDescription: string;
  family: string;
  intensity: string;
  volume: string;
  tag: string;
  notes: string;
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  occasion: string;
  season: string;
  inStock: boolean;
  isActive: boolean;
  isAvailable: boolean;
  img: string; // existing URL
  imgs: string; // comma-separated existing URLs
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: string; // if editing
  mode: 'create' | 'edit';
}

const DEFAULT: ProductFormData = {
  name: '', slug: '', subtitle: '50 ML — EXTRAIT DE PARFUM',
  price: '', description: '', longDescription: '',
  family: 'Woody Oriental', intensity: 'Rich & Intense', volume: '50 ML',
  tag: '', notes: '', topNotes: '', heartNotes: '', baseNotes: '',
  occasion: '', season: '',
  inStock: true, isActive: true, isAvailable: true,
  img: '', imgs: '',
};

// ── Helper: auto-generate slug ────────────────────────────────────────────────
function toSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ProductForm({ initialData, productId, mode }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...DEFAULT, ...initialData });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Field change handler ──────────────────────────────────────────────────
  const set = (key: keyof ProductFormData, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  // Auto-slug when name changes (create mode only)
  const handleNameChange = (val: string) => {
    set('name', val);
    if (mode === 'create') set('slug', toSlug(val));
  };

  // ── Image picker ──────────────────────────────────────────────────────────
  const handleImagePick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Price must be a positive number';
    if (!form.description.trim()) e.description = 'Short description is required';
    if (!form.longDescription.trim()) e.longDescription = 'Long description is required';
    if (mode === 'create' && !form.img.trim() && newImages.length === 0)
      e.img = 'At least one image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();

      // Append text fields
      const textFields = [
        'name', 'slug', 'subtitle', 'description', 'longDescription',
        'family', 'intensity', 'volume', 'tag',
        'notes', 'topNotes', 'heartNotes', 'baseNotes', 'occasion', 'season',
        'img', 'imgs',
      ] as const;
      textFields.forEach((k) => fd.append(k, form[k]));
      fd.append('price', form.price);
      fd.append('inStock', String(form.inStock));
      fd.append('isActive', String(form.isActive));
      fd.append('isAvailable', String(form.isAvailable));

      // Append new image files
      newImages.forEach((f) => fd.append('images', f));

      const url = mode === 'create'
        ? '/api/admin/products'
        : `/api/admin/products/${productId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.message ?? 'Something went wrong');
        return;
      }

      setToast({ msg: mode === 'create' ? 'Product created!' : 'Product updated!', type: 'success' });
      setTimeout(() => router.push('/admin/products'), 1200);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/admin/products" className={styles.backLink}>← Products</Link>
          <h2 className={styles.heading}>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
        </div>

        {formError && <div className={styles.formError}>⚠ {formError}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate encType="multipart/form-data">

          {/* ── Basic Info ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Basic Info</div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Name <span className={styles.required}>*</span></label>
                <input id="pf-name" className={`${styles.input} ${errors.name ? styles.error : ''}`}
                  value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Fortis Rex" disabled={submitting} />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Slug <span className={styles.required}>*</span></label>
                <input id="pf-slug" className={`${styles.input} ${errors.slug ? styles.error : ''}`}
                  value={form.slug} onChange={(e) => set('slug', e.target.value)}
                  placeholder="fortis-rex" disabled={submitting} />
                {errors.slug && <span className={styles.fieldError}>{errors.slug}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Price (EGP) <span className={styles.required}>*</span></label>
                <input id="pf-price" type="number" min="1" step="0.01"
                  className={`${styles.input} ${errors.price ? styles.error : ''}`}
                  value={form.price} onChange={(e) => set('price', e.target.value)}
                  placeholder="799" disabled={submitting} />
                {errors.price && <span className={styles.fieldError}>{errors.price}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Subtitle</label>
                <input id="pf-subtitle" className={styles.input}
                  value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)}
                  placeholder="50 ML — EXTRAIT DE PARFUM" disabled={submitting} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Family</label>
                <input id="pf-family" className={styles.input}
                  value={form.family} onChange={(e) => set('family', e.target.value)}
                  placeholder="Woody Oriental" disabled={submitting} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Volume</label>
                <input id="pf-volume" className={styles.input}
                  value={form.volume} onChange={(e) => set('volume', e.target.value)}
                  placeholder="50 ML" disabled={submitting} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tag</label>
                <input id="pf-tag" className={styles.input}
                  value={form.tag} onChange={(e) => set('tag', e.target.value)}
                  placeholder="Best Seller" disabled={submitting} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Intensity</label>
                <input id="pf-intensity" className={styles.input}
                  value={form.intensity} onChange={(e) => set('intensity', e.target.value)}
                  placeholder="Rich & Intense" disabled={submitting} />
              </div>
            </div>
          </div>

          {/* ── Descriptions ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Descriptions</div>
            <div className={styles.field} style={{ marginBottom: '1rem' }}>
              <label className={styles.label}>Short Description <span className={styles.required}>*</span></label>
              <textarea id="pf-desc" rows={3}
                className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="One-line product tagline…" disabled={submitting} />
              {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Long Description <span className={styles.required}>*</span></label>
              <textarea id="pf-longdesc" rows={6}
                className={`${styles.textarea} ${errors.longDescription ? styles.error : ''}`}
                value={form.longDescription} onChange={(e) => set('longDescription', e.target.value)}
                placeholder="Full product story…" disabled={submitting} />
              {errors.longDescription && <span className={styles.fieldError}>{errors.longDescription}</span>}
            </div>
          </div>

          {/* ── Notes ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Fragrance Notes (comma-separated)</div>
            <div className={styles.grid2}>
              {[
                { key: 'topNotes', label: 'Top Notes' },
                { key: 'heartNotes', label: 'Heart Notes' },
                { key: 'baseNotes', label: 'Base Notes' },
                { key: 'notes', label: 'General Notes' },
                { key: 'occasion', label: 'Occasion' },
                { key: 'season', label: 'Season' },
              ].map(({ key, label }) => (
                <div key={key} className={styles.field}>
                  <label className={styles.label}>{label}</label>
                  <input className={styles.input}
                    value={form[key as keyof ProductFormData] as string}
                    onChange={(e) => set(key as keyof ProductFormData, e.target.value)}
                    placeholder="e.g. Rose, Oud, Musk" disabled={submitting} />
                  <span className={styles.fieldHint}>Comma-separated</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Images ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Images</div>

            {/* Existing URL fallback (if no files uploaded) */}
            <div className={styles.field} style={{ marginBottom: '1rem' }}>
              <label className={styles.label}>Main Image URL (fallback)</label>
              <input id="pf-img" className={`${styles.input} ${errors.img ? styles.error : ''}`}
                value={form.img} onChange={(e) => set('img', e.target.value)}
                placeholder="https://res.cloudinary.com/…" disabled={submitting} />
              {errors.img && <span className={styles.fieldError}>{errors.img}</span>}
              <span className={styles.fieldHint}>Used if no file is uploaded below</span>
            </div>

            {/* File upload */}
            <div
              className={styles.imageUploadArea}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              role="button" tabIndex={0}
            >
              <div className={styles.imageUploadIcon}>📷</div>
              <div className={styles.imageUploadText}>Click to upload images</div>
              <div className={styles.imageUploadSub}>JPG, PNG, WebP — max 5 MB each</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className={styles.imageInput}
              onChange={handleImagePick}
              disabled={submitting}
            />

            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {imagePreviews.map((src, i) => (
                  <div key={i} className={styles.imagePreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${i}`} />
                    <button
                      type="button"
                      className={styles.imageRemoveBtn}
                      onClick={() => removeNewImage(i)}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Availability ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Availability</div>
            {[
              { key: 'inStock', label: 'In Stock', sub: 'Show product as available to customers' },
              { key: 'isActive', label: 'Active (visible)', sub: 'Uncheck to soft-delete (hide from store)' },
            ].map(({ key, label, sub }) => (
              <div key={key} className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>{label}</div>
                  <div className={styles.toggleSub}>{sub}</div>
                </div>
                <label className={styles.inlineToggle}>
                  <input
                    type="checkbox"
                    checked={form[key as keyof ProductFormData] as boolean}
                    onChange={(e) => set(key as keyof ProductFormData, e.target.checked)}
                    disabled={submitting}
                  />
                  <span className={styles.inlineSlider} />
                </label>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div className={styles.formFooter}>
            <Link href="/admin/products" className={styles.cancelLink}>Cancel</Link>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
              id="pf-submit"
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toastContainer}>
          <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
          </div>
        </div>
      )}
    </>
  );
}
