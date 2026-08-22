import type { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout | VERDE PARFUMS',
  description: 'Complete your order with secure payment methods: Credit Card, Vodafone Cash, InstaPay, or Cash on Delivery.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
