'use client';

import { useState } from 'react';
import { use } from 'react';
import { ShareNetwork, Lock, Users, Globe } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyTabs } from '@/components/fantasy/shared/FantasyTabs';
import { LeagueStandingsTable } from '@/components/fantasy/leagues/LeagueStandingsTable';
import { InviteLeagueSheet } from '@/components/fantasy/leagues/InviteLeagueSheet';
import { FANTASY_MOCK_LEAGUES, FANTASY_MOCK_STANDINGS } from '@/lib/data';

const TABS = [
  { id: 'standings', label: 'Standings' },
  { id: 'fixtures',  label: 'Fixtures'  },
  { id: 'about',     label: 'About'     },
];

const TYPE_CONFIG = {
  PRIVATE: { label: 'Private', icon: Lock,  color: 'text-exp-gold' },
  PUBLIC:  { label: 'Public',  icon: Users,  color: 'text-exp-green' },
  GLOBAL:  { label: 'Global',  icon: Globe,  color: 'text-blue-400' },
};

interface LeagueDetailPageProps {
  params: Promise<{ leagueId: string }>;
}

export default function LeagueDetailPage({ params }: LeagueDetailPageProps) {
  const reduce = useReducedMotion();
  const { leagueId } = use(params);
  const [activeTab, setActiveTab] = useState('standings');
  const [sheetOpen, setSheetOpen] = useState(false);

  const league = FANTASY_MOCK_LEAGUES.find(l => l.id === leagueId) ?? FANTASY_MOCK_LEAGUES[0]!;
  const cfg = TYPE_CONFIG[league.type];
  const TypeIcon = cfg.icon;

  return (
    <FantasyShell back={{ href: '/fantasy/leagues', label: 'All Leagues' }}>
      {/* League header */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={clsx('flex items-center gap-1.5 mb-1 text-label-sm', cfg.color)}>
              <TypeIcon size={12} weight="fill" />
              <span className="uppercase tracking-widest">{cfg.label}</span>
            </div>
            <h1 className="text-display-md text-white truncate">{league.name}</h1>
            <p className="text-label-sm text-exp-muted mt-1">
              {league.totalManagers.toLocaleString()} managers · World Cup 2026
            </p>
          </div>
          {league.inviteCode && (
            <motion.button
              type="button"
              onClick={() => setSheetOpen(true)}
              whileTap={reduce ? {} : { scale: 0.97 }}
              aria-label="Invite friends to this league"
              className="flex items-center gap-2 min-h-[44px] px-4 rounded-card-sm border border-exp-border-dk text-white text-label-lg uppercase tracking-wider hover:border-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 flex-shrink-0"
            >
              <ShareNetwork size={16} weight="bold" />
              Invite
            </motion.button>
          )}
        </div>

        {/* My stats bar */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-exp-border-dk">
          <div>
            <div className="text-stat-md text-exp-gold font-black">{league.rank.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">My Rank</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">{league.myPoints.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">Total Pts</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">{league.totalManagers.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">Managers</div>
          </div>
        </div>
      </div>

      <FantasyTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Standings tab */}
      {activeTab === 'standings' && (
        <div className="pb-20">
          <LeagueStandingsTable
            managers={FANTASY_MOCK_STANDINGS}
            leagueId={leagueId}
          />
        </div>
      )}

      {/* Fixtures tab */}
      {activeTab === 'fixtures' && (
        <div className="px-4 py-8 text-center">
          <p className="text-body-md text-exp-muted">
            Fixture view coming soon — track rival team selections each gameweek.
          </p>
        </div>
      )}

      {/* About tab */}
      {activeTab === 'about' && (
        <div className="px-4 py-5 flex flex-col gap-4">
          {[
            { label: 'League Code',   value: league.inviteCode ?? 'N/A' },
            { label: 'Season',        value: 'FIFA World Cup 2026' },
            { label: 'Scoring Type',  value: 'Classic' },
            { label: 'Type',          value: cfg.label },
            { label: 'Managers',      value: league.totalManagers.toLocaleString() },
            { label: 'Leader Pts',    value: league.leaderPoints.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-exp-border-dk">
              <span className="text-label-lg text-exp-muted uppercase tracking-wider">{label}</span>
              <span className={clsx('text-body-sm font-semibold', label === 'League Code' ? 'font-mono text-exp-gold tracking-widest' : 'text-white')}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Invite sheet */}
      <InviteLeagueSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        leagueName={league.name}
        inviteCode={league.inviteCode ?? 'N/A'}
      />
    </FantasyShell>
  );
}
