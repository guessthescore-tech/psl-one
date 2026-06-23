'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * GTS_POINTS_ONLY - Guess the Score is points-only, no real-money, no financial value
 * NO_REAL_MONEY
 *
 * GTS Rules — configures PSL points only. No cash, no wagering, no gambling.
 */

import { useState } from 'react';
import { PortalShell } from '../../../../components/portal/PortalShell';
import { StatusBadge } from '../../../../components/portal/PortalStatusBadges';
import { ADMIN_NAV_ITEMS } from '../../../../lib/portal-routes';

/** GTS_POINTS_ONLY — these are PSL points, not currency or financial value */
const DEFAULT_RULES = {
  exactScorePoints: 5,
  correctResultPoints: 2,
  correctGoalDiffPoints: 3,
  zeroZeroBonus: 3,
  lateEntryPenalty: 0,
  streakBonusEnabled: true,
  streakBonusMultiplier: 1.5,
};

const SCENARIOS = [
  { scenario: 'Exact score (e.g., 2-1 predicted, 2-1 result)', points: 5 },
  { scenario: 'Correct result only (e.g., win/draw/loss)', points: 2 },
  { scenario: 'Correct goal difference', points: 3 },
  { scenario: '0-0 bonus', points: 3 },
  { scenario: 'Streak bonus (3+ consecutive)', points: 'x1.5 multiplier' },
];

export default function AdminRulesGtsPage() {
  const [rules, setRules] = useState(DEFAULT_RULES);

  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Guess the Score — Points Rules</h1>
            <p className="text-slate-400 text-sm">
              Configure PSL points awarded for predictions. GTS is points-only — no real money, no gambling.
            </p>
          </div>
          <StatusBadge label="GTS POINTS ONLY" variant="points" />
        </div>

        {/* Safety declaration */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-300 mb-1">GTS_POINTS_ONLY Declaration</p>
          <p className="text-sm text-slate-400">
            Guess the Score awards PSL points only. Points have no financial value, cannot be redeemed for cash,
            and are not used in any gambling or wagering activity. No real money. No betting.
          </p>
        </div>

        {/* Rules form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-semibold text-slate-200">Points Configuration</h2>

          {[
            { key: 'exactScorePoints', label: 'Exact Score Points' },
            { key: 'correctResultPoints', label: 'Correct Result Points (W/D/L)' },
            { key: 'correctGoalDiffPoints', label: 'Correct Goal Difference Points' },
            { key: 'zeroZeroBonus', label: '0-0 Bonus Points' },
            { key: 'lateEntryPenalty', label: 'Late Entry Penalty (deducted)' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label htmlFor={key} className="text-sm text-slate-300 flex-1">{label}</label>
              <input
                id={key}
                type="number"
                min={0}
                max={100}
                value={rules[key as keyof typeof rules] as number}
                onChange={(e) => setRules((r) => ({ ...r, [key]: parseInt(e.target.value, 10) || 0 }))}
                className="w-20 px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:border-slate-500"
                aria-label={label}
              />
            </div>
          ))}

          <div className="flex items-center justify-between gap-4">
            <label htmlFor="streakBonus" className="text-sm text-slate-300 flex-1">Streak Bonus Enabled</label>
            <button
              id="streakBonus"
              type="button"
              onClick={() => setRules((r) => ({ ...r, streakBonusEnabled: !r.streakBonusEnabled }))}
              className={`w-10 h-6 rounded-full transition-colors ${rules.streakBonusEnabled ? 'bg-green-600' : 'bg-slate-700'}`}
              aria-checked={rules.streakBonusEnabled}
              role="switch"
            >
              <span className={`block w-4 h-4 rounded-full bg-white mx-1 transition-transform ${rules.streakBonusEnabled ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
          >
            Save Points Rules (Requires PSL_ADMIN)
          </button>
        </div>

        {/* Scenarios table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-200">Points Scenarios (Points only — no real money)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Scenario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Points Awarded</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((s, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300">{s.scenario}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
