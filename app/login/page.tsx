import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign In | VERDE PARFUMS',
  description: 'Sign in to your Verde account to track orders and save your favorite fragrances.',
};

export default function LoginPage() {
  return <LoginClient />;
}
