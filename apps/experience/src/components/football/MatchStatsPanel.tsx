'use client';

import { motion, useReducedMotion } from 'framer-motion';

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
}

interface StatBarProps {
  label: string;
  home: number;
  away: number;
  isPercent?: boolean;
  index: number;
}

function StatBar({ label, home, away, isPercent = false, index }: StatBarProps) {
  const reduce = useReducedMotion();
  const total = home + away || 1;
  const homeWidth = Math.round((home / total) * 100);
  const awayWidth = 100 - homeWidth;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-body-sm">
        <span className="text-white font-semibold tabular-nums">{home}{isPercent ? '%' : ''}</span>
        <span className="text-exp-muted text-label-sm uppercase tracking-wide">{label}</span>
        <span className="text-white font-semibold tabular-nums">{away}{isPercent ? '%' : ''}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-exp-ink">
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${homeWidth}%` }}
          transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="bg-exp-gold rounded-full"
          aria-hidden
        />
        <motion.div
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${awayWidth}%` }}
          transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="bg-exp-navy-2 rounded-full"
          aria-hidden
        />
      </div>
    </div>
  );
}

interface MatchStatsPanelProps {
  stats: MatchStats;
  homeTeamName: string;
  awayTeamName: string;
}

export function MatchStatsPanel({ stats, homeTeamName, awayTeamName }: MatchStatsPanelProps) {
  return (
    <div
      className="bg-exp-navy rounded-card p-5 border border-exp-border-dk space-y-4"
      aria-label="Match statistics"
    >
      {/* Team headers */}
      <div className="flex items-center justify-between text-label-sm text-exp-muted pb-2 border-b border-exp-border-dk">
        <span className="text-white font-bold">{homeTeamName}</span>
        <span className="uppercase tracking-wider">Stats</span>
        <span className="text-white font-bold">{awayTeamName}</span>
      </div>

      <StatBar label="Possession" home={stats.possession.home} away={stats.possession.away} isPercent index={0} />
      <StatBar label="Shots" home={stats.shots.home} away={stats.shots.away} index={1} />
      <StatBar label="On Target" home={stats.shotsOnTarget.home} away={stats.shotsOnTarget.away} index={2} />
      <StatBar label="Corners" home={stats.corners.home} away={stats.corners.away} index={3} />
      <StatBar label="Fouls" home={stats.fouls.home} away={stats.fouls.away} index={4} />
      <StatBar label="Yellow Cards" home={stats.yellowCards.home} away={stats.yellowCards.away} index={5} />
      <StatBar label="Offsides" home={stats.offsides.home} away={stats.offsides.away} index={6} />
    </div>
  );
}

/* ── Mock stats for DESIGN_REVIEW_DATA (France 2-1 Germany) ─── */
export const MOCK_MATCH_STATS: MatchStats = {
  possession:    { home: 58, away: 42 },
  shots:         { home: 12, away: 8  },
  shotsOnTarget: { home: 5,  away: 3  },
  corners:       { home: 7,  away: 4  },
  fouls:         { home: 9,  away: 14 },
  yellowCards:   { home: 1,  away: 2  },
  redCards:      { home: 0,  away: 0  },
  offsides:      { home: 2,  away: 3  },
};
