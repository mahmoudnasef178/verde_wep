import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract real visitor IP (first IP in x-forwarded-for chain) or x-real-ip
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : (request.headers.get('x-real-ip') || '');
    const userAgent = request.headers.get('user-agent') || '';
    const cookieHeader = request.headers.get('cookie') || '';

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
