'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminGetSeasonTeams, adminRemoveTeamFromSeason, adminValidateSeasonParticipation } from '@/lib/clubs-client';

const TOKEN = 'dev-token';

interface SeasonTeam {
  seasonId: string;
  teamId: string;
  status: string;
  source: string;
  team: { id: string; name: string; slug: string };
}

interface ValidationResult {
  totalTeams: number;
  activeTeams: number;
  provisionalTeams: number;
  issues: string[];
  readiness: string;
}

export default function AdminSeasonClubsPage() {
  const { id: seasonId } = useParams<{ id: string }>();
  const [teams, setTeams] = useState<SeasonTeam[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function loadTeams() {
    if (!seasonId) return;
    try {
      const data = await adminGetSeasonTeams(TOKEN, seasonId);
      setTeams(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTeams(); }, [seasonId]);

  async function handleValidate() {
    if (!seasonId) return;
    try {
      const result = await adminValidateSeasonParticipation(TOKEN, seasonId);
      setValidation(result);
    } catch (e) {
      setError(String(e));
    }
  }

  async function handleRemove(teamId: string, teamName: string) {
    if (!seasonId) return;
    const confirmed = window.confirm(
      `Remove ${teamName} from this season?\n\nThis does not delete the club — it only removes their season participation record. This can be reversed by re-adding the team.`,
    );
    if (!confirmed) return;
    setRemoving(teamId);
    try {
      await adminRemoveTeamFromSeason(TOKEN, seasonId, teamId);
      await loadTeams();
    } catch (e) {
      setError(String(e));
    } finally {
      setRemoving(null);
    }
  }

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/clubs" className="text-sm text-blue-600 hover:underline">← Clubs</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold">Season Clubs ({teams.length})</h1>
        </div>
        <button onClick={handleValidate}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Validate Participation
        </button>
      </div>

      {validation && (
        <div className={`rounded-xl border p-4 mb-4 ${validation.readiness === 'READY' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-medium text-sm">{validation.readiness === 'READY' ? '✓ Season Ready' : '⚠ Not Ready'}</span>
            <span className="text-xs text-gray-500">{validation.activeTeams} active / {validation.totalTeams} total</span>
          </div>
          {validation.issues.map((issue, i) => <p key={i} className="text-xs text-red-600">• {issue}</p>)}
        </div>
      )}

      <div className="space-y-2">
        {teams.map((st) => (
          <div key={st.teamId} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <Link href={`/admin/clubs/${st.team.id}`} className="font-medium hover:underline">{st.team.name}</Link>
              <div className="flex gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${st.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {st.status}
                </span>
                <span className="text-xs text-gray-400">{st.source}</span>
              </div>
            </div>
            <button
              onClick={() => handleRemove(st.teamId, st.team.name)}
              disabled={removing === st.teamId}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 px-2 py-1 rounded hover:bg-red-50"
            >
              {removing === st.teamId ? 'Removing…' : 'Remove from Season'}
            </button>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <p className="text-gray-400 text-center py-12 text-sm">No clubs registered for this season.</p>
      )}
    </div>
  );
}
