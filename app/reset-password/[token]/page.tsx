import { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password | Verde Parfums',
  description: 'Set a new password for your Verde Parfums account.',
};

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  return <ResetPasswordClient token={resolvedParams.token} />;
}
