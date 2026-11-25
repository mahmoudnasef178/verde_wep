import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

export const revalidate = 300; // 5 minutes cache

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/meta-feed.xml`, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/xml, text/xml, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }

    const xml = await res.text();

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching feed';
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error><message>${message}</message></error>`,
      {
        status: 502,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    );
  }
}
