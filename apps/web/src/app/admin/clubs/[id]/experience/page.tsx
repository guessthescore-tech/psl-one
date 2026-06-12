'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetClubExperience } from '@/lib/clubs-client';
import { getBetaToken } from '@/lib/auth-client';


interface ExperienceStatus {
  teamId: string;
  profileReady: boolean;
  squadReady: boolean;
  fixturesReady: boolean;
  venueReady: boolean;
  ticketsReady: boolean;
  shopfrontReady: boolean;
  catalogueReady: boolean;
  lastReviewedAt: string | null;
  reviewNotes: string | null;
}

const STATUS_ITEMS = [
  { key: 'profileReady', label: 'Club Profile' },
  { key: 'squadReady', label: 'Squad' },
  { key: 'fixturesReady', label: 'Fixtures' },
  { key: 'venueReady', label: 'Venue' },
  { key: 'ticketsReady', label: 'Tickets' },
  { key: 'shopfrontReady', label: 'Shopfront' },
  { key: 'catalogueReady', label: 'Catalogue' },
] as const;

export default function AdminClubExperiencePage() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<ExperienceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminGetClubExperience(getBetaToken(), id)
      .then(setStatus)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!status) return null;

  const readyCount = STATUS_ITEMS.filter((item) => status[item.key]).length;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href={`/admin/clubs/${id}`} className="text-sm text-blue-600 hover:underline">← Club</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold">Experience Status</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <p className="text-sm text-gray-500 mb-3">{readyCount}/{STATUS_ITEMS.length} readiness checks passed</p>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(readyCount / STATUS_ITEMS.length) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {STATUS_ITEMS.map(({ key, label }) => (
            <div key={key} className={`flex items-center gap-2 p-2 rounded-lg ${status[key] ? 'bg-green-50' : 'bg-gray-50'}`}>
              <span className={status[key] ? 'text-green-600' : 'text-gray-300'}>
                {status[key] ? '✓' : '○'}
              </span>
              <span className={`text-sm ${status[key] ? 'text-green-800 font-medium' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {status.reviewNotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs font-medium text-yellow-700 mb-1">Review Notes</p>
          <p className="text-sm text-yellow-800">{status.reviewNotes}</p>
        </div>
      )}

      {status.lastReviewedAt && (
        <p className="text-xs text-gray-400 mt-3">
          Last reviewed: {new Date(status.lastReviewedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
