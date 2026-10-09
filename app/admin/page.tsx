import { cookies } from 'next/headers';
import Link from 'next/link';
import styles from './dashboard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

interface StatsData {
  total: number;
  active: number;
  inStock: number;
  outOfStock: number;
  inactive: number;
}

async function getStats(): Promise<StatsData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('verde_admin_token')?.value;
    if (!token) return null;

    const res = await fetch(`${API_URL}/api/admin/products?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    const products = data.products ?? [];

    return {
      total: products.length,
      active: products.filter((p: { isActive: boolean }) => p.isActive).length,
      inStock: products.filter((p: { inStock: boolean; isActive: boolean }) => p.inStock && p.isActive).length,
      outOfStock: products.filter((p: { inStock: boolean; isActive: boolean }) => !p.inStock && p.isActive).length,
      inactive: products.filter((p: { isActive: boolean }) => !p.isActive).length,
    };
  } catch {
    return null;
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Dashboard</h2>
        <Link href="/admin/products" className={styles.addBtn} id="dashboard-manage-products">
          Manage Products →
        </Link>
      </div>

      {stats ? (
        <div className={styles.statsGrid}>
          <StatCard label="Total Products" value={stats.total} color="blue" icon="📦" />
          <StatCard label="Active Products" value={stats.active} color="green" icon="✅" />
          <StatCard label="In Stock" value={stats.inStock} color="green" icon="🟢" />
          <StatCard label="Out of Stock" value={stats.outOfStock} color="amber" icon="🟡" />
          <StatCard label="Archived" value={stats.inactive} color="red" icon="🗃" />
        </div>
      ) : (
        <div className={styles.errorBanner}>
          Could not load statistics. Ensure the API is reachable and you are logged in.
        </div>
      )}

      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link href="/admin/products/new" className={styles.actionCard} id="dashboard-add-product">
            <span className={styles.actionIcon}>+</span>
            <span>Add New Product</span>
          </Link>
          <Link href="/admin/products" className={styles.actionCard} id="dashboard-view-products">
            <span className={styles.actionIcon}>🌿</span>
            <span>View All Products</span>
          </Link>
          <Link href="/" target="_blank" rel="noopener" className={styles.actionCard} id="dashboard-view-store">
            <span className={styles.actionIcon}>↗</span>
            <span>View Live Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
