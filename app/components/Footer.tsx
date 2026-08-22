'use client';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Newsletter strip */}
      <div className={styles.newsletter}>
        <div className={styles.nlInner}>
          <div className={styles.nlText}>
            <h3 className={styles.nlHeading}>Join the Verde Circle</h3>
            <p className={styles.nlSub}>Be the first to know about new drops and exclusive offers.</p>
          </div>
          <form className={styles.nlForm} onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className={styles.nlInput}
              id="newsletter-email"
            />
            <button type="submit" className={styles.nlBtn} id="newsletter-submit">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className={styles.main}>
        <div className={styles.container}>
          {/* Brand column */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoMain}>VERDE</span>
              <span className={styles.logoSub}>PARFUMS</span>
            </Link>
            <p className={styles.brandDesc}>
              Luxury fragrances born from the heart of nature. Crafted for those who 
              seek the extraordinary in the everyday.
            </p>
            <div className={styles.socials}>
              {/* Instagram */}
              <a href="https://www.instagram.com/verde_perfumes/" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Instagram" id="footer-instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61591567621224" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="Facebook" id="footer-facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@verde5194" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="TikTok" id="footer-tiktok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/201112333598" target="_blank" rel="noopener noreferrer" className={styles.social} aria-label="WhatsApp" id="footer-whatsapp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.linksGroup}>
            <h4 className={styles.groupTitle}>SHOP</h4>
            <ul className={styles.links}>
              {[
                { label: 'All Fragrances', href: '/#products' },
                { label: 'The Collection', href: '/#products' },
                { label: 'Curated Categories', href: '/#collections' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linksGroup}>
            <h4 className={styles.groupTitle}>INFORMATION</h4>
            <ul className={styles.links}>
              {[
                { label: 'Our Story', href: '/#story' },
                { label: 'Frequently Asked Questions', href: '/#faq' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linksGroup}>
            <h4 className={styles.groupTitle}>CONTACT</h4>
            <ul className={styles.links}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Email</span>
                <a href="mailto:info@verde-parfums.com" className={styles.link}>info@verde-parfums.com</a>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Location</span>
                <span className={styles.contactValue}>Cairo, Egypt</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Hours</span>
                <span className={styles.contactValue}>24 Hours, Every Day</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copy}>© 2024 VERDE PARFUMS. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/#faq" className={styles.bottomLink}>Privacy Policy</Link>
            <span className={styles.sep}>·</span>
            <Link href="/#faq" className={styles.bottomLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
