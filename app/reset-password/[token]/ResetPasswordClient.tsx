'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { api } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from '../../login/Auth.module.css';

export default function ResetPasswordClient({ token }: { token: string }) {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t.resetPassword.emailRequired);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.resetPassword.passMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.resetPassword.passTooShort);
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password);
    } catch {}

    await resetPassword(email, password);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 2500);
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
              <p className={styles.decorEyebrow}>{t.resetPassword.welcome}</p>
              <h2 className={styles.decorHeading}>
                {t.resetPassword.title}
              </h2>
              <p className={styles.decorText}>
                {t.resetPassword.subtitle}
              </p>
            </div>
            <div className={styles.decorGlow} />
          </div>

          {/* Form side */}
          <div className={styles.formSide}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <Link href="/" className={styles.logo}>VERDE</Link>
                <h1 className={styles.formTitle}>{t.resetPassword.title}</h1>
                <p className={styles.formSubtitle}>{t.resetPassword.subtitle}</p>
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div className={styles.successBox} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>{t.resetPassword.successMessage}</span>
                  </div>
                  <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none', display: 'inline-flex' }}>
                    {t.resetPassword.signInNow}
                  </Link>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label htmlFor="reset-user-email">{t.resetPassword.email}</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="reset-user-email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="new-password">{t.resetPassword.newPassword}</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="new-password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="confirm-password">{t.resetPassword.confirmPassword}</label>
                    <div className={styles.inputWrap}>
                      <input
                        id="confirm-password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? <span className={styles.spinner} /> : t.resetPassword.updateBtn}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
