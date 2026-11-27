'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ensureFbc, getOrCreateExternalId, initParamBuilder, trackMeta } from '@/lib/meta';

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Synchronously ensure _verde_eid & _fbc cookies exist BEFORE the first PageView event
    getOrCreateExternalId();
    ensureFbc();
    // Warm up ParamBuilder in background so _fbp & _fbc cookies stay fresh
    initParamBuilder();

    const search = typeof window !== 'undefined' ? window.location.search : '';
    const currentUrl = `${pathname || '/'}${search}`;

    // Prevent React StrictMode double-mount duplicate while firing on initial load & every SPA route change
    if (lastTrackedPath.current === currentUrl) return;
    lastTrackedPath.current = currentUrl;

    // Fires standard fbq('track', 'PageView', undefined, { eventID }) + CAPI PageView with same event_id
    trackMeta('PageView');
  }, [pathname]);

  return null;
}
