'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fantasyClient, PlayerSummary, FantasyPlayerSlot, PlayerPosition } from '../../../../lib/fantasy-client';

type SlotEntry = {
  player: PlayerSummary;
  squadRole: 'STARTER' | 'SUBSTITUTE';
  benchSlot?: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

const POS_ORDER: PlayerPosition[] = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'];
const POS_LABEL: Record<string, string> = { GOALKEEPER: 'GK', DEFENDER: 'DEF', MIDFIELDER: 'MID', FORWARD: 'FWD' };
const POS_QUOTA = { GOALKEEPER: 2, DEFENDER: 5, MIDFIELDER: 5, FORWARD: 3 };
const POS_BADGE: Record<string, string> = {
  GOALKEEPER: 'bg-yellow-100 text-yellow-800',
  DEFENDER: 'bg-blue-100 text-blue-800',
  MIDFIELDER: 'bg-green-100 text-green-800',
  FORWARD: 'bg-red-100 text-red-800',
};

function getDefaultBenchSlot(pos: PlayerPosition, squad: SlotEntry[]): number | undefined {
  if (pos === 'GOALKEEPER') return 0;
  const outfieldSubs = squad.filter(s => s.squadRole === 'SUBSTITUTE' && s.player.position !== 'GOALKEEPER');
  return outfieldSubs.length; // 0, 1, or 2 (max 3 outfield bench slots: 1,2,3)
}

export default function CreateTeamPage() {
  const router = useRouter();
  const [pool, setPool] = useState<PlayerSummary[]>([]);
  const [squad, setSquad] = useState<SlotEntry[]>([]);
  const [teamName, setTeamName] = useState('My Fantasy Team');
  const [filterPos, setFilterPos] = useState<PlayerPosition | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fantasyClient.getPlayerPool()
      .then(setPool)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const squadIds = new Set(squad.map(s => s.player.id));
  const posCounts = POS_ORDER.reduce<Record<string, number>>((acc, p) => {
    acc[p] = squad.filter(s => s.player.position === p).length;
    return acc;
  }, {});

  const filtered = pool.filter(p => {
    const posOk = !filterPos || p.position === filterPos;
    const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.team.shortName.toLowerCase().includes(search.toLowerCase());
    const notInSquad = !squadIds.has(p.id);
    const quotaOk = (posCounts[p.position] ?? 0) < POS_QUOTA[p.position as keyof typeof POS_QUOTA];
    return posOk && searchOk && notInSquad && quotaOk;
  });

  function addPlayer(player: PlayerSummary) {
    const currentCount = posCounts[player.position] ?? 0;
    const quota = POS_QUOTA[player.position as keyof typeof POS_QUOTA];
    if (currentCount >= quota) return;
    if (squad.length >= 15) return;

    // Determine role: fill starters first based on position
    const starterQuota = { GOALKEEPER: 1, DEFENDER: 4, MIDFIELDER: 4, FORWARD: 2 };
    const starterCount = squad.filter(s => s.squadRole === 'STARTER' && s.player.position === player.position).length;
    const isStarter = starterCount < (starterQuota[player.position as keyof typeof starterQuota] ?? 0);
    const squadRole = isStarter ? 'STARTER' : 'SUBSTITUTE';
    const benchSlot = squadRole === 'SUBSTITUTE' ? getDefaultBenchSlot(player.position, squad) : undefined;

    setSquad(prev => [
      ...prev,
      {
        player,
        squadRole,
        ...(benchSlot !== undefined ? { benchSlot } : {}),
        isCaptain: false,
        isViceCaptain: false,
      } as SlotEntry,
    ]);
  }

  function removePlayer(playerId: string) {
    setSquad(prev => prev.filter(s => s.player.id !== playerId));
  }

  function setCaptain(playerId: string) {
    setSquad(prev => prev.map(s => ({
      ...s,
      isCaptain: s.player.id === playerId,
      isViceCaptain: s.isViceCaptain && s.player.id !== playerId,
    })));
  }

  function setViceCaptain(playerId: string) {
    setSquad(prev => prev.map(s => ({
      ...s,
      isViceCaptain: s.player.id === playerId,
      isCaptain: s.isCaptain && s.player.id !== playerId,
    })));
  }

  const starters = squad.filter(s => s.squadRole === 'STARTER');
  const subs = squad.filter(s => s.squadRole === 'SUBSTITUTE').sort((a, b) => (a.benchSlot ?? 9) - (b.benchSlot ?? 9));
  const isReady = squad.length === 15;

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const players: FantasyPlayerSlot[] = squad.map(s => ({
        playerId: s.player.id,
        squadRole: s.squadRole,
        ...(s.benchSlot !== undefined ? { benchSlot: s.benchSlot } : {}),
        isCaptain: s.isCaptain,
        isViceCaptain: s.isViceCaptain,
      }));
      await fantasyClient.createTeam(teamName, players);
      router.replace('/fantasy/team');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading player pool...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Build Your Squad</h1>
        <div className="text-sm text-gray-500">{squad.length}/15 players</div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Player pool */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or team..."
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32"
            />
            <div className="flex gap-1">
              {(['', ...POS_ORDER] as (PlayerPosition | '')[]).map(pos => (
                <button
                  key={pos}
                  onClick={() => setFilterPos(pos)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                    filterPos === pos ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pos === '' ? 'All' : POS_LABEL[pos]}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Remaining — GK: {POS_QUOTA.GOALKEEPER - (posCounts['GOALKEEPER'] ?? 0)} · DEF: {POS_QUOTA.DEFENDER - (posCounts['DEFENDER'] ?? 0)} · MID: {POS_QUOTA.MIDFIELDER - (posCounts['MIDFIELDER'] ?? 0)} · FWD: {POS_QUOTA.FORWARD - (posCounts['FORWARD'] ?? 0)}
          </div>

          <div className="space-y-1 max-h-[480px] overflow-y-auto">
            {filtered.slice(0, 80).map(p => (
              <button
                key={p.id}
                onClick={() => addPlayer(p)}
                className="w-full flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 text-sm text-left hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${POS_BADGE[p.position]}`}>
                  {POS_LABEL[p.position]}
                </span>
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="text-xs text-gray-400">{p.team.shortName}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-gray-400 p-3">No players available for this position</div>
            )}
          </div>
        </div>

        {/* Squad panel */}
        <div className="space-y-4">
          <input
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm font-medium"
            placeholder="Team name"
          />

          {starters.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Starting XI ({starters.length})</div>
              <div className="space-y-1">
                {POS_ORDER.map(pos =>
                  starters.filter(s => s.player.position === pos).map(s => (
                    <div key={s.player.id} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 text-xs">
                      <span className="text-gray-400 w-6">{POS_LABEL[pos]}</span>
                      <span className="flex-1 font-medium truncate">{s.player.name}</span>
                      <button
                        onClick={() => setCaptain(s.player.id)}
                        title="Captain"
                        className={`px-1 rounded font-bold ${s.isCaptain ? 'bg-yellow-200 text-yellow-800' : 'text-gray-300 hover:text-yellow-500'}`}
                      >C</button>
                      <button
                        onClick={() => setViceCaptain(s.player.id)}
                        title="Vice-captain"
                        className={`px-1 rounded font-bold ${s.isViceCaptain ? 'bg-gray-200 text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}
                      >V</button>
                      <button onClick={() => removePlayer(s.player.id)} className="text-red-300 hover:text-red-500">×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {subs.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bench ({subs.length})</div>
              <div className="space-y-1">
                {subs.map(s => (
                  <div key={s.player.id} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs">
                    <span className="text-gray-400 w-6">{POS_LABEL[s.player.position]}</span>
                    <span className="flex-1 font-medium truncate text-gray-600">{s.player.name}</span>
                    <button onClick={() => removePlayer(s.player.id)} className="text-red-300 hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isReady && squad.length > 0 && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
              {15 - squad.length} more player{15 - squad.length !== 1 ? 's' : ''} needed
            </div>
          )}

          {isReady && !squad.find(s => s.isCaptain) && (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
              Assign a captain (C) and vice-captain (V)
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isReady || saving}
            className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Creating...' : 'Create Squad'}
          </button>
        </div>
      </div>
    </main>
  );
}
