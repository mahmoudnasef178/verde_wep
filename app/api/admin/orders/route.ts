import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('verde_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const search = request.nextUrl.search;
  const url = `${API_URL}/api/orders${search}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error fetching orders' },
      { status: 500 }
    );
  }
}
