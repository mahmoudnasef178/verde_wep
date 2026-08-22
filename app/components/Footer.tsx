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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.852 0-3.664-.495-5.263-1.433l-.377-.222-3.913 1.026 1.044-3.813-.245-.39A9.79 9.79 0 0 1 2.25 12c0-5.378 4.373-9.75 9.801-9.75 5.426 0 9.8 4.372 9.8 9.75 0 5.378-4.374 9.75-9.8 9.75m0-21.5C5.938.343.857 5.424.857 11.686c0 2.215.64 4.374 1.85 6.223L0 24l6.326-1.659c1.782.971 3.799 1.483 5.86 1.484 6.257 0 11.338-5.081 11.338-11.143s-5.08-11.142-11.337-11.142z"/>
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
        </div>
      </div>
    </footer>
  );
}
