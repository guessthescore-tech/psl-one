'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClubTickets } from '@/lib/clubs-client';

interface TicketData {
  teamId: string;
  name: string;
  ticketingUrl: string | null;
  status: string;
  message: string;
  commerceNote: string;
}

export default function ClubTicketsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getClubTickets(slug)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading ticketing info…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Tickets</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-yellow-800">Ticketing not enabled in MVP</p>
        <p className="text-xs text-yellow-700 mt-1">{data.commerceNote}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <p className="text-gray-600 text-sm">{data.message}</p>
        {data.ticketingUrl ? (
          <a
            href={data.ticketingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Club Ticketing Website
          </a>
        ) : (
          <p className="text-sm text-gray-400">No ticketing partner configured yet.</p>
        )}
      </div>
    </div>
  );
}
