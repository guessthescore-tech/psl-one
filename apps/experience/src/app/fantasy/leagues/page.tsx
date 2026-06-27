'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Key, Users, Globe } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyTabs } from '@/components/fantasy/shared/FantasyTabs';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { LeagueCard } from '@/components/fantasy/leagues/LeagueCard';
import { LeagueStandingsTable } from '@/components/fantasy/leagues/LeagueStandingsTable';
import { getDataMode, isLiveDataMode, type ExpLeague, type ExpLeagueManager } from '@/lib/data';
import { getLeagueStandings, getMyLeagues, type LeagueMembership, type ClassicStandingsRow, type H2HStandingsRow } from '@/lib/fantasy-api';

const TABS = [
  { id: 'my',     label: 'My Leagues' },
  { id: 'public', label: 'Public'     },
  { id: 'global', label: 'Global'     },
];

function toExpLeague(membership: LeagueMembership, standings: ClassicStandingsRow[] | H2HStandingsRow[]): ExpLeague {
  const row = standings.find((entry) => entry.fantasyTeamId === membership.fantasyTeamId);
  const totalManagers = standings.length || 1;
  return {
    id: membership.league.id,
    name: membership.league.name,
    type: membership.league.type,
    scoringType: membership.league.scoringType,
    rank: row?.rank ?? 1,
    totalManagers,
    myPoints: row ? ('totalFantasyPoints' in row ? row.totalFantasyPoints : row.totalPoints) : 0,
    leaderPoints: standings[0]
      ? ('totalFantasyPoints' in standings[0] ? standings[0].totalFantasyPoints : standings[0].totalPoints)
      : 0,
    inviteCode: membership.league.inviteCode,
  };
}

function toManagerRows(standings: ClassicStandingsRow[] | H2HStandingsRow[]): ExpLeagueManager[] {
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

export default function LeagueHubPage() {
  const mode = getDataMode();
  const [activeTab, setActiveTab] = useState('my');
  const [myLeagues, setMyLeagues] = useState<ExpLeague[]>([]);
  const [myLeagueManagers, setMyLeagueManagers] = useState<Record<string, ExpLeagueManager[]>>({});
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const memberships = await getMyLeagues();
        const leagues: ExpLeague[] = [];
        const managersByLeague: Record<string, ExpLeagueManager[]> = {};

        await Promise.all(
          memberships.map(async (membership) => {
            const standings = await getLeagueStandings(
              membership.leagueId,
              membership.league.scoringType === 'HEAD_TO_HEAD' ? 'h2h' : 'classic',
            );
            const expLeague = toExpLeague(membership, standings);
            leagues.push(expLeague);
            managersByLeague[expLeague.id] = toManagerRows(standings);
          }),
        );

        if (cancelled) return;
        setMyLeagues(leagues);
        setMyLeagueManagers(managersByLeague);
      } catch {
        if (!cancelled) {
          setMyLeagues([]);
          setMyLeagueManagers({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const globalLeague = useMemo(() => myLeagues.find((l) => l.type === 'GLOBAL') ?? null, [myLeagues]);
  const privateLeagues = useMemo(() => myLeagues.filter((l) => l.type === 'PRIVATE'), [myLeagues]);
  const publicLeagues = useMemo(() => myLeagues.filter((l) => l.type === 'PUBLIC'), [myLeagues]);

  return (
    <FantasyShell title="Fantasy Leagues" subtitle="Compete with friends and the world">
      <FantasyPageHero
        title="Leagues"
        badge="World Cup 2026"
        stat={{ label: 'Global Rank', value: globalLeague ? `#${globalLeague.rank.toLocaleString()}` : '—' }}
      />

      <FantasyTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="px-4 py-8 text-exp-muted">Loading live leagues…</div>
      ) : (
        <>
          {activeTab === 'my' && (
            <div className="pb-32">
              {myLeagues.length === 0 ? (
                <FantasyEmptyState
                  icon={<Users size={40} />}
                  title="No leagues yet"
                  message="Create your own league or join one with an invite code."
                  action={{ label: 'Create a League', href: '/fantasy/leagues/create' }}
                />
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  {privateLeagues.concat(publicLeagues).map((league, i) => (
                    <LeagueCard key={league.id} league={league} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'public' && (
            <div className="pb-32">
              {publicLeagues.length === 0 ? (
                <div className="px-4 py-8 text-exp-muted">
                  Public league directory is not exposed yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-4">
                  {publicLeagues.map((league, i) => (
                    <LeagueCard key={league.id} league={league} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'global' && (
            <div className="pb-32">
              {globalLeague ? (
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
                    managers={myLeagueManagers[globalLeague.id] ?? []}
                    leagueId={globalLeague.id}
                  />
                </div>
              ) : (
                <div className="px-4 py-8 text-exp-muted">
                  Global league data is not available on this account yet.
                </div>
              )}
            </div>
          )}
        </>
      )}

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
