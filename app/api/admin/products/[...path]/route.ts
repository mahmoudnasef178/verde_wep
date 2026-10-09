import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

/**
 * Generic proxy for all admin product API calls.
 * Reads the httpOnly cookie and forwards it as Authorization: Bearer to the backend.
 * Route: /api/admin/products/[...path]
 */

async function proxyRequest(request: NextRequest, pathParts: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get('verde_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const apiPath = pathParts.join('/');
  const search = request.nextUrl.search;
  const url = `${API_URL}/api/admin/products/${apiPath}${search}`;

  const isFormData = request.headers.get('content-type')?.includes('multipart/form-data');

  const fetchOptions: RequestInit = {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for multipart (let fetch set boundary automatically)
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    },
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    fetchOptions.body = isFormData ? await request.formData() as unknown as BodyInit : await request.text();
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path ?? []);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path ?? []);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path ?? []);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path ?? []);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path ?? []);
}
