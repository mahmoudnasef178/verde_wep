'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Error:', error);
  }, [error]);

  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '600px',
        margin: '2rem auto',
        background: '#161b22',
        border: '1px solid rgba(248, 81, 73, 0.4)',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#e6edf3',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f85149' }}>
        حدث خطأ أثناء تحميل الصفحة
      </h2>
      <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {error.message || 'تعذر تحميل بيانات اللوحة، يرجى إعادة المحاولة أو العودة للرئيسية.'}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.6rem 1.25rem',
            background: '#2a6b41',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 إعادة المحاولة (Reload)
        </button>
        <Link
          href="/admin"
          style={{
            padding: '0.6rem 1.25rem',
            background: '#21262d',
            color: '#e6edf3',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          الرئيسية (Dashboard)
        </Link>
      </div>
    </div>
  );
}
