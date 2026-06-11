'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetClubDetail, adminValidateClub } from '@/lib/clubs-client';

const TOKEN = 'dev-token';

interface ClubDetail {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  country: string;
  clubProfile: {
    profileStatus: string;
    primaryColor: string | null;
    city: string | null;
    description: string | null;
  } | null;
  experienceStatus: {
    profileReady: boolean;
    squadReady: boolean;
    shopfrontReady: boolean;
    fixturesReady: boolean;
    venueReady: boolean;
    lastReviewedAt: string | null;
    reviewNotes: string | null;
  } | null;
  _count: { players: number; contentItems: number; shopProducts: number };
}

export default function AdminClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [validating, setValidating] = useState(false);
  const [validateResult, setValidateResult] = useState<{ readiness: string; issues: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminGetClubDetail(TOKEN, id)
      .then(setClub)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  async function runValidation() {
    if (!id) return;
    setValidating(true);
    try {
      const result = await adminValidateClub(TOKEN, id);
      setValidateResult(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setValidating(false);
    }
  }

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!club) return null;

  const ADMIN_TABS = [
    { label: 'Experience', path: 'experience' },
    { label: 'Players', path: 'players' },
    { label: 'Fixtures', path: 'fixtures' },
    { label: 'Shop', path: 'shop' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/clubs" className="text-sm text-blue-600 hover:underline">← Clubs</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold">{club.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{club._count.players}</p>
          <p className="text-xs text-gray-500">Players</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{club._count.contentItems}</p>
          <p className="text-xs text-gray-500">Content Items</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold">{club._count.shopProducts}</p>
          <p className="text-xs text-gray-500">Shop Products</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {ADMIN_TABS.map((tab) => (
          <Link key={tab.path} href={`/admin/clubs/${id}/${tab.path}`}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">Data Quality Validation</h2>
          <button onClick={runValidation} disabled={validating}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {validating ? 'Validating…' : 'Run Validation'}
          </button>
        </div>
        {validateResult && (
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${validateResult.readiness === 'READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {validateResult.readiness}
            </span>
            {validateResult.issues.length > 0 && (
              <ul className="mt-2 text-xs text-red-600 space-y-0.5">
                {validateResult.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
              </ul>
            )}
          </div>
        )}
        {club.experienceStatus?.reviewNotes && (
          <p className="text-xs text-gray-400 mt-2">{club.experienceStatus.reviewNotes}</p>
        )}
      </div>
    </div>
  );
}
