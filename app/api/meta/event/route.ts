import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

/** Parse a cookie value from a raw Cookie header string */
function parseCookieValue(header: string, name: string): string | undefined {
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract real visitor IP (first IP in x-forwarded-for chain) or x-real-ip — including IPv6
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || '');
    const userAgent = request.headers.get('user-agent') || '';
    const cookieHeader = request.headers.get('cookie') || '';

    // Fallback: read _fbp and _fbc from server-side Cookie header when body lacks them
    // (handles cases where the browser Pixel was blocked but the cookie was set by ParamBuilder)
    const fbp = body.fbp || parseCookieValue(cookieHeader, '_fbp') || undefined;
    const fbc = body.fbc || parseCookieValue(cookieHeader, '_fbc') || undefined;

    // Read external_id from body (sent by trackMeta)
    const externalId = body.external_id || undefined;

    const backendRes = await fetch(`${API_URL}/api/meta/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': clientIp,
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
