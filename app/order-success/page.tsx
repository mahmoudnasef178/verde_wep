import type { Metadata } from 'next';
import OrderSuccessClient from './OrderSuccessClient';

export const metadata: Metadata = {
  title: 'Order Confirmed | VERDE PARFUMS',
  description: 'Thank you for your order with Verde Parfums.',
};

export default function OrderSuccessPage() {
  return <OrderSuccessClient />;
}
