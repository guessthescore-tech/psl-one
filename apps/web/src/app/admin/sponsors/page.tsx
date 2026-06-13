'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminListSponsors } from '@/lib/sponsors-client';

interface Sponsor {
  id: string;
  name: string;
  slug: string;
  sector: string;
  status: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListSponsors(getBetaToken())
      .then((data: { sponsors: Sponsor[] }) => setSponsors(data.sponsors ?? data))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsors</h1>
          <p className="text-gray-500 mt-1">Manage PSL partner and sponsor accounts</p>
        </div>
        <Link href="/admin/sponsors/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium">
          + New Sponsor
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading sponsors…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      <div className="grid gap-3">
        {sponsors.map(s => (
          <div key={s.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{s.name}</span>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">{s.sector}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{s.slug}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/campaigns?sponsorId=${s.id}`} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">
                Campaigns
              </Link>
              <Link href={`/admin/sponsors/${s.id}`} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!loading && sponsors.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400 mt-4">
          <p>No sponsors yet</p>
          <Link href="/admin/sponsors/new" className="mt-2 inline-block text-blue-600 text-sm hover:underline">Add first sponsor</Link>
        </div>
      )}
    </div>
  );
}
