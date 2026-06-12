'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetClubPlayers } from '@/lib/clubs-client';
import { getBetaToken } from '@/lib/auth-client';


interface Player {
  id: string;
  name: string;
  position: string;
  number: number | null;
  nationality: string;
  dateOfBirth: string | null;
}

const POSITION_ORDER = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];

export default function AdminClubPlayersPage() {
  const { id } = useParams<{ id: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    adminGetClubPlayers(getBetaToken(), id)
      .then(setPlayers)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading players…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  const sorted = [...players].sort((a, b) =>
    POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) || a.name.localeCompare(b.name),
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href={`/admin/clubs/${id}`} className="text-sm text-blue-600 hover:underline">← Club</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold">Players ({players.length})</h1>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-gray-500 text-sm">No players assigned to this club.</p>
          <p className="text-xs text-gray-400 mt-1">Use the player assignment API to add players.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Position</th>
                <th className="pb-2 pr-4">Nationality</th>
                <th className="pb-2">DOB</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-400">{p.number ?? '—'}</td>
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.position}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.nationality}</td>
                  <td className="py-2 text-gray-400">
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
