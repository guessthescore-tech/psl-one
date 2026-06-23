'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * NO_REAL_MONEY
 */

import Link from 'next/link';
import { PortalShell } from '../../../components/portal/PortalShell';
import { ADMIN_NAV_ITEMS, ADMIN_ROUTES } from '../../../lib/portal-routes';

const RULE_SECTIONS = [
  {
    title: 'Guess the Score Rules',
    href: ADMIN_ROUTES.RULES_GTS,
    description: 'Configure points awarded for exact scores, correct results, goal differences. GTS_POINTS_ONLY — no financial value.',
    badge: 'GTS POINTS ONLY',
  },
  {
    title: 'Fantasy Rules',
    href: ADMIN_ROUTES.RULES_FANTASY,
    description: 'Configure fantasy scoring (goals, assists, clean sheets, cards, transfers). FANTASY_POINTS_ONLY — no real money.',
    badge: 'FANTASY POINTS ONLY',
  },
  {
    title: 'Points Overview',
    href: ADMIN_ROUTES.POINTS,
    description: 'Unified view of all points systems and their current configuration.',
    badge: 'POINTS ONLY',
  },
  {
    title: 'Points Simulation',
    href: ADMIN_ROUTES.POINTS_SIMULATION,
    description: 'Simulate how rules affect a specific match scenario before going live.',
    badge: 'SIMULATION',
  },
];

export default function AdminRulesPage() {
  return (
    <PortalShell portalName="Admin Portal" navItems={ADMIN_NAV_ITEMS}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Rules Management</h1>
          <p className="text-slate-400 text-sm">
            Configure points rules for all game surfaces. All systems are points-only — no real money.
          </p>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-sm text-purple-300">
          All rules manage PSL points only. No financial value is attached to any points system.
          GTS is points-only. Fantasy is points-only. Sponsor rewards are non-financial.
        </div>

        <div className="grid gap-4">
          {RULE_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white mb-1">{section.title}</h2>
                  <p className="text-sm text-slate-400">{section.description}</p>
                </div>
                <span className="flex-shrink-0 px-2.5 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold whitespace-nowrap">
                  {section.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
