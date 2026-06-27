'use client';

import { use, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { getLeague, getLeagueStandings, type ClassicStandingsRow, type H2HStandingsRow } from '@/lib/fantasy-api';

interface RivalTeamPageProps {
  params: Promise<{ leagueId: string; teamId: string }>;
}

function findRow(rows: (ClassicStandingsRow | H2HStandingsRow)[], teamId: string) {
  return rows.find((row) => String(row.rank) === teamId || row.fantasyTeamId === teamId) ?? null;
}

export default function RivalTeamPage({ params }: RivalTeamPageProps) {
  const reduce = useReducedMotion();
  const { leagueId, teamId } = use(params);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('Rival team');
  const [summary, setSummary] = useState<{ rank: number; totalPoints: number; gameweekPoints: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const league = await getLeague(leagueId);
        const standings = await getLeagueStandings(
          leagueId,
          league.scoringType === 'HEAD_TO_HEAD' ? 'h2h' : 'classic',
        );
        const row = findRow(standings, teamId);
        if (cancelled) return;
        setTitle(row ? row.teamName : league.name);
        setSummary(row ? {
          rank: row.rank,
          totalPoints: 'totalFantasyPoints' in row ? row.totalFantasyPoints : row.totalPoints,
          gameweekPoints: 'totalFantasyPoints' in row ? row.h2hPoints : 0,
        } : null);
      } catch {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [leagueId, teamId]);

  return (
    <FantasyShell back={{ href: `/fantasy/leagues/${leagueId}`, label: 'League Standings' }}>
      <motion.div
        className="bg-exp-navy border-b border-exp-border-dk px-4 py-4"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-label-sm text-exp-muted uppercase tracking-widest mb-1">Rival team</p>
        <h1 className="text-display-md text-white">{title}</h1>
        <div className="flex gap-6 mt-3 pt-3 border-t border-exp-border-dk">
          <div>
            <div className="text-stat-md text-exp-gold font-black">{summary?.totalPoints.toLocaleString() ?? '—'}</div>
            <div className="text-label-sm text-exp-muted">Total pts</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">{summary?.gameweekPoints ?? '—'}</div>
            <div className="text-label-sm text-exp-muted">GW pts</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">#{summary?.rank.toLocaleString() ?? '—'}</div>
            <div className="text-label-sm text-exp-muted">Overall rank</div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 py-5 pb-20">
        <div className="mb-4 rounded-card-sm bg-exp-gold/10 border border-exp-gold/20 px-3 py-2">
          <p className="text-label-sm text-exp-gold">
            Detailed rival squad views are not public yet. This page now uses live league standings instead of mock roster data.
          </p>
        </div>

        {loading ? (
          <div className="text-exp-muted">Loading rival team…</div>
        ) : (
          <FantasyEmptyState
            icon="👥"
            title="Live rival squad not public"
            message="The current API exposes league standings, but not full competitor lineups yet."
            action={{ label: 'Back to League', href: `/fantasy/leagues/${leagueId}` }}
          />
        )}
      </div>
    </FantasyShell>
  );
}
