'use client';
import { useState } from 'react';
import Link from 'next/link';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useLanguage } from '@/app/context/LanguageContext';
import { api } from '@/app/lib/api';
import styles from '../login/Auth.module.css';

export default function ForgotPasswordClient() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState('');
  const [message, setMessage] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setLoading(false);
      setSubmitted(true);
      setMessage(res.message || 'If an account exists with this email, instructions to reset your password have been sent.');
    } catch {
      setLoading(false);
      setSubmitted(true);
      setMessage('If an account exists with this email, instructions to reset your password have been sent.');
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Decorative side */}
          <div className={styles.decorSide}>
            <div className={styles.decorContent}>
              <p className={styles.decorEyebrow}>{t.forgotPassword.welcome}</p>
              <h2 className={styles.decorHeading}>
                {t.forgotPassword.title}
              </h2>
              <p className={styles.decorText}>
                {t.forgotPassword.subtitle}
              </p>
            </div>
            <div className={styles.decorGlow} />
          </div>

          {/* Form side */}
          <div className={styles.formSide}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <Link href="/" className={styles.logo}>VERDE</Link>
                <h1 className={styles.formTitle}>{t.forgotPassword.title}</h1>
                <p className={styles.formSubtitle}>{t.forgotPassword.subtitle}</p>
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div className={styles.successBox} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>{message}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link
                      href="/reset-password/demo-reset-token"
                      className={styles.submitBtn}
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      تغيير كلمة السر الآن 🔑
                    </Link>

                    <Link href="/login" className={styles.switchLink} style={{ fontSize: '0.8rem' }}>
                      ← {t.forgotPassword.backToLogin}
                    </Link>
                  </div>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label htmlFor="reset-email">{t.forgotPassword.email}</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                    id="forgot-submit-btn"
                  >
                    {loading ? <span className={styles.spinner} /> : t.forgotPassword.sendLink}
                  </button>
                </form>
              )}

              <div className={styles.divider}>
                <span>OR</span>
              </div>

              <p className={styles.switchText}>
                <Link href="/login" className={styles.switchLink}>
                  {t.forgotPassword.backToLogin}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
