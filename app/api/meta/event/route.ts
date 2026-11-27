import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

/** Parse a cookie value from a raw Cookie header string */
function parseCookieValue(header: string, name: string): string | undefined {
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Mask IPv4 (keep first 2 octets) or IPv6 (keep first 3 groups) and flag internal/Vercel ranges */
function maskAndClassifyIp(ip: string): { masked: string; flag: string } {
  const clean = (ip || '').trim().replace(/^::ffff:/i, '');
  if (!clean) return { masked: 'none', flag: 'missing' };

  if (clean.includes(':')) {
    const groups = clean.split(':').slice(0, 3).join(':');
    const lower = clean.toLowerCase();
    const isInternal =
      lower === '::1' ||
      lower.startsWith('fe80:') ||
      lower.startsWith('fc') ||
      lower.startsWith('fd');
    return { masked: `${groups}::*`, flag: isInternal ? 'internal/private' : 'public-v6' };
  }

  const parts = clean.split('.');
  const masked = parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : 'invalid';
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  let flag = 'public-v4';
  if (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  ) {
    flag = 'private/internal';
  } else if (a === 76 && b === 76) {
    flag = 'vercel-edge-range';
  }
  return { masked, flag };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract real visitor IP (first IP in x-forwarded-for / x-vercel-forwarded-for / x-real-ip) — including IPv6
    const forwarded =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-vercel-forwarded-for') ||
      '';
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : (request.headers.get('x-real-ip') || '');
    const userAgent = request.headers.get('user-agent') || '';
    const cookieHeader = request.headers.get('cookie') || '';

    // Fallback: read _fbp and _fbc from server-side Cookie header when body lacks them (preserve exact fbc casing)
    const fbp = body.fbp || parseCookieValue(cookieHeader, '_fbp') || undefined;
    const fbc = body.fbc || parseCookieValue(cookieHeader, '_fbc') || undefined;

    // Read external_id from body (sent by trackMeta)
    const externalId = body.external_id || undefined;

    if (process.env.META_DEBUG_IDS === 'true') {
      console.log(`[META_DEBUG_IDS][Next] event_name=${body.event_name} event_id=${body.event_id}`);
    }
    if (process.env.META_IP_DEBUG === 'true') {
      const info = maskAndClassifyIp(clientIp);
      console.log(`[META_IP_DEBUG][Next] ip=${info.masked} class=${info.flag}`);
    }

    const backendRes = await fetch(`${API_URL}/api/meta/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIp,
        'x-client-ip': clientIp,
        'user-agent': userAgent,
        cookie: cookieHeader,
      },
      body: JSON.stringify({
        ...body,
        client_ip: clientIp,
        client_user_agent: userAgent,
        fbp,
        fbc,
        external_id: externalId,
      }),
    });

    const data = await backendRes.json().catch(() => ({ success: true }));
    return NextResponse.json(data, { status: backendRes.status || 200 });
  } catch (error: unknown) {
    // Non-blocking: tracking failures must never break user flow
    console.warn('[Meta CAPI Proxy] Error forwarding event:', error);
    return NextResponse.json({ success: true, message: 'Tracked with fallback' }, { status: 200 });
  }
}
