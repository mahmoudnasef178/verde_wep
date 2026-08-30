'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import styles from '../login/Auth.module.css';

export default function SignupClient() {
  const router = useRouter();
  const { signup } = useAuth();
  const { t } = useLanguage();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const passwordStrength = (pw: string) => {
    if (pw.length === 0)  return { label: '', color: '', width: '0%' };
    if (pw.length < 6)    return { label: t.signup.strengthWeak,   color: '#e25c5c', width: '25%' };
    if (pw.length < 10)   return { label: t.signup.strengthFair,   color: '#c9a84c', width: '55%' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return { label: t.signup.strengthStrong, color: '#5aad78', width: '100%' };
    return { label: t.signup.strengthGood, color: '#5aad78', width: '75%' };
  };

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError(t.signup.passMismatch);
      return;
    }
    if (password.length < 6) {
      setError(t.signup.passTooShort);
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(t.signup.accountSuccess);
      setTimeout(() => router.push('/'), 1500);
    } else {
      setError(result.message);
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
              <p className={styles.decorEyebrow}>{t.signup.welcome}</p>
              <h2 className={styles.decorHeading}>
                {t.signup.title}
              </h2>
              <p className={styles.decorText}>
                {t.signup.subtitle}
              </p>
              <div className={styles.decorFeatures}>
                {t.signup.benefits.map(f => (
                  <div key={f} className={styles.decorFeature}>
                    <span className={styles.decorDot} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.decorGlow} />
          </div>

          {/* Form side */}
          <div className={styles.formSide}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <Link href="/" className={styles.logo}>VERDE</Link>
                <h1 className={styles.formTitle}>{t.signup.title}</h1>
                <p className={styles.formSubtitle}>{t.signup.subtitle}</p>
              </div>

              {error && (
                <div className={styles.errorBox} role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={styles.successBox} role="status">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit}>
                {/* Name */}
                <div className={styles.field}>
                  <label htmlFor="signup-name">{t.signup.firstName}</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="Ahmed Hassan"
                      required
                      minLength={2}
                      autoComplete="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className={styles.field}>
                  <label htmlFor="signup-email">{t.signup.email}</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      id="signup-email"
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

                {/* Password */}
                <div className={styles.field}>
                  <label htmlFor="signup-password">{t.signup.password}</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      id="signup-password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={styles.input}
                    />
                    <button type="button" className={styles.showPassBtn} onClick={() => setShowPass(!showPass)}>
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className={styles.strengthMeter}>
                      <div className={styles.strengthBar}>
                        <div
                          className={styles.strengthFill}
                          style={{ width: strength.width, background: strength.color }}
                        />
                      </div>
                      <span className={styles.strengthLabel} style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.field}>
                  <label htmlFor="signup-confirm">{t.signup.confirmPassword}</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <input
                      id="signup-confirm"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={`${styles.input} ${confirm && confirm !== password ? styles.inputError : ''}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading || !!success}
                  id="signup-submit-btn"
                >
                  {loading ? <span className={styles.spinner} /> : t.signup.createAccount}
                </button>
              </form>

              <div className={styles.divider}><span>{t.signup.or}</span></div>

              <p className={styles.switchText}>
                {t.signup.alreadyHave}{' '}
                <Link href="/login" className={styles.switchLink}>{t.signup.signIn}</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
