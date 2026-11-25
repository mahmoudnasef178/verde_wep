'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { metaTrack } from '@/app/lib/metaPixel';

function MetaPixelTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Prevent duplicate PageView on initial SSR page load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (typeof window !== 'undefined') {
        window._initialPageViewFired = true;
      }
      return;
    }

    // Fire PageView on client-side route changes in the SPA
    metaTrack('PageView');
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
