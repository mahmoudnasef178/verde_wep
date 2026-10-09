import type { Metadata } from 'next';
import ProductForm from '../ProductForm';

export const metadata: Metadata = { title: 'Add Product — Verde Admin' };

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
