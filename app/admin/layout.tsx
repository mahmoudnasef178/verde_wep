import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin — Verde',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Read the email from the cookie payload for display — no secrets exposed
  let userEmail: string | undefined;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('verde_admin_token')?.value;
    if (token) {
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
      userEmail = payload.email;
    }
  } catch {
    // non-critical — just skip the email display
  }

  return <AdminLayoutClient userEmail={userEmail}>{children}</AdminLayoutClient>;
}
