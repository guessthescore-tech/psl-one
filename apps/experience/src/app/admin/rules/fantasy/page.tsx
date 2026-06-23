'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * FANTASY_POINTS_ONLY - Fantasy is points-only, no real-money, no financial value
 * NO_REAL_MONEY
 *
 * Fantasy Rules — configures PSL fantasy points only. No cash, no wagering.
 */

import { useState } from 'react';
import { PortalShell } from '../../../../components/portal/PortalShell';
import { StatusBadge } from '../../../../components/portal/PortalStatusBadges';
import { ADMIN_NAV_ITEMS } from '../../../../lib/portal-routes';

/** FANTASY_POINTS_ONLY — all values are PSL points, never currency */
const DEFAULT_RULES = {
  goalPointsGK: 8,
  goalPointsDEF: 6,
  goalPointsMID: 5,
  goalPointsFWD: 4,
  assistPoints: 3,
  cleanSheetGK: 4,
  cleanSheetDEF: 4,
  yellowCardPenalty: -1,
  redCardPenalty: -3,
  transferLimit: 1,
  transferPenalty: -4,
  captainMultiplier: 2,
};

const SCORING_EVENTS = [
  { event: 'Goal (GK)', pts: 8 },
  { event: 'Goal (DEF)', pts: 6 },
  { event: 'Goal (MID)', pts: 5 },
  { event: 'Goal (FWD)', pts: 4 },
  { event: 'Assist', pts: 3 },
  { event: 'Clean sheet (GK/DEF)', pts: 4 },
  { event: 'Yellow card', pts: -1 },
  { event: 'Red card', pts: -3 },
  { event: 'Captain bonus', pts: '×2' },
];

export default function AdminRulesFantasyPage() {
  const [rules] = useState(DEFAULT_RULES);

  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Fantasy — Points Rules</h1>
            <p className="text-slate-400 text-sm">
              Configure fantasy scoring. FANTASY_POINTS_ONLY — no real money, no gambling.
            </p>
          </div>
          <StatusBadge label="FANTASY POINTS ONLY" variant="points" />
        </div>

        {/* Safety declaration */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-300 mb-1">FANTASY_POINTS_ONLY Declaration</p>
          <p className="text-sm text-slate-400">
            Fantasy football awards PSL points only. Points have no financial value, cannot be redeemed for cash,
            and are not associated with gambling, wagering, or real-money activity. No real money. No betting.
          </p>
        </div>

        {/* Current config display */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Current Points Configuration</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Goal (GK)</span>
              <span className="text-white font-mono">{rules.goalPointsGK} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Goal (DEF)</span>
              <span className="text-white font-mono">{rules.goalPointsDEF} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Goal (MID)</span>
              <span className="text-white font-mono">{rules.goalPointsMID} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Goal (FWD)</span>
              <span className="text-white font-mono">{rules.goalPointsFWD} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Assist</span>
              <span className="text-white font-mono">{rules.assistPoints} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Clean Sheet</span>
              <span className="text-white font-mono">{rules.cleanSheetGK} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Yellow Card</span>
              <span className="text-red-400 font-mono">{rules.yellowCardPenalty} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Red Card</span>
              <span className="text-red-400 font-mono">{rules.redCardPenalty} pts</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Free Transfers</span>
              <span className="text-white font-mono">{rules.transferLimit}/gw</span>
            </div>
            <div className="flex justify-between bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Extra Transfer</span>
              <span className="text-red-400 font-mono">{rules.transferPenalty} pts</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-2 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
          >
            Edit Fantasy Rules (Requires PSL_ADMIN)
          </button>
        </div>

        {/* Scoring table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-200">Scoring Events (Points only — no real money)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Points</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_EVENTS.map((e, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-300">{e.event}</td>
                  <td className={`px-4 py-3 font-mono ${typeof e.pts === 'number' && e.pts < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {e.pts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
