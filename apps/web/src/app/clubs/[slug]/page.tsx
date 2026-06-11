'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getClubBySlug } from '@/lib/clubs-client';

interface Club {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  logoUrl: string | null;
  clubProfile: {
    primaryColor: string | null;
    secondaryColor: string | null;
    city: string | null;
    country: string;
    description: string | null;
    websiteUrl: string | null;
    profileStatus: string;
  } | null;
}

const TABS = [
  { label: 'Overview', path: 'overview' },
  { label: 'Fixtures', path: 'fixtures' },
  { label: 'Results', path: 'results' },
  { label: 'Squad', path: 'squad' },
  { label: 'Stats', path: 'stats' },
  { label: 'Stadium', path: 'stadium' },
  { label: 'Tickets', path: 'tickets' },
  { label: 'Shop', path: 'shop' },
];

export default function ClubPage() {
  const { slug } = useParams<{ slug: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubBySlug(slug)
      .then(setClub)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!club) return null;

  const primary = club.clubProfile?.primaryColor ?? '#1e3a5f';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-32 flex items-end px-6 pb-4" style={{ backgroundColor: primary }}>
        <div>
          <h1 className="text-2xl font-bold text-white">{club.name}</h1>
          {club.clubProfile?.city && (
            <p className="text-sm text-white/80">{club.clubProfile.city}, {club.clubProfile.country}</p>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 py-2 bg-white border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.path}
            href={`/clubs/${slug}/${tab.path}`}
            className="px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap hover:bg-gray-100 text-gray-700"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="p-4">
        {club.clubProfile?.description ? (
          <p className="text-gray-600 text-sm">{club.clubProfile.description}</p>
        ) : (
          <p className="text-gray-400 text-sm">Club profile coming soon.</p>
        )}
        {club.clubProfile?.websiteUrl && (
          <a href={club.clubProfile.websiteUrl} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            Official Website
          </a>
        )}
      </div>
    </div>
  );
}
