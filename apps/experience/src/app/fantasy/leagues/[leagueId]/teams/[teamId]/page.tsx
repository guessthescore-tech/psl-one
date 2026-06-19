'use client';

import { use } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { RivalTeamPitchView } from '@/components/fantasy/leagues/RivalTeamPitchView';
import { FANTASY_MOCK_TEAM, FANTASY_MOCK_STANDINGS } from '@/lib/data';

interface RivalTeamPageProps {
  params: Promise<{ leagueId: string; teamId: string }>;
}

// This page is DESIGN_REVIEW_DATA only — the live API endpoint doesn't exist yet.
// GET /api/fantasy/teams/:teamId/public is not yet implemented.

export default function RivalTeamPage({ params }: RivalTeamPageProps) {
  const reduce = useReducedMotion();
  const { leagueId, teamId } = use(params);

  // Find the manager from standings to show their name, otherwise use mock rival
  const manager = FANTASY_MOCK_STANDINGS.find(m => String(m.rank) === teamId);

  const rivalName = manager?.managerName ?? 'John Doe';
  const rivalTeamName = manager?.teamName ?? 'Galácticos FC';
  const rivalPoints = manager?.totalPoints ?? FANTASY_MOCK_TEAM.totalPoints;
  const rivalGwPoints = manager?.gameweekPoints ?? FANTASY_MOCK_TEAM.gameweekPoints;
  const rivalRank = manager?.rank ?? 1;

  return (
    <FantasyShell
      back={{ href: `/fantasy/leagues/${leagueId}`, label: 'League Standings' }}
    >
      {/* Manager banner */}
      <motion.div
        className="bg-exp-navy border-b border-exp-border-dk px-4 py-4"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-label-sm text-exp-muted uppercase tracking-widest mb-1">
          {rivalName}&apos;s Team
        </p>
        <h1 className="text-display-md text-white">{rivalTeamName}</h1>
        <div className="flex gap-6 mt-3 pt-3 border-t border-exp-border-dk">
          <div>
            <div className="text-stat-md text-exp-gold font-black">{rivalPoints.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">Total pts</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">{rivalGwPoints}</div>
            <div className="text-label-sm text-exp-muted">GW pts</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">#{rivalRank.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">Overall rank</div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 py-5 pb-20">
        {/* Note about design-review */}
        <div className="mb-4 rounded-card-sm bg-exp-gold/10 border border-exp-gold/20 px-3 py-2">
          <p className="text-label-sm text-exp-gold">
            Design Review — showing mock squad. Live rival view requires <code className="font-mono text-xs">GET /api/fantasy/teams/:id/public</code>.
          </p>
        </div>

        <h2 className="text-label-lg text-exp-muted uppercase tracking-widest mb-4">Formation — Read Only</h2>

        <RivalTeamPitchView
          players={FANTASY_MOCK_TEAM.players.filter(p => p.squadRole === 'STARTER')}
          bench={FANTASY_MOCK_TEAM.players.filter(p => p.squadRole === 'SUBSTITUTE')}
          captainId={FANTASY_MOCK_TEAM.players.find(p => p.isCaptain)?.id}
        />
      </div>
    </FantasyShell>
  );
}
