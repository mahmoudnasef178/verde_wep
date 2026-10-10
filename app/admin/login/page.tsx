'use client';
import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

// ── Inner component that uses useSearchParams ──
function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? 'Login failed. Check your credentials.');
        return;
      }

      // Cookie is set by the server route handler — redirect to dashboard
      router.push(from);
      router.refresh();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🌿</div>
          <div className={styles.logoText}>
            <h1>Verde Admin</h1>
            <p>Store Management</p>
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="admin-email" className={styles.label}>
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="admin@verdeperfumes.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password" className={styles.label}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !email || !password}
            id="admin-login-submit"
          >
            {loading ? 'Signing in…' : 'Sign in to Admin'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← Back to store
        </Link>
      </div>
    </div>
  );
}

// ── Page export: wraps the form in Suspense (required by Next.js for useSearchParams) ──
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
