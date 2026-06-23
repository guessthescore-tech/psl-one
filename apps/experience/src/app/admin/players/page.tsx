'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { useState } from 'react';
import { PortalShell } from '../../../components/portal/PortalShell';
import { PortalMetricCard } from '../../../components/portal/PortalMetricCard';
import { ADMIN_NAV_ITEMS } from '../../../lib/portal-routes';

const POSITIONS = ['All', 'GK', 'DEF', 'MID', 'FWD'];

const MOCK_PLAYERS = [
  { id: 'p1', name: 'Lionel Messi', position: 'FWD', team: 'Argentina', nationality: 'Argentine' },
  { id: 'p2', name: 'Kylian Mbappé', position: 'FWD', team: 'France', nationality: 'French' },
  { id: 'p3', name: 'Vinicius Jr', position: 'FWD', team: 'Brazil', nationality: 'Brazilian' },
  { id: 'p4', name: 'Jude Bellingham', position: 'MID', team: 'England', nationality: 'English' },
  { id: 'p5', name: 'Emiliano Martínez', position: 'GK', team: 'Argentina', nationality: 'Argentine' },
];

export default function AdminPlayersPage() {
  const [position, setPosition] = useState('All');
  const filtered = position === 'All' ? MOCK_PLAYERS : MOCK_PLAYERS.filter((p) => p.position === position);

  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Players</h1>
          <p className="text-slate-400 text-sm">All registered players. PSL players are inactive pending season activation.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <PortalMetricCard label="Total Players" value={96} description="96 provisional PSL players seeded" />
          <PortalMetricCard label="WC 2026" value={5} trend="flat" trendLabel="Beta context" />
          <PortalMetricCard label="PSL Players" value={96} description="PSL inactive" />
        </div>

        {/* Position filter */}
        <div className="flex gap-2 flex-wrap">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                position === pos
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              {pos}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Team</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Nationality</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-200 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-mono text-slate-300">{p.position}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.team}</td>
                  <td className="px-4 py-3 text-slate-400">{p.nationality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
