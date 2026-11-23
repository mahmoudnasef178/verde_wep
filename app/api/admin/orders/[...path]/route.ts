import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

async function proxyOrderRequest(request: NextRequest, pathParts: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get('verde_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const apiPath = pathParts.join('/');
  const search = request.nextUrl.search;
  const url = `${API_URL}/api/orders/${apiPath}${search}`;

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (!['GET', 'HEAD'].includes(request.method)) {
      fetchOptions.body = await request.text();
    }

    const res = await fetch(url, fetchOptions);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error communicating with orders API' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyOrderRequest(request, path ?? []);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyOrderRequest(request, path ?? []);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyOrderRequest(request, path ?? []);
}
