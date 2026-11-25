'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ensureFbc, trackMeta } from '@/lib/meta';

function MetaPixelTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string>('');

  useEffect(() => {
    ensureFbc();

    const search = searchParams?.toString();
    const currentUrl = `${pathname || '/'}${search ? `?${search}` : ''}`;

    // Prevent React StrictMode double-mount duplicate while firing on initial load & every SPA route change
    if (lastTrackedUrl.current === currentUrl) return;
    lastTrackedUrl.current = currentUrl;

    // Fires both fbq('track', 'PageView', {}, { eventID }) and CAPI PageView with same event_id
    trackMeta('PageView');
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixelTracker() {
  return (
    <Suspense fallback={null}>
      <MetaPixelTrackerInner />
    </Suspense>
  );
}
