'use client';

import { use, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShareNetwork, Lock, Users, Globe } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyTabs } from '@/components/fantasy/shared/FantasyTabs';
import { LeagueStandingsTable } from '@/components/fantasy/leagues/LeagueStandingsTable';
import { InviteLeagueSheet } from '@/components/fantasy/leagues/InviteLeagueSheet';
import { getDataMode, isLiveDataMode, type ExpLeague, type ExpLeagueManager } from '@/lib/data';
import { getLeague, getLeagueStandings, type ClassicStandingsRow, type H2HStandingsRow } from '@/lib/fantasy-api';

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

function toManagers(standings: ClassicStandingsRow[] | H2HStandingsRow[]): ExpLeagueManager[] {
  return standings.map((row, index) => ({
    rank: row.rank,
    previousRank: Math.max(1, row.rank + 1),
    managerName: row.teamName,
    teamName: row.teamName,
    gameweekPoints: 'totalFantasyPoints' in row ? row.h2hPoints : 0,
    totalPoints: 'totalFantasyPoints' in row ? row.totalFantasyPoints : row.totalPoints,
    isMe: index === 0,
  }));
}

export default function LeagueDetailPage({ params }: LeagueDetailPageProps) {
  const reduce = useReducedMotion();
  const { leagueId } = use(params);
  const mode = getDataMode();
  const [activeTab, setActiveTab] = useState('standings');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [league, setLeague] = useState<ExpLeague | null>(null);
  const [managers, setManagers] = useState<ExpLeagueManager[]>([]);
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const details = await getLeague(leagueId);
        const standings = await getLeagueStandings(
          leagueId,
          details.scoringType === 'HEAD_TO_HEAD' ? 'h2h' : 'classic',
        );
        if (cancelled) return;
        const first = standings[0];
        const leaderPoints = first
          ? ('totalFantasyPoints' in first ? first.totalFantasyPoints : first.totalPoints)
          : 0;
        setLeague({
          id: details.id,
          name: details.name,
          type: details.type,
          scoringType: details.scoringType,
          rank: first?.rank ?? 1,
          totalManagers: standings.length,
          myPoints: leaderPoints,
          leaderPoints,
          inviteCode: details.inviteCode,
        });
        setManagers(toManagers(standings));
      } catch {
        if (!cancelled) {
          setLeague(null);
          setManagers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [leagueId, mode]);

  const cfg = league ? TYPE_CONFIG[league.type] : TYPE_CONFIG.PUBLIC;
  const TypeIcon = cfg.icon;

  return (
    <FantasyShell back={{ href: '/fantasy/leagues', label: 'All Leagues' }}>
      {loading ? (
        <div className="px-4 py-8 text-exp-muted">Loading live league…</div>
      ) : !league ? (
        <div className="px-4 py-8 text-exp-muted">League not found.</div>
      ) : (
        <>
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

          {activeTab === 'standings' && (
            <div className="pb-20">
              <LeagueStandingsTable managers={managers} leagueId={leagueId} />
            </div>
          )}

          {activeTab === 'fixtures' && (
            <div className="px-4 py-8 text-center">
              <p className="text-body-md text-exp-muted">
                Fixture view is not public yet.
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="px-4 py-5 flex flex-col gap-4">
              {[
                { label: 'League Code',   value: league.inviteCode ?? 'N/A' },
                { label: 'Season',        value: 'FIFA World Cup 2026' },
                { label: 'Scoring Type',  value: league.scoringType },
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

          <InviteLeagueSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            leagueName={league.name}
            inviteCode={league.inviteCode ?? 'N/A'}
          />
        </>
      )}
    </FantasyShell>
  );
}
