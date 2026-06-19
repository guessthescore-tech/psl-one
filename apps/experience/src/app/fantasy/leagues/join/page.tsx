'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Users, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasySectionHeader } from '@/components/fantasy/shared/FantasySectionHeader';
import { FantasyLoadingState } from '@/components/fantasy/shared/FantasyLoadingState';
import { LeagueCodeInput } from '@/components/fantasy/leagues/LeagueCodeInput';
import { getDataMode } from '@/lib/data';

type JoinState = 'idle' | 'searching' | 'found' | 'error_not_found' | 'error_member' | 'joining' | 'success';

const MOCK_LEAGUE = {
  id: 'league-found-1',
  name: 'Premier Fans FC',
  memberCount: 47,
  type: 'PRIVATE' as const,
};

const MOCK_PUBLIC_LEAGUES = [
  { id: 'pub-browse-1', name: 'SA Fantasy Fans',       memberCount: 8420  },
  { id: 'pub-browse-2', name: 'World Cup Watchers',    memberCount: 14350 },
  { id: 'pub-browse-3', name: 'African Football Fans', memberCount: 6102  },
  { id: 'pub-browse-4', name: 'Bafana Supporters',     memberCount: 2210  },
];

export default function JoinLeaguePage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const mode = getDataMode();

  const [code, setCode] = useState('');
  const [state, setState] = useState<JoinState>('idle');

  async function handleFind() {
    if (code.length < 6) return;

    setState('searching');

    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(r => setTimeout(r, 800));
      setState('found');
      return;
    }

    // LIVE_BETA_DATA path
    try {
      const { joinLeagueByCode } = await import('@/lib/fantasy-api');
      await joinLeagueByCode(code);
      setState('success');
      setTimeout(() => router.push('/fantasy/leagues'), 1500);
    } catch {
      setState('error_not_found');
    }
  }

  async function handleJoin() {
    setState('joining');

    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(r => setTimeout(r, 700));
      setState('success');
      setTimeout(() => router.push(`/fantasy/leagues/${MOCK_LEAGUE.id}`), 1000);
      return;
    }

    try {
      const { joinLeagueByCode } = await import('@/lib/fantasy-api');
      const league = await joinLeagueByCode(code);
      setState('success');
      setTimeout(() => router.push(`/fantasy/leagues/${league.id}`), 1000);
    } catch {
      setState('error_member');
    }
  }

  async function handleJoinPublic(id: string) {
    if (mode === 'DESIGN_REVIEW_DATA') {
      router.push(`/fantasy/leagues/${id}`);
      return;
    }
    try {
      const { joinPublicLeague } = await import('@/lib/fantasy-api');
      await joinPublicLeague(id);
      router.push(`/fantasy/leagues/${id}`);
    } catch {
      // TODO: show error
    }
  }

  return (
    <FantasyShell
      title="Join a League"
      subtitle="Enter an invite code or browse public leagues"
      back={{ href: '/fantasy/leagues', label: 'Back to Leagues' }}
    >
      {/* Join by code section */}
      <div className="px-4 py-5 border-b border-exp-border-dk">
        <h2 className="text-display-sm text-white mb-4">Join by Code</h2>

        <LeagueCodeInput value={code} onChange={setCode} disabled={state === 'searching' || state === 'joining'} />

        {/* Status messages */}
        {state === 'error_not_found' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 text-exp-live"
          >
            <WarningCircle size={16} weight="fill" />
            <span className="text-body-sm">Code not found. Check and try again.</span>
          </motion.div>
        )}

        {state === 'error_member' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 text-exp-live"
          >
            <WarningCircle size={16} weight="fill" />
            <span className="text-body-sm">You&apos;re already a member of this league.</span>
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 mt-3 text-exp-green"
          >
            <CheckCircle size={16} weight="fill" />
            <span className="text-body-sm">Joined! Redirecting...</span>
          </motion.div>
        )}

        {/* League preview */}
        {(state === 'found' || state === 'joining') && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-card bg-exp-ink border border-exp-gold/30 p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-exp-gold/20 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-exp-gold" />
              </div>
              <div>
                <div className="text-display-sm text-white">{MOCK_LEAGUE.name}</div>
                <div className="text-label-sm text-exp-muted">{MOCK_LEAGUE.memberCount} members · Private</div>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={handleJoin}
              disabled={state !== 'found'}
              whileTap={reduce ? {} : { scale: 0.97 }}
              className={clsx(
                'w-full min-h-[48px] rounded-card-sm font-black text-body-sm transition-all',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                state !== 'found'
                  ? 'bg-white/10 text-white/30 cursor-wait'
                  : 'bg-exp-green text-white hover:opacity-90',
              )}
            >
              {state !== 'found' ? 'Joining...' : 'Join Premier Fans FC'}
            </motion.button>
          </motion.div>
        )}

        {/* Search loading */}
        {state === 'searching' && <FantasyLoadingState rows={1} type="card" />}

        {/* Find button */}
        {(state === 'idle' || state === 'error_not_found') && (
          <motion.button
            type="button"
            onClick={handleFind}
            disabled={code.length < 6}
            whileTap={reduce ? {} : { scale: 0.97 }}
            className={clsx(
              'w-full mt-4 min-h-[48px] rounded-card-sm font-black text-body-sm transition-all',
              'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
              code.length === 6
                ? 'bg-exp-gold text-exp-void hover:shadow-glow-gold'
                : 'bg-white/10 text-white/30 cursor-not-allowed',
            )}
          >
            Find League
          </motion.button>
        )}
      </div>

      {/* Browse public leagues */}
      <div className="pb-24">
        <FantasySectionHeader title="Browse Public Leagues" subtitle="Open to any fan" />
        <div className="flex flex-col gap-3 px-4">
          {MOCK_PUBLIC_LEAGUES.map((league, i) => (
            <motion.div
              key={league.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="rounded-card bg-exp-navy border border-exp-border-dk p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="text-body-sm font-semibold text-white truncate mb-0.5">{league.name}</div>
                <div className="text-label-sm text-exp-muted">{league.memberCount.toLocaleString()} members</div>
              </div>
              <motion.button
                type="button"
                onClick={() => handleJoinPublic(league.id)}
                whileTap={reduce ? {} : { scale: 0.97 }}
                className="flex-shrink-0 min-h-[44px] px-4 bg-exp-green rounded-card-sm text-white font-black text-label-lg uppercase tracking-wider hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
              >
                Join
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </FantasyShell>
  );
}
