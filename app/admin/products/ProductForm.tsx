'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductPricingFields from './components/ProductPricingFields';
import ProductNotesFields from './components/ProductNotesFields';
import styles from './form.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ProductFormData {
  name: string;
  slug: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  price10ml: string;
  originalPrice10ml: string;
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
  pyramidImg: string; // existing pyramid image URL
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  productId?: string; // if editing
  mode: 'create' | 'edit';
}

const DEFAULT: ProductFormData = {
  name: '', slug: '', subtitle: '50 ML — EXTRAIT DE PARFUM',
  price: '', originalPrice: '', price10ml: '', originalPrice10ml: '',
  description: '', longDescription: '',
  family: 'Woody Oriental', intensity: 'Rich & Intense', volume: '50 ML',
  tag: '', notes: '', topNotes: '', heartNotes: '', baseNotes: '',
  occasion: '', season: '',
  inStock: true, isActive: true, isAvailable: true,
  img: '', imgs: '', pyramidImg: '',
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
  const [pyramidFile, setPyramidFile] = useState<File | null>(null);
  const [pyramidPreview, setPyramidPreview] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pyramidInputRef = useRef<HTMLInputElement>(null);

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

  // ── Image picker (product images) ────────────────────────────────────────
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

  // ── Pyramid image picker ──────────────────────────────────────────────────
  const handlePyramidPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPyramidFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPyramidPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removePyramidImage = () => {
    setPyramidFile(null);
    setPyramidPreview('');
    set('pyramidImg', '');
    if (pyramidInputRef.current) pyramidInputRef.current.value = '';
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Price must be a positive number';
    if (form.originalPrice && (isNaN(Number(form.originalPrice)) || Number(form.originalPrice) <= 0))
      e.originalPrice = 'Original price must be a positive number';
    if (form.price10ml && (isNaN(Number(form.price10ml)) || Number(form.price10ml) <= 0))
      e.price10ml = '10ml price must be a positive number';
    if (form.originalPrice10ml && (isNaN(Number(form.originalPrice10ml)) || Number(form.originalPrice10ml) <= 0))
      e.originalPrice10ml = 'Original 10ml price must be a positive number';
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
        'img', 'imgs', 'pyramidImg',
      ] as const;
      textFields.forEach((k) => fd.append(k, form[k]));
      fd.append('price', form.price);
      fd.append('originalPrice', form.originalPrice);
      fd.append('price10ml', form.price10ml);
      fd.append('originalPrice10ml', form.originalPrice10ml);
      fd.append('inStock', String(form.inStock));
      fd.append('isActive', String(form.isActive));
      fd.append('isAvailable', String(form.isAvailable));

      // Append new product image files
      newImages.forEach((f) => fd.append('images', f));

      // Append pyramid image file (single, optional)
      if (pyramidFile) fd.append('pyramid', pyramidFile);

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

          {/* ── Pricing & Sizes (Modular Component) ── */}
          <ProductPricingFields
            form={form}
            errors={errors}
            set={set}
            submitting={submitting}
          />

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

          {/* ── Fragrance Notes (Modular Component) ── */}
          <ProductNotesFields
            form={form}
            set={set}
            submitting={submitting}
          />

          {/* ── Images ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Product Images</div>

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
              <div className={styles.imageUploadText}>Click to upload product images</div>
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

          {/* ── Pyramid / Hover Image ── */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>🔺 Fragrance Pyramid Image (Hover Overlay)</div>
            <p className={styles.fieldHint} style={{ marginBottom: '0.75rem' }}>
              This image appears when a customer hovers over the product card on the homepage.
              It should show the fragrance pyramid composition graphic.
            </p>

            {/* Existing URL fallback */}
            <div className={styles.field} style={{ marginBottom: '1rem' }}>
              <label className={styles.label}>Pyramid Image URL (fallback)</label>
              <input id="pf-pyramidImg" className={styles.input}
                value={form.pyramidImg} onChange={(e) => set('pyramidImg', e.target.value)}
                placeholder="https://res.cloudinary.com/…/pyramid.jpg" disabled={submitting} />
              <span className={styles.fieldHint}>Used if no file is uploaded below</span>
            </div>

            {/* Pyramid file upload */}
            {!pyramidPreview && !form.pyramidImg ? (
              <div
                className={styles.imageUploadArea}
                onClick={() => pyramidInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && pyramidInputRef.current?.click()}
                role="button" tabIndex={0}
              >
                <div className={styles.imageUploadIcon}>🔺</div>
                <div className={styles.imageUploadText}>Click to upload pyramid image</div>
                <div className={styles.imageUploadSub}>JPG, PNG, WebP — max 5 MB — single image</div>
              </div>
            ) : (
              <div className={styles.imagePreviewGrid}>
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pyramidPreview || form.pyramidImg}
                    alt="pyramid-preview"
                    style={{ objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    className={styles.imageRemoveBtn}
                    onClick={removePyramidImage}
                  >✕</button>
                </div>
              </div>
            )}

            {/* Hidden file input for pyramid */}
            <input
              ref={pyramidInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.imageInput}
              onChange={handlePyramidPick}
              disabled={submitting}
            />

            {/* Upload button shown when no preview yet */}
            {(pyramidPreview || form.pyramidImg) && (
              <button
                type="button"
                className={styles.cancelLink}
                style={{ marginTop: '0.5rem', display: 'inline-block' }}
                onClick={() => pyramidInputRef.current?.click()}
                disabled={submitting}
              >
                Change Pyramid Image
              </button>
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
