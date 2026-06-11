'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getClubShop } from '@/lib/clubs-client';

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
  commerceStatus: string;
}

interface ShopData {
  teamId: string;
  name: string;
  checkoutEnabled: boolean;
  commerceNote: string;
  commerceStatus: string;
  categories: string[];
  products: Product[];
}

const CATEGORY_LABELS: Record<string, string> = {
  HOME_KIT: 'Home Kit', AWAY_KIT: 'Away Kit', THIRD_KIT: 'Third Kit',
  TRAINING_WEAR: 'Training Wear', LIFESTYLE: 'Lifestyle', ACCESSORIES: 'Accessories',
  SOUVENIRS: 'Souvenirs', KIDS: 'Kids',
};

export default function ClubShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubShop(slug)
      .then(setShop)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading shop…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!shop) return null;

  const filtered = activeCategory
    ? shop.products.filter((p) => p.category === activeCategory)
    : shop.products;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-1">Club Shop</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
        {shop.commerceNote}
      </div>

      {shop.categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${!activeCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            All
          </button>
          {shop.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <Link key={product.id} href={`/clubs/${slug}/shop/${product.slug}`}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="w-full h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-300 text-xs">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="object-contain h-full" />
              ) : (
                'No image'
              )}
            </div>
            {product.featured && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mb-1 inline-block">Featured</span>
            )}
            <p className="text-sm font-medium leading-tight">{product.name}</p>
            <p className="text-xs text-gray-500 mt-1">{product.priceDisplay ?? 'Price TBC'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{product.availability === 'COMING_SOON' ? 'Coming soon' : product.availability}</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-center py-12 text-sm">No products in this category.</p>
      )}
    </div>
  );
}
