'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Key, Users, Globe } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyTabs } from '@/components/fantasy/shared/FantasyTabs';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { LeagueCard } from '@/components/fantasy/leagues/LeagueCard';
import { LeagueStandingsTable } from '@/components/fantasy/leagues/LeagueStandingsTable';
import {
  FANTASY_MOCK_LEAGUES,
  FANTASY_MOCK_STANDINGS,
} from '@/lib/data';

const TABS = [
  { id: 'my',     label: 'My Leagues' },
  { id: 'public', label: 'Public'     },
  { id: 'global', label: 'Global'     },
];

const MOCK_PUBLIC_LEAGUES = [
  { id: 'pub-1', name: 'SA Fantasy Fans',       totalManagers: 8420,  rank: 0, myPoints: 0 },
  { id: 'pub-2', name: 'World Cup Watchers',    totalManagers: 14350, rank: 0, myPoints: 0 },
  { id: 'pub-3', name: 'African Football Fans', totalManagers: 6102,  rank: 0, myPoints: 0 },
];

export default function LeagueHubPage() {
  const reduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('my');

  const privateLeagues = FANTASY_MOCK_LEAGUES.filter(l => l.type === 'PRIVATE');
  const publicLeagues = FANTASY_MOCK_LEAGUES.filter(l => l.type === 'PUBLIC');
  const globalLeague = FANTASY_MOCK_LEAGUES.find(l => l.type === 'GLOBAL');

  return (
    <FantasyShell title="Fantasy Leagues" subtitle="Compete with friends and the world">
      <FantasyPageHero
        title="Leagues"
        badge="World Cup 2026"
        stat={{ label: 'Global Rank', value: `#${(88403).toLocaleString()}` }}
      />

      <FantasyTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* MY LEAGUES */}
      {activeTab === 'my' && (
        <div className="pb-32">
          {privateLeagues.length + publicLeagues.length === 0 ? (
            <FantasyEmptyState
              icon={<Users size={40} />}
              title="No leagues yet"
              message="Create your own league or join one with an invite code."
              action={{ label: 'Create a League', href: '/fantasy/leagues/create' }}
            />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {[...privateLeagues, ...publicLeagues].map((league, i) => (
                <LeagueCard key={league.id} league={league} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* PUBLIC LEAGUES */}
      {activeTab === 'public' && (
        <div className="pb-32">
          <div className="flex flex-col gap-3 p-4">
            {MOCK_PUBLIC_LEAGUES.map((league, i) => (
              <motion.div
                key={league.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="rounded-card bg-exp-navy border border-exp-border-dk p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={14} className="text-blue-400 flex-shrink-0" />
                    <h3 className="text-body-sm font-semibold text-white truncate">{league.name}</h3>
                  </div>
                  <p className="text-label-sm text-exp-muted">{league.totalManagers.toLocaleString()} managers</p>
                </div>
                <Link
                  href={`/fantasy/leagues/${league.id}`}
                  className="flex-shrink-0 min-h-[44px] flex items-center px-4 bg-exp-green rounded-card-sm text-white font-black text-label-lg uppercase tracking-wider hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                >
                  Join
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL LEAGUE */}
      {activeTab === 'global' && (
        <div className="pb-32">
          {globalLeague && (
            <div className="p-4">
              <div className="rounded-card bg-exp-navy border border-exp-gold/30 p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={16} className="text-exp-gold" />
                  <span className="text-label-lg text-exp-gold uppercase tracking-widest">Global League</span>
                </div>
                <div className="text-display-sm text-white mb-1">{globalLeague.name}</div>
                <div className="text-label-sm text-exp-muted">
                  {globalLeague.totalManagers.toLocaleString()} participants · Your rank:{' '}
                  <span className="text-exp-gold font-black">#{globalLeague.rank.toLocaleString()}</span>
                </div>
              </div>

              <LeagueStandingsTable
                managers={FANTASY_MOCK_STANDINGS}
                leagueId={globalLeague.id}
              />
            </div>
          )}
        </div>
      )}

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-exp-navy border-t border-exp-border-dk px-4 py-3 pb-safe">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Link
            href="/fantasy/leagues/join"
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-card-sm',
              'border border-exp-border-dk text-white text-body-sm font-semibold',
              'hover:border-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
            )}
          >
            <Key size={16} weight="bold" />
            Join with Code
          </Link>
          <Link
            href="/fantasy/leagues/create"
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-card-sm',
              'bg-exp-gold text-exp-void font-black text-body-sm',
              'hover:shadow-glow-gold transition-shadow focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
            )}
          >
            <Plus size={16} weight="bold" />
            Create League
          </Link>
        </div>
      </div>
    </FantasyShell>
  );
}
