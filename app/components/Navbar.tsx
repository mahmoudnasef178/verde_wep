'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import SearchModal from './SearchModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Collection', href: '/#products' },
  { label: 'Categories', href: '/#collections' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Navbar() {
  const router = useRouter();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { totalItems, openDrawer } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push('/');
  };

  // initials avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Left nav links (Desktop) */}
          <div className={styles.leftLinks}>
            {navLinks.slice(0, 2).map(link => (
              <Link key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Logo (Centered on Desktop, Left on Mobile) */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMain}>VERDE</span>
            <span className={styles.logoSub}>PARFUMS</span>
          </Link>

          {/* Right section: Links (desktop) + Icons (all devices) + Hamburger */}
          <div className={styles.rightSection}>
            <div className={styles.rightLinks}>
              {navLinks.slice(2).map(link => (
                <Link key={link.label} href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={styles.icons}>
              {/* Search */}
              <button
                className={styles.iconBtn}
                aria-label="Search"
                id="nav-search-btn"
                onClick={() => setSearchOpen(true)}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className={styles.shortcut}>⌘K</span>
              </button>

              {/* User / Auth */}
              {!isLoading && (
                isAuthenticated ? (
                  /* ── Logged-in: Avatar + dropdown ── */
                  <div className={styles.userMenu} ref={userMenuRef}>
                    <button
                      className={styles.avatarBtn}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      id="nav-user-btn"
                      aria-label="User menu"
                    >
                      <span className={styles.avatarCircle}>{initials}</span>
                    </button>

                    {userMenuOpen && (
                      <div className={styles.userDropdown}>
                        <div className={styles.userDropdownHeader}>
                          <span className={styles.userDropdownName}>{user?.name}</span>
                          <span className={styles.userDropdownEmail}>{user?.email}</span>
                        </div>
                        <div className={styles.userDropdownItems}>
                          <Link href="/cart" onClick={() => setUserMenuOpen(false)} className={styles.userDropdownItem}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                            </svg>
                            My Orders
                          </Link>
                          <button
                            className={`${styles.userDropdownItem} ${styles.logoutItem}`}
                            onClick={handleLogout}
                            id="nav-logout-btn"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Guest: Login link (Desktop only) ── */
                  <Link href="/login" className={styles.loginLink} id="nav-login-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className={styles.loginText}>SIGN IN</span>
                  </Link>
                )
              )}

              {/* Cart */}
              <button
                className={styles.iconBtn}
                aria-label="Cart"
                id="nav-cart-btn"
                onClick={openDrawer}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
              </button>

              {/* Mobile hamburger */}
              <button
                className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                id="nav-mobile-menu-btn"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileInner}>
          <div className={styles.mobileLogo}>VERDE</div>
          <nav className={styles.mobileNav}>
            {navLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              Cart ({totalItems})
            </Link>
          </nav>

          {/* Auth buttons in mobile */}
          {!isLoading && (
            isAuthenticated ? (
              <div className={styles.mobileAuthBox}>
                <p className={styles.mobileUserName}>{user?.name}</p>
                <button className={styles.mobileLogoutBtn} onClick={handleLogout}>
                  SIGN OUT
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuthBox}>
                <Link href="/login" onClick={() => setMenuOpen(false)} className={styles.mobileLoginBtn}>
                  SIGN IN
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className={styles.mobileSignupBtn}>
                  CREATE ACCOUNT
                </Link>
              </div>
            )
          )}

          <button
            className={styles.mobileSearchBtn}
            onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
            id="mobile-search-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            SEARCH FRAGRANCES
          </button>
          <div className={styles.mobileFooter}>
            <p>Cairo, Egypt</p>
          </div>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
