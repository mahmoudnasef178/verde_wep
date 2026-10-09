import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ProductForm, { ProductFormData } from '../../ProductForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://gradutionapi-production.up.railway.app';

export const metadata: Metadata = { title: 'Edit Product — Verde Admin' };

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('verde_admin_token')?.value;
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/admin/products?limit=1000`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.products ?? []).find((p: { _id: string }) => p._id === id) ?? null;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // Map DB fields → form fields
  const initialData: Partial<ProductFormData> = {
    name: product.name ?? '',
    slug: product.slug ?? '',
    subtitle: product.subtitle ?? '',
    price: String(product.price ?? ''),
    description: product.description ?? '',
    longDescription: product.longDescription ?? '',
    family: product.family ?? '',
    intensity: product.intensity ?? '',
    volume: product.volume ?? '',
    tag: product.tag ?? '',
    notes: (product.notes ?? []).join(', '),
    topNotes: (product.topNotes ?? []).join(', '),
    heartNotes: (product.heartNotes ?? []).join(', '),
    baseNotes: (product.baseNotes ?? []).join(', '),
    occasion: (product.occasion ?? []).join(', '),
    season: (product.season ?? []).join(', '),
    inStock: product.inStock ?? true,
    isActive: product.isActive ?? true,
    isAvailable: product.isAvailable ?? true,
    img: product.img ?? '',
    imgs: (product.imgs ?? []).join(', '),
  };

  return <ProductForm mode="edit" productId={id} initialData={initialData} />;
}
