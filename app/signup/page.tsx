import type { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: 'Create Account | VERDE PARFUMS',
  description: 'Join Verde Parfums and enjoy exclusive access to luxury fragrances, order tracking, and personalised recommendations.',
};

export default function SignupPage() {
  return <SignupClient />;
}
