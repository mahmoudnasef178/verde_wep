'use client';
import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './products.module.css';

// ── Types ────────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  img: string;
  inStock: boolean;
  isActive: boolean;
  isAvailable: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

type Filter = 'all' | 'inStock' | 'outOfStock' | 'inactive';

// ── Component ────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.status === 401) { router.push('/admin/login'); return; }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [router, addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'inStock' && p.inStock && p.isActive) ||
      (filter === 'outOfStock' && !p.inStock && p.isActive) ||
      (filter === 'inactive' && !p.isActive);

    return matchSearch && matchFilter;
  });

  // ── Stock toggle ───────────────────────────────────────────────────────────
  const handleToggleStock = async (product: Product) => {
    const newVal = !product.inStock;
    // Optimistic update
    setProducts((ps) =>
      ps.map((p) => (p._id === product._id ? { ...p, inStock: newVal } : p))
    );
    setTogglingId(product._id);
    try {
      const res = await fetch(`/api/admin/products/${product._id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newVal }),
      });
      if (!res.ok) throw new Error();
      addToast(`"${product.name}" marked as ${newVal ? 'in stock' : 'out of stock'}`, 'success');
      startTransition(() => router.refresh());
    } catch {
      // Rollback
      setProducts((ps) =>
        ps.map((p) => (p._id === product._id ? { ...p, inStock: !newVal } : p))
      );
      addToast('Failed to update stock status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Soft delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setProducts((ps) => ps.filter((p) => p._id !== deleteTarget._id));
      addToast(`"${deleteTarget.name}" archived successfully`, 'success');
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch {
      addToast('Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>Products</h2>
          <Link href="/admin/products/new" className={styles.addBtn} id="add-product-btn">
            + Add Product
          </Link>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <i className={styles.searchIcon}>🔍</i>
            <input
              id="product-search"
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(['all', 'inStock', 'outOfStock', 'inactive'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'inStock' ? 'In Stock' : f === 'outOfStock' ? 'Out of Stock' : 'Archived'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>In Stock Toggle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className={styles.loadingRow}>
                  <td colSpan={6}>Loading products…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>🌿</div>
                      <div className={styles.emptyText}>No products found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    {/* Product */}
                    <td>
                      <div className={styles.productCell}>
                        {p.img && (
                          <Image
                            src={p.img}
                            alt={p.name}
                            width={44}
                            height={44}
                            className={styles.productImg}
                            unoptimized
                          />
                        )}
                        <div>
                          <div className={styles.productName}>{p.name}</div>
                          <div className={styles.productSlug}>{p.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td>
                      <span className={styles.price}>{p.price} EGP</span>
                    </td>

                    {/* Stock badge */}
                    <td>
                      <span className={`${styles.badge} ${p.inStock ? styles.badge_green : styles.badge_red}`}>
                        {p.inStock ? '● In Stock' : '● Out of Stock'}
                      </span>
                    </td>

                    {/* Active badge */}
                    <td>
                      <span className={`${styles.badge} ${p.isActive ? styles.badge_green : styles.badge_gray}`}>
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td>
                      <label className={styles.toggle} title={p.inStock ? 'Mark out of stock' : 'Mark in stock'}>
                        <input
                          type="checkbox"
                          checked={p.inStock}
                          disabled={togglingId === p._id || !p.isActive}
                          onChange={() => handleToggleStock(p)}
                          aria-label={`Toggle stock for ${p.name}`}
                        />
                        <span className={styles.toggleSlider} />
                      </label>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className={styles.editBtn}
                          id={`edit-${p._id}`}
                        >
                          Edit
                        </Link>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setDeleteTarget(p)}
                          disabled={!p.isActive}
                          id={`delete-${p._id}`}
                          title={!p.isActive ? 'Already archived' : 'Archive product'}
                        >
                          {p.isActive ? 'Archive' : 'Archived'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm delete dialog ── */}
      {deleteTarget && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className={styles.dialog}>
            <div className={styles.dialogTitle} id="confirm-title">Archive Product?</div>
            <p className={styles.dialogText}>
              <strong>&ldquo;{deleteTarget.name}&rdquo;</strong> will be hidden from the public store.
              This is a soft delete — you can restore it later by editing the product.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                id="confirm-cancel"
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={handleDelete}
                disabled={deleting}
                id="confirm-archive"
              >
                {deleting ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notifications ── */}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[`toast_${t.type}`]}`}>
            {t.type === 'success' ? '✓' : '✕'} {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
