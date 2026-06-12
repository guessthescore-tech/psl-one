'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetClubShopReadiness } from '@/lib/clubs-client';
import { getBetaToken } from '@/lib/auth-client';


interface Product {
  id: string;
  name: string;
  status: string;
  category: string;
  featured: boolean;
  priceDisplay: string | null;
  currencyCode: string | null;
  imageUrl: string | null;
}

interface ShopReadiness {
  teamId: string;
  name: string;
  totalProducts: number;
  publishedProducts: number;
  products: Product[];
  issues: string[];
  commerceStatus: string;
  checkoutEnabled: boolean;
  readiness: string;
}

export default function AdminClubShopPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ShopReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminGetClubShopReadiness(getBetaToken(), id)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading shop readiness…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/admin/clubs/${id}`} className="text-sm text-blue-600 hover:underline">← Club</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold">Shop Readiness</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800">
        Commerce status: {data.commerceStatus}. Checkout not enabled in MVP. Commerce integration planned for Sprint 3.
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{data.totalProducts}</p>
          <p className="text-xs text-gray-500">Total Products</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{data.publishedProducts}</p>
          <p className="text-xs text-gray-500">Published</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${data.readiness === 'READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {data.readiness}
          </span>
        </div>
      </div>

      {data.issues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-red-700 mb-1">Issues</p>
          <ul className="text-xs text-red-600 space-y-0.5">
            {data.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {data.products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs flex-shrink-0">img</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.category} · {p.priceDisplay ?? 'Price TBC'}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {p.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
