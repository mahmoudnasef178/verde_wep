'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './admin.module.css';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  userEmail?: string;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '⊞', exact: true },
  { href: '/admin/products', label: 'Products', icon: '🌿', exact: false },
];

export default function AdminLayoutClient({ children, userEmail }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  const isActive = (item: (typeof NAV_ITEMS)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const pageTitle =
    NAV_ITEMS.find((i) => isActive(i))?.label ?? 'Admin';

  return (
    <div className={styles.adminRoot}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <Link href="/admin" className={styles.sidebarLogo} onClick={closeSidebar}>
          <div className={styles.sidebarLogoIcon}>🌿</div>
          <div>
            <div className={styles.sidebarLogoText}>Verde Admin</div>
            <div className={styles.sidebarLogoSub}>Store Manager</div>
          </div>
        </Link>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item) ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span className={styles.navIcon}>↩</span>
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <span className={styles.topBarTitle}>{pageTitle}</span>
          </div>
          {userEmail && (
            <span className={styles.topBarUser}>{userEmail}</span>
          )}
        </header>
        <main className={styles.pageContent}>{children}</main>
      </div>
    </div>
  );
}
