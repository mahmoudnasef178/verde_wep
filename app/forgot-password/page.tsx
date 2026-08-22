import { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: 'Forgot Password | Verde Parfums',
  description: 'Reset your Verde Parfums account password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
