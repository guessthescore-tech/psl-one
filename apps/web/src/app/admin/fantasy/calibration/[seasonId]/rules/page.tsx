'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getFantasyRules, createProvisionalRules } from '@/lib/fantasy-calibration-client';
import Link from 'next/link';

interface RulesConfig {
  seasonId: string;
  squadSize: number;
  goalkeeperCount: number;
  defenderCount: number;
  midfielderCount: number;
  forwardCount: number;
  startingXiSize: number;
  benchSize: number;
  freeTransfersPerGameweek: number;
  maxSavedFreeTransfers: number;
  extraTransferCost: number;
  halfwayGameweek: number;
  seasonGameweekCount: number;
  wildcardCount: number;
  freeHitCount: number;
  benchBoostCount: number;
  tripleCaptainCount: number;
}

function RuleRow({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2 text-sm text-gray-600">{label}</td>
      <td className="px-4 py-2 text-sm font-medium text-gray-900">{String(value)}</td>
    </tr>
  );
}

export default function RulesPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [rules, setRules] = useState<RulesConfig | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRules = () => {
    if (!seasonId) return;
    getFantasyRules(seasonId)
      .then((d) => setRules(d as RulesConfig | null))
      .catch((e: unknown) => setError(String(e)));
  };

  useEffect(() => { loadRules(); }, [seasonId]);

  const handleCreateProvisional = async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createProvisionalRules(seasonId!);
      setRules(created as RulesConfig);
      setSuccess('Provisional PSL rules created (seasonGameweekCount=30, halfwayGameweek=15)');
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/fantasy/calibration/${seasonId}`} className="text-sm text-blue-600 hover:underline">
          ← Calibration Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Fantasy Rules Config</h1>
        <p className="text-sm text-gray-500 mt-1">
          PSL provisional rules: 30-round season, 15-gameweek halfway point.
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm">{success}</div>}

      {!rules ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            No rules config found for this season.
          </div>
          <button
            onClick={handleCreateProvisional}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create Provisional PSL Rules'}
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              PROVISIONAL — Not official PSL data
            </p>
          </div>
          <table className="min-w-full">
            <tbody>
              <RuleRow label="Squad Size" value={rules.squadSize} />
              <RuleRow label="Goalkeepers" value={rules.goalkeeperCount} />
              <RuleRow label="Defenders" value={rules.defenderCount} />
              <RuleRow label="Midfielders" value={rules.midfielderCount} />
              <RuleRow label="Forwards" value={rules.forwardCount} />
              <RuleRow label="Starting XI" value={rules.startingXiSize} />
              <RuleRow label="Bench Size" value={rules.benchSize} />
              <RuleRow label="Free Transfers / GW" value={rules.freeTransfersPerGameweek} />
              <RuleRow label="Max Saved Transfers" value={rules.maxSavedFreeTransfers} />
              <RuleRow label="Extra Transfer Cost" value={`-${rules.extraTransferCost} pts`} />
              <RuleRow label="Season Gameweeks" value={rules.seasonGameweekCount} />
              <RuleRow label="Halfway Gameweek" value={rules.halfwayGameweek} />
              <RuleRow label="Wildcards" value={rules.wildcardCount} />
              <RuleRow label="Free Hits" value={rules.freeHitCount} />
              <RuleRow label="Bench Boosts" value={rules.benchBoostCount} />
              <RuleRow label="Triple Captains" value={rules.tripleCaptainCount} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
