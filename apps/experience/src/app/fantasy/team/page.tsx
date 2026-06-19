'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyLoadingState } from '@/components/fantasy/shared/FantasyLoadingState';
import { FantasyPitchView } from '@/components/fantasy/core/FantasyPitchView';
import { BenchPanel } from '@/components/fantasy/core/BenchPanel';
import { DeadlineCountdown } from '@/components/fantasy/core/DeadlineCountdown';
import { FantasyModal } from '@/components/fantasy/shared/FantasyModal';
import { CaptainMarker } from '@/components/fantasy/core/CaptainMarker';
import { FANTASY_MOCK_TEAM, getDataMode } from '@/lib/data';
import type { ExpFantasyPlayer } from '@/lib/data';

// Deadline 3 days from now for design review
const MOCK_DEADLINE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

export default function TeamPage() {
  const reduce = useReducedMotion();
  const mode = getDataMode();

  const [selectedPlayer, setSelectedPlayer] = useState<ExpFantasyPlayer | null>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);

  const team = FANTASY_MOCK_TEAM;
  const starters = team.players.filter(p => p.squadRole === 'STARTER');
  const bench = team.players.filter(p => p.squadRole === 'SUBSTITUTE');

  function handlePlayerClick(player: ExpFantasyPlayer | null) {
    if (!player) return;
    setSelectedPlayer(player);
    setPlayerModalOpen(true);
  }

  if (mode === 'LIVE_BETA_DATA') {
    // Show loading skeleton until API wired
    return (
      <FantasyShell title="My Team" back={{ href: '/fantasy', label: 'Back to Fantasy' }}>
        <div className="px-4 py-6">
          <FantasyLoadingState type="pitch" />
        </div>
      </FantasyShell>
    );
  }

  return (
    <FantasyShell title={team.teamName} back={{ href: '/fantasy', label: 'Back to Fantasy' }}>
      <div className="pb-24">
        {/* Stats bar */}
        <motion.div
          className="px-4 pt-4 pb-3 bg-exp-navy border-b border-exp-border-dk"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Total Points', value: team.totalPoints, color: 'text-exp-gold' },
              { label: 'This GW', value: team.gameweekPoints, color: 'text-white' },
              { label: 'Rank', value: `#${team.rank.toLocaleString()}`, color: 'text-white' },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-exp-ink rounded-card-xs py-2.5">
                <p className={`text-stat-md font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-label-sm text-exp-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Deadline countdown */}
          <DeadlineCountdown deadlineAt={MOCK_DEADLINE} isLocked={false} />

          {/* Transfer info */}
          <p className="text-label-sm text-exp-muted text-center mt-2">
            {team.transfersRemaining} free transfer{team.transfersRemaining !== 1 ? 's' : ''} remaining ·
            £{team.budget.toFixed(1)}m in bank
          </p>
        </motion.div>

        {/* Pitch */}
        <div className="px-3 py-4">
          <FantasyPitchView
            players={starters}
            formation={team.formation}
            onPlayerClick={handlePlayerClick}
          />
        </div>

        {/* Bench */}
        <BenchPanel
          players={bench}
          onPlayerClick={player => handlePlayerClick(player)}
        />

        {/* Quick action bar */}
        <div className="px-4 py-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Transfers', emoji: '🔄', href: '/fantasy/team/transfers', highlight: true },
            { label: 'Chips', emoji: '⚡', href: '/fantasy/team/chips', highlight: false },
            { label: 'FDR', emoji: '📊', href: '/fantasy/fixture-difficulty', highlight: false },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-1.5 min-h-[64px] rounded-card border transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                action.highlight
                  ? 'bg-exp-green/10 border-exp-green/40 hover:bg-exp-green/20'
                  : 'bg-exp-navy border-exp-border-dk hover:bg-exp-navy-2'
              }`}
            >
              <span className="text-xl">{action.emoji}</span>
              <span className="text-label-sm text-white">{action.label}</span>
            </Link>
          ))}
        </div>

        <p className="px-4 pb-2 text-label-sm text-exp-muted text-center">
          Points only — no real money or financial value
        </p>
      </div>

      {/* Player management modal */}
      <FantasyModal
        open={playerModalOpen}
        onClose={() => setPlayerModalOpen(false)}
        title={selectedPlayer?.name ?? ''}
      >
        {selectedPlayer && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-exp-navy-2 border border-exp-border-dk flex items-center justify-center text-display-sm text-white font-bold">
                {selectedPlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-body-lg text-white font-semibold">{selectedPlayer.name}</p>
                  {selectedPlayer.isCaptain && <CaptainMarker type="C" />}
                  {selectedPlayer.isViceCaptain && <CaptainMarker type="VC" />}
                </div>
                <p className="text-body-sm text-exp-muted">{selectedPlayer.club} · £{selectedPlayer.price}m</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Points', value: selectedPlayer.points },
                { label: 'Goals', value: selectedPlayer.goalsThisTournament },
                { label: 'Assists', value: selectedPlayer.assistsThisTournament },
              ].map(s => (
                <div key={s.label} className="bg-exp-ink rounded-card-xs py-2">
                  <p className="text-stat-md text-exp-gold font-mono">{s.value}</p>
                  <p className="text-label-sm text-exp-muted">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Link
                href="/fantasy/team/transfers"
                className="flex-1 min-h-[44px] flex items-center justify-center rounded-pill border border-exp-border-dk text-white text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                onClick={() => setPlayerModalOpen(false)}
              >
                Transfer Out
              </Link>
            </div>
          </div>
        )}
      </FantasyModal>
    </FantasyShell>
  );
}
