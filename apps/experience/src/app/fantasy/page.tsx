'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyLoadingState } from '@/components/fantasy/shared/FantasyLoadingState';
import { getDataMode, isLiveDataMode, FANTASY_MOCK_TEAM } from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import { getTeam, getTransferStatus } from '@/lib/fantasy-api';
import { toExpFantasySquad } from '@/lib/fantasy-player-mapper';
import type { ExpFantasySquad } from '@/lib/data';

type PageState = 'loading' | 'unauthenticated' | 'no-team' | 'has-team' | 'error';

export default function FantasyLandingPage() {
  const reduce = useReducedMotion();
  const mode = getDataMode();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [team, setTeam] = useState<ExpFantasySquad | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isLiveDataMode(mode)) {
        setTeam(FANTASY_MOCK_TEAM);
        setPageState('has-team');
        return;
      }
      if (!isAuthenticated()) {
        setPageState('unauthenticated');
        return;
      }
      try {
        const [liveTeam, transferStatus] = await Promise.all([
          getTeam(),
          getTransferStatus(),
        ]);
        if (cancelled) return;
        const squad = toExpFantasySquad(liveTeam);
        setTeam({
          ...squad,
          transfersRemaining: transferStatus.freeTransfersAvailable,
        });
        setPageState('has-team');
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        if (message.toLowerCase().includes('not found')) {
          setPageState('no-team');
        } else {
          setPageState('error');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  if (pageState === 'loading') {
    return (
      <FantasyShell title="Fantasy">
        <div className="px-4 py-6">
          <FantasyLoadingState rows={4} />
        </div>
      </FantasyShell>
    );
  }

  if (pageState === 'unauthenticated') {
    return (
      <FantasyShell>
        <UnauthenticatedState reduce={reduce} />
      </FantasyShell>
    );
  }

  if (pageState === 'no-team') {
    return (
      <FantasyShell title="PSL Fantasy">
        <NoTeamState reduce={reduce} />
      </FantasyShell>
    );
  }

  if (pageState === 'error') {
    return (
      <FantasyShell title="Fantasy">
        <div className="px-4 py-8 text-exp-muted text-center">Could not load fantasy data.</div>
      </FantasyShell>
    );
  }

  return (
    <FantasyShell title="My Fantasy Team">
      {team ? (
        <HasTeamState reduce={reduce} team={team} />
      ) : (
        <div className="px-4 py-8 text-exp-muted text-center">Could not load fantasy data.</div>
      )}
    </FantasyShell>
  );
}

function UnauthenticatedState({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="min-h-[100dvh] bg-navy-gradient">
      <motion.div
        className="px-4 pt-16 pb-8 text-center"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative w-40 h-24 mx-auto mb-8 rounded-card overflow-hidden opacity-60"
          style={{ background: 'repeating-linear-gradient(180deg,#145c2e 0px,#145c2e 12px,#115228 12px,#115228 24px)' }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 flex flex-col justify-around py-2">
            {[1, 4, 3, 3].map((count, row) => (
              <div key={row} className="flex justify-around">
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-exp-gold/70 border border-exp-gold" />
                ))}
              </div>
            ))}
          </div>
          <div className="absolute inset-0 border border-white/10 rounded-card" />
        </div>

        <h1 className="text-display-xl text-exp-gold mb-3">PSL Fantasy</h1>
        <p className="text-body-lg text-white mb-2 font-semibold">Pick your squad. Score points. Win glory.</p>
        <p className="text-body-md text-exp-muted mb-8 max-w-xs mx-auto">
          Build your ultimate WC 2026 fantasy squad and compete with fans worldwide.
          Points only — no real money or financial value.
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/sign-in"
            className="flex items-center justify-center min-h-[44px] px-8 py-3 bg-exp-green text-white text-label-lg rounded-pill shadow-glow-green focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            Sign In to Play
          </Link>
          <a
            href="#how-to-play"
            className="flex items-center justify-center min-h-[44px] px-8 py-3 border border-exp-border-dk text-white text-label-lg rounded-pill focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            Learn More
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function NoTeamState({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="px-4 py-12 text-center"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-6xl mb-4">⚽</div>
      <h2 className="text-display-md text-white mb-2">Create Your Team</h2>
      <p className="text-body-md text-exp-muted mb-8 max-w-xs mx-auto">
        You haven&apos;t set up your fantasy squad yet. Get started and compete for glory.
        Points only — no real money.
      </p>
      <Link
        href="/fantasy/onboarding"
        className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-exp-green text-white text-label-lg rounded-pill shadow-glow-green focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
      >
        Build My Squad
      </Link>
    </motion.div>
  );
}

function HasTeamState({ reduce, team }: { reduce: boolean | null; team: ExpFantasySquad }) {
  return (
    <motion.div
      className="pb-24"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="px-4 py-4 bg-navy-gradient">
        <div className="bg-exp-navy border border-exp-border-dk rounded-card px-5 py-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-display-md text-white">{team.teamName}</h2>
              <p className="text-body-sm text-exp-muted">FIFA World Cup 2026 Fantasy</p>
            </div>
            <div className="text-right">
              <p className="text-stat-md text-exp-gold font-mono">{team.totalPoints}</p>
              <p className="text-label-sm text-exp-muted">Total pts</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'GW Points', value: team.gameweekPoints },
              { label: 'Transfers', value: team.transfersRemaining },
              { label: 'Squad', value: team.players.length },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-exp-ink rounded-card-xs py-2">
                <p className="text-stat-md text-white font-mono">{stat.value}</p>
                <p className="text-label-sm text-exp-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/fantasy/team"
            className="flex items-center justify-center min-h-[44px] w-full bg-exp-green text-white text-label-lg rounded-pill focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            View Full Team →
          </Link>
        </div>
      </div>

      <div className="px-4 py-4">
        <h3 className="text-display-sm text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Transfers', emoji: '🔄', href: '/fantasy/team/transfers', color: 'border-exp-green/40' },
            { label: 'Chips', emoji: '⚡', href: '/fantasy/team/chips', color: 'border-exp-gold/40' },
            { label: 'FDR', emoji: '📊', href: '/fantasy/fixture-difficulty', color: 'border-exp-navy-2' },
            { label: 'History', emoji: '📈', href: '/fantasy/history', color: 'border-exp-navy-2' },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 min-h-[80px] bg-exp-navy border rounded-card ${action.color} hover:bg-exp-navy-2 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2`}
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-label-md text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
