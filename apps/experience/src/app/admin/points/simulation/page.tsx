'use client';
/**
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * NO_REAL_MONEY
 *
 * Points Simulation — shows projected points for hypothetical match scenarios.
 */

import { PortalShell } from '../../../../components/portal/PortalShell';
import { ADMIN_NAV_ITEMS } from '../../../../lib/portal-routes';

const GTS_SIMULATION = [
  { scenario: 'Exact 2-1 predicted, 2-1 result', gtsPoints: 5, notes: 'Exact score bonus' },
  { scenario: 'Predicted home win, got home win (wrong score)', gtsPoints: 2, notes: 'Correct result' },
  { scenario: 'Correct 1-goal difference', gtsPoints: 3, notes: 'Goal diff bonus' },
  { scenario: 'Predicted 0-0, got 0-0', gtsPoints: 8, notes: '5 exact + 3 bonus' },
  { scenario: 'Wrong result', gtsPoints: 0, notes: 'No points' },
  { scenario: '3-match streak with 1.5× multiplier', gtsPoints: '×1.5', notes: 'Streak multiplier applied' },
];

const FANTASY_SIMULATION = [
  { event: 'Goal (FWD)', pts: 4, scenario: 'Mbappé scores', notes: 'Standard FWD goal' },
  { event: 'Goal (DEF)', pts: 6, scenario: 'Defender scores from corner', notes: 'Higher reward' },
  { event: 'Assist', pts: 3, scenario: 'Key pass for goal', notes: 'All positions' },
  { event: 'Clean sheet (GK)', pts: 4, scenario: 'GK keeps 90-min clean sheet', notes: 'Must play 60+ mins' },
  { event: 'Captain goal (FWD)', pts: 8, scenario: 'Captain Messi scores', notes: '4×2 captain multiplier' },
  { event: 'Yellow card', pts: -1, scenario: 'Foul in box', notes: 'Penalty deducted' },
  { event: 'Red card', pts: -3, scenario: 'Violent conduct', notes: 'Severe deduction' },
];

export default function AdminPointsSimulationPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Points Simulation</h1>
          <p className="text-slate-400 text-sm">
            Project how current rules apply to match scenarios. Points only — no real money.
          </p>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
          Simulation shows PSL points projections only. No financial value. GTS_POINTS_ONLY. FANTASY_POINTS_ONLY.
        </div>

        {/* GTS Simulation */}
        <section aria-labelledby="gts-sim">
          <h2 id="gts-sim" className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Guess the Score — Points Simulation
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Scenario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody>
                {GTS_SIMULATION.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">{row.scenario}</td>
                    <td className="px-4 py-3 text-slate-200 font-mono font-bold">{row.gtsPoints}</td>
                    <td className="px-4 py-3 text-slate-500">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fantasy Simulation */}
        <section aria-labelledby="fantasy-sim">
          <h2 id="fantasy-sim" className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Fantasy — Points Simulation
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Scenario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody>
                {FANTASY_SIMULATION.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">{row.event}</td>
                    <td className={`px-4 py-3 font-mono font-bold ${row.pts < 0 ? 'text-red-400' : 'text-slate-200'}`}>{row.pts}</td>
                    <td className="px-4 py-3 text-slate-400">{row.scenario}</td>
                    <td className="px-4 py-3 text-slate-500">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
