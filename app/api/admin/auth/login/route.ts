import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

/**
 * POST /api/admin/auth/login
 * Server-side route handler: calls the backend, then sets an httpOnly cookie
 * so the JWT is never exposed to client-side JS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Forward credentials to the real API
    const apiRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Invalid credentials' },
        { status: apiRes.status }
      );
    }

    // Only allow admin users through
    if (data.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Set the token in an httpOnly cookie — never accessible to JS
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      },
    });

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('verde_admin_token', data.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[admin/auth/login]', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
