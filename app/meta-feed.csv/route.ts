import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

export const revalidate = 300; // 5 minutes cache

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/meta-feed.csv`, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'text/csv, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }

    const csv = await res.text();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching CSV feed';
    return new NextResponse(message, {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
