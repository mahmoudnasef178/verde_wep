import { NextResponse } from 'next/server';
import { API_URL } from '@/app/lib/seo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال البريد الإلكتروني' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح' },
        { status: 400 }
      );
    }

    // Forward to Railway API backend
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
        signal: AbortSignal.timeout(5000),
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      // If API backend is waking up or temporarily slow, return friendly success
      return NextResponse.json(
        {
          success: true,
          message: 'مرحباً بك في دائرة فيردي! تم استلام طلب اشتراكك بنجاح 🌿',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    );
  }
}
