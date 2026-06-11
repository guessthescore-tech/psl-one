'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fantasyClient, FantasyTeam, FantasyTeamPlayer, PlayerSummary } from '../../../lib/fantasy-client';
import { getTransferStatus, TransferStatus } from '@/lib/fantasy-rules-client';

const POS_LABEL: Record<string, string> = {
  GOALKEEPER: 'GK', DEFENDER: 'DEF', MIDFIELDER: 'MID', FORWARD: 'FWD',
};

const LOCK_LABEL: Record<string, string> = {
  TRANSFER_DEADLINE: 'Transfer deadline has passed',
  GAMEWEEK_LOCKED: 'Gameweek is locked',
  GAMEWEEK_LIVE: 'Gameweek is in progress',
  GAMEWEEK_COMPLETED: 'Gameweek is completed',
  OPEN: 'Open for transfers',
};

export default function TransfersPage() {
  const router = useRouter();
  const [team, setTeam] = useState<FantasyTeam | null>(null);
  const [pool, setPool] = useState<PlayerSummary[]>([]);
  const [status, setStatus] = useState<TransferStatus | null>(null);
  const [removing, setRemoving] = useState<FantasyTeamPlayer | null>(null);
  const [adding, setAdding] = useState<PlayerSummary | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fantasyClient.getMyTeam().catch(e => { throw e; }),
      fantasyClient.getPlayerPool(),
      getTransferStatus().catch(() => null),
    ])
      .then(([t, p, s]) => { setTeam(t); setPool(p); setStatus(s); })
      .catch(e => {
        if ((e as Error).message === 'UNAUTHORIZED') { router.replace('/login'); return; }
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const isLocked = status?.isDeadlineLocked ?? false;

  const squadIds = new Set(team?.players.map(p => p.playerId) ?? []);
  const eligible = pool.filter(p =>
    !squadIds.has(p.id) &&
    (removing ? p.position === removing.position : true) &&
    (search ? p.name.toLowerCase().includes(search.toLowerCase()) || p.team.shortName.toLowerCase().includes(search.toLowerCase()) : true),
  );

  async function handleTransfer() {
    if (!removing || !adding) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await fantasyClient.makeTransfer(removing.playerId, adding.id);
      setTeam(updated);
      setRemoving(null);
      setAdding(null);
      setSearch('');
      setSuccess(`Transferred ${removing.player.name} → ${adding.name}`);
      const s = await getTransferStatus().catch(() => null);
      if (s) setStatus(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Transfers</h1>

      {/* Transfer status banner */}
      {status && (
        <div className={`rounded-xl border p-4 text-sm ${isLocked ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isLocked ? 'text-red-700' : 'text-green-700'}`}>
                {isLocked ? 'LOCKED' : 'OPEN'}
              </span>
              <span className="text-gray-600">{LOCK_LABEL[status.lockReason] ?? status.lockReason}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Free transfers: <strong>{status.freeTransfersAvailable}</strong></span>
              <span>Used this GW: <strong>{status.gameweekTransferCount}/{status.maxTransfersPerGameweek}</strong></span>
              <span>Next cost: <strong className={status.nextTransferCost > 0 ? 'text-red-600' : 'text-green-600'}>
                {status.nextTransferCost > 0 ? `-${status.nextTransferCost}pts` : 'Free'}
              </strong></span>
            </div>
          </div>
          {!status.hasPassedFirstDeadline && (
            <p className="mt-1 text-xs text-blue-700">Unlimited free transfers until your first gameweek deadline.</p>
          )}
          {status.nextTransferCost > 0 && !isLocked && (
            <p className="mt-1 text-xs text-orange-700">No free transfers remaining — this transfer will cost -{status.nextTransferCost} points.</p>
          )}
          {status.gameweekTransferCount >= status.maxTransfersPerGameweek && (
            <p className="mt-1 text-xs text-red-700">Maximum {status.maxTransfersPerGameweek} transfers reached this Gameweek.</p>
          )}
        </div>
      )}

      {isLocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Fantasy changes are locked for this Gameweek. Transfers will be available before the next deadline.
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <p className="text-sm text-gray-500">
        Select a player from your squad to remove, then choose a replacement of the same position.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current squad */}
        <div>
          <h2 className="text-base font-semibold mb-2">
            {removing ? (
              <span>Removing: <span className="text-red-600">{removing.player.name}</span></span>
            ) : 'Step 1 — Pick player to remove'}
          </h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {team?.players.map(p => (
              <button
                key={p.id}
                onClick={() => { if (!isLocked) { setRemoving(p === removing ? null : p); setAdding(null); } }}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-sm text-left transition ${
                  removing?.id === p.id
                    ? 'border-red-400 bg-red-50'
                    : isLocked
                    ? 'border-gray-100 opacity-50 cursor-not-allowed'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <span className="text-xs text-gray-400 w-8">{POS_LABEL[p.position]}</span>
                <span className="flex-1 font-medium">{p.player.name}</span>
                <span className="text-xs text-gray-400">{p.player.team.shortName}</span>
                {p.squadRole === 'SUBSTITUTE' && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded">SUB</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Replacement pool */}
        <div>
          <h2 className="text-base font-semibold mb-2">
            {adding ? (
              <span>Adding: <span className="text-green-600">{adding.name}</span></span>
            ) : 'Step 2 — Pick replacement'}
          </h2>
          {removing && !isLocked ? (
            <>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${POS_LABEL[removing.position]}...`}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
              />
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {eligible.slice(0, 50).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setAdding(p === adding ? null : p)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-sm text-left transition ${
                      adding?.id === p.id
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex-1 font-medium">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.team.shortName}</span>
                  </button>
                ))}
                {eligible.length === 0 && (
                  <div className="text-sm text-gray-400 p-2">No eligible players found</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400 p-3 border border-dashed rounded-lg">
              {isLocked ? 'Transfers are locked' : 'Select a player to remove first'}
            </div>
          )}
        </div>
      </div>

      {removing && adding && !isLocked && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-red-600 font-medium">{removing.player.name}</span>
            <span className="text-gray-400 mx-2">→</span>
            <span className="text-green-600 font-medium">{adding.name}</span>
            {(status?.nextTransferCost ?? 0) > 0 && (
              <span className="ml-2 text-xs text-orange-700 font-medium">(-{status!.nextTransferCost}pts)</span>
            )}
          </div>
          <button
            onClick={handleTransfer}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Transferring...' : 'Confirm Transfer'}
          </button>
        </div>
      )}
    </main>
  );
}
