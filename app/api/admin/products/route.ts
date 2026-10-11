import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

/**
 * Root handler for /api/admin/products (GET all, POST create)
 * The [...path] catch-all does NOT match the root path itself.
 */

async function proxyRoot(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('verde_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const search = request.nextUrl.search;
  const url = `${API_URL}/api/admin/products${search}`;

  const isFormData = request.headers.get('content-type')?.includes('multipart/form-data');

  const fetchOptions: RequestInit = {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    fetchOptions.body = isFormData
      ? (await request.formData() as unknown as BodyInit)
      : await request.text();
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: NextRequest) {
  return proxyRoot(request);
}

export async function POST(request: NextRequest) {
  return proxyRoot(request);
}
