import { cookies } from 'next/headers';
import Link from 'next/link';
import styles from './dashboard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

interface StatsData {
  products: {
    total: number;
    active: number;
    inStock: number;
    outOfStock: number;
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    revenue: number;
  };
}

async function getStats(): Promise<StatsData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('verde_admin_token')?.value;
    if (!token) return null;

    const headers = { Authorization: `Bearer ${token}` };

    const [productsRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/products?limit=1000`, { headers, cache: 'no-store' }),
      fetch(`${API_URL}/api/orders`, { headers, cache: 'no-store' }).catch(() => null),
    ]);

    let products = [];
    if (productsRes.ok) {
      const data = await productsRes.json();
      products = data.products ?? [];
    }

    let ordersList = [];
    if (ordersRes && ordersRes.ok) {
      const ordersData = await ordersRes.json();
      ordersList = ordersData.orders ?? [];
    }

    const pendingOrders = ordersList.filter((o: { status: string }) => o.status === 'Pending').length;
    const deliveredOrders = ordersList.filter((o: { status: string }) => o.status === 'Delivered').length;
    const revenue = ordersList
      .filter((o: { status: string }) => o.status !== 'Cancelled')
      .reduce((acc: number, curr: { totalPrice?: number }) => acc + (curr.totalPrice || 0), 0);

    return {
      products: {
        total: products.length,
        active: products.filter((p: { isActive: boolean }) => p.isActive).length,
        inStock: products.filter((p: { inStock: boolean; isActive: boolean }) => p.inStock && p.isActive).length,
        outOfStock: products.filter((p: { inStock: boolean; isActive: boolean }) => !p.inStock && p.isActive).length,
      },
      orders: {
        total: ordersList.length,
        pending: pendingOrders,
        delivered: deliveredOrders,
        revenue,
      },
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
        <h2 className={styles.heading}>Dashboard Overview</h2>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link href="/admin/orders" className={styles.addBtn} id="dashboard-manage-orders" style={{ background: 'linear-gradient(135deg, #1f6feb, #388bfd)' }}>
            📦 View Orders →
          </Link>
          <Link href="/admin/products" className={styles.addBtn} id="dashboard-manage-products">
            🌿 Manage Products →
          </Link>
        </div>
      </div>

      {stats ? (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: '0.5rem', marginBottom: '1rem', color: '#8b949e', fontSize: '0.95rem' }}>
            📦 Orders & Sales Statistics
          </h3>
          <div className={styles.statsGrid}>
            <StatCard label="Total Orders" value={stats.orders.total} color="blue" icon="📦" />
            <StatCard label="Pending Orders" value={stats.orders.pending} color="amber" icon="🟡" />
            <StatCard label="Delivered" value={stats.orders.delivered} color="green" icon="🟢" />
            <StatCard
              label="Active Revenue"
              value={`${stats.orders.revenue.toLocaleString()} EGP`}
              color="green"
              icon="💰"
            />
          </div>

          <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#8b949e', fontSize: '0.95rem' }}>
            🌿 Inventory & Products
          </h3>
          <div className={styles.statsGrid}>
            <StatCard label="Total Products" value={stats.products.total} color="blue" icon="🏷️" />
            <StatCard label="Active" value={stats.products.active} color="green" icon="✅" />
            <StatCard label="In Stock" value={stats.products.inStock} color="green" icon="🟢" />
            <StatCard label="Out of Stock" value={stats.products.outOfStock} color="amber" icon="⚠️" />
          </div>
        </>
      ) : (
        <div className={styles.errorBanner}>
          Could not load statistics. Ensure the API is reachable and you are logged in.
        </div>
      )}

      <div className={styles.quickActions} style={{ marginTop: '2rem' }}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link href="/admin/orders" className={styles.actionCard} id="dashboard-view-orders">
            <span className={styles.actionIcon}>📦</span>
            <span>Manage Orders</span>
          </Link>
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

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
