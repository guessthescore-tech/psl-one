'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getClubShopProduct } from '@/lib/clubs-client';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  priceDisplay: string | null;
  featured: boolean;
  imageUrl: string | null;
  availability: string;
  checkoutEnabled: boolean;
  commerceNote: string;
}

export default function ClubShopProductPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !productSlug) return;
    getClubShopProduct(slug, productSlug)
      .then(setProduct)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug, productSlug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading product…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href={`/clubs/${slug}/shop`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Back to shop
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-300">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="object-contain h-full" />
          ) : (
            <span className="text-sm">No image available</span>
          )}
        </div>

        <div className="p-5 space-y-3">
          <h1 className="text-xl font-bold">{product.name}</h1>
          {product.description && <p className="text-gray-600 text-sm">{product.description}</p>}

          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold">{product.priceDisplay ?? 'Price TBC'}</span>
            <span className="text-sm text-gray-400">
              {product.availability === 'COMING_SOON' ? 'Coming soon' : product.availability}
            </span>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
            {product.commerceNote}
          </div>

          <button
            disabled
            className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-medium cursor-not-allowed"
          >
            Add to Cart — Not Available in MVP
          </button>
        </div>
      </div>
    </div>
  );
}
