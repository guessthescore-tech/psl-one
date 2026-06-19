'use client';

import { use } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, ArrowsLeftRight } from '@phosphor-icons/react/dist/ssr';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { RivalTeamPitchView } from '@/components/fantasy/leagues/RivalTeamPitchView';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import { FANTASY_MOCK_HISTORY, FANTASY_MOCK_TEAM } from '@/lib/data';

interface GameweekDetailPageProps {
  params: Promise<{ gameweekId: string }>;
}

export default function GameweekDetailPage({ params }: GameweekDetailPageProps) {
  const reduce = useReducedMotion();
  const { gameweekId } = use(params);

  const entry = FANTASY_MOCK_HISTORY.find(e => String(e.gameweekNumber) === gameweekId) ?? FANTASY_MOCK_HISTORY[0];

  if (!entry) {
    return (
      <FantasyShell back={{ href: '/fantasy/history', label: 'Season History' }}>
        <FantasyEmptyState
          icon={<CalendarBlank size={40} />}
          title="Gameweek not found"
          message="This gameweek doesn't exist or hasn't been completed yet."
          action={{ label: 'Back to History', href: '/fantasy/history' }}
        />
      </FantasyShell>
    );
  }

  return (
    <FantasyShell back={{ href: '/fantasy/history', label: 'Season History' }}>
      {/* Header */}
      <motion.div
        className="bg-navy-gradient px-4 py-6 border-b border-exp-border-dk"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-label-lg text-exp-muted uppercase tracking-widest mb-1">{entry.gameweekLabel}</p>
        <div className="flex items-end gap-3">
          <span className="text-display-2xl text-exp-gold font-black leading-none">{entry.points}</span>
          <span className="text-display-sm text-exp-muted mb-1">points</span>
        </div>

        {entry.chipUsed && (
          <div className="flex items-center gap-1.5 mt-2">
            <Star size={14} weight="fill" className="text-exp-gold" />
            <span className="text-label-lg text-exp-gold">{entry.chipUsed} active</span>
          </div>
        )}

        {/* Rank breakdown */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-exp-border-dk">
          <div>
            <div className="text-stat-md text-white font-black">#{entry.rank.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">Overall rank</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">GW{entry.gameweekNumber}</div>
            <div className="text-label-sm text-exp-muted">Gameweek</div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 py-5 pb-20 flex flex-col gap-5">
        {/* Transfer summary */}
        <div className="rounded-card bg-exp-navy border border-exp-border-dk p-4 flex items-center gap-3">
          <ArrowsLeftRight size={20} className="text-exp-muted flex-shrink-0" />
          <div>
            <div className="text-body-sm font-semibold text-white">
              {entry.transfers} transfer{entry.transfers !== 1 ? 's' : ''} made
            </div>
            <div className="text-label-sm text-exp-muted">
              {entry.transfers > 1 ? `−${(entry.transfers - 1) * 4} pts hit` : 'No point hit'}
            </div>
          </div>
        </div>

        {/* Pitch view (read-only) */}
        <div>
          <h2 className="text-label-lg text-exp-muted uppercase tracking-widest mb-3">Squad This Gameweek</h2>
          <RivalTeamPitchView
            players={FANTASY_MOCK_TEAM.players.filter(p => p.squadRole === 'STARTER')}
            bench={FANTASY_MOCK_TEAM.players.filter(p => p.squadRole === 'SUBSTITUTE')}
            captainId={FANTASY_MOCK_TEAM.players.find(p => p.isCaptain)?.id}
          />
        </div>

        <p className="text-label-sm text-exp-muted text-center">
          Points only — no real money — no financial value
        </p>
      </div>
    </FantasyShell>
  );
}
