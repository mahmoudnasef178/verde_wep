'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    const cleanEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setStatus('error');
      setFeedback(t.footer.invalidEmail);
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const res = await api.subscribeNewsletter(cleanEmail);
      if (res.success) {
        setStatus('success');
        if (res.alreadySubscribed) {
          setFeedback(t.footer.alreadySubscribed);
        } else {
          setFeedback(res.message || t.footer.subscribedSuccess);
        }
        setEmail('');
        if (typeof window !== 'undefined') {
          localStorage.setItem('verde_newsletter_subscribed', 'true');
        }
      } else {
        setStatus('error');
        setFeedback(res.message || t.footer.subError);
      }
    } catch {
      setStatus('error');
      setFeedback(t.footer.subError);
    }
  };

  return (
    <footer className={styles.footer}>
      {/* Verde Circle — Newsletter Section */}
      <div className={styles.newsletter}>
        {/* Decorative rings */}
        <div className={styles.ringOuter} aria-hidden="true" />
        <div className={styles.ringMiddle} aria-hidden="true" />
        <div className={styles.ringInner} aria-hidden="true" />

        <div className={styles.nlInner}>
          <div className={styles.nlText}>
            <span className={styles.nlEyebrow}>✦ THE VERDE CIRCLE ✦</span>
            <h3 className={styles.nlHeading}>{t.footer.joinCircle}</h3>
            <p className={styles.nlSub}>{t.footer.joinSub}</p>
            <ul className={styles.nlBenefits}>
              <li><span className={styles.checkIcon}>✦</span> Exclusive early-access drops</li>
              <li><span className={styles.checkIcon}>✦</span> Members-only offers & discounts</li>
              <li><span className={styles.checkIcon}>✦</span> Fragrance tips from the Verde team</li>
            </ul>
          </div>
          <div className={styles.nlFormWrapper}>
            {status === 'success' ? (
              <div className={styles.nlSuccessState} role="status">
                <div className={styles.nlSuccessIcon}>🌿</div>
                <p className={styles.nlSuccessMsg}>{feedback}</p>
              </div>
            ) : (
              <>
                <form className={styles.nlForm} onSubmit={handleSubscribe}>
                  <label htmlFor="newsletter-email" className="sr-only">
                    {t.footer.emailPlaceholder}
                  </label>
                  <input
                    type="email"
                    placeholder={t.footer.emailPlaceholder}
                    className={styles.nlInput}
                    id="newsletter-email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') {
                        setStatus('idle');
                        setFeedback('');
                      }
                    }}
                    disabled={status === 'loading'}
                  />
                  <button
                    type="submit"
                    className={`${styles.nlBtn} ${status === 'loading' ? styles.nlBtnDisabled : ''}`}
                    id="newsletter-submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? t.footer.submitting : t.footer.subscribe}
                  </button>
                </form>
                {feedback && (
                  <div
                    className={`${styles.nlFeedback} ${styles.nlError}`}
                    role="alert"
                  >
                    {feedback}
                  </div>
                )}
                <p className={styles.nlPrivacy}>🔒 No spam, unsubscribe anytime.</p>
              </>
            )}
          </div>
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
              {t.footer.brandDesc}
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
            <h4 className={styles.groupTitle}>{t.footer.shop}</h4>
            <ul className={styles.links}>
              {[
                { label: t.footer.allFragrances, href: '/products' },
                { label: t.footer.theCollection, href: '/products' },
                { label: t.footer.curatedCategories, href: '/#collections' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linksGroup}>
            <h4 className={styles.groupTitle}>{t.footer.information}</h4>
            <ul className={styles.links}>
              {[
                { label: t.footer.ourStory, href: '/#story' },
                { label: t.footer.faqLink, href: '/#faq' },
              ].map(item => (
                <li key={item.label}>
                  <Link href={item.href} className={styles.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linksGroup}>
            <h4 className={styles.groupTitle}>{t.footer.contact}</h4>
            <ul className={styles.links}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>{t.footer.location}</span>
                <span className={styles.contactValue}>{t.footer.locationValue}</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>{t.footer.hours}</span>
                <span className={styles.contactValue}>{t.footer.hoursValue}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copy}>© {new Date().getFullYear()} VERDE PARFUMS. All rights reserved.</p>
          <div className={styles.sslBadge}>
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
              <rect x="1" y="5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            256-BIT SSL
          </div>
          <div className={styles.bottomLinks}>
            <span className={styles.bottomLink}>Privacy Policy</span>
            <span className={styles.sep}>·</span>
            <span className={styles.bottomLink}>Terms of Service</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
