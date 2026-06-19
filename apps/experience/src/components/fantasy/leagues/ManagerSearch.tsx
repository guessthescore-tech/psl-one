'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MagnifyingGlass, ArrowRight } from '@phosphor-icons/react';
import { clsx } from 'clsx';

interface MockManager {
  id: string;
  name: string;
  teamName: string;
  totalPoints: number;
  rank: number;
  leagueId: string;
}

const MOCK_MANAGERS: MockManager[] = [
  { id: 'mgr-1', name: 'Sipho Dlamini',   teamName: 'Amakhosi XI',       totalPoints: 1489, rank: 1,      leagueId: 'league-private-1' },
  { id: 'mgr-2', name: 'Lerato Mokoena',  teamName: 'Soweto Stars',      totalPoints: 1371, rank: 2,      leagueId: 'league-private-1' },
  { id: 'mgr-3', name: 'Thabo Nkosi',     teamName: 'Golden Squad',      totalPoints: 1188, rank: 4,      leagueId: 'league-private-1' },
  { id: 'mgr-4', name: 'Nomsa Vilakazi',  teamName: 'Atlas Lions FC',    totalPoints: 1102, rank: 5,      leagueId: 'league-private-1' },
  { id: 'mgr-5', name: 'Kagiso Sithole',  teamName: 'Mzansi Magic',      totalPoints: 984,  rank: 6,      leagueId: 'league-private-1' },
];

interface ManagerSearchProps {
  filter: 'ALL' | 'MY_LEAGUES' | 'FRIENDS';
}

export function ManagerSearch({ filter }: ManagerSearchProps) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');

  const showResults = query.length >= 3;
  const filteredResults = showResults
    ? MOCK_MANAGERS.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.teamName.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="px-4 py-4">
      {/* Search input */}
      <div className="relative mb-4">
        <MagnifyingGlass
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-exp-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search managers or teams..."
          aria-label="Search for managers by name or team name"
          className={clsx(
            'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm pl-10 pr-4 py-3',
            'text-body-md text-white placeholder:text-white/30 min-h-[44px]',
            'focus:outline-none focus:border-exp-gold transition-colors',
          )}
        />
      </div>

      {/* Results */}
      {!showResults && (
        <div className="text-center py-12">
          <MagnifyingGlass size={36} className="text-exp-muted mx-auto mb-3" />
          <p className="text-body-md text-exp-muted">
            Search for managers by name or team name
          </p>
          <p className="text-label-sm text-exp-muted/60 mt-1">
            Type at least 3 characters
          </p>
        </div>
      )}

      {showResults && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-body-md text-exp-muted">No managers found for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {showResults && filteredResults.length > 0 && (
        <div className="flex flex-col divide-y divide-exp-border-dk">
          {filteredResults.map((manager, index) => (
            <motion.div
              key={manager.id}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
            >
              <Link
                href={`/fantasy/leagues/${manager.leagueId}/teams/${manager.id}`}
                className="flex items-center gap-3 py-3.5 hover:bg-white/3 transition-colors rounded focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
                aria-label={`${manager.name} — ${manager.teamName} — ${manager.totalPoints} points`}
              >
                <div className="w-9 h-9 rounded-full bg-exp-navy-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-label-lg text-exp-gold font-black">
                    {manager.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-semibold text-white truncate">{manager.name}</div>
                  <div className="text-label-sm text-exp-muted truncate">{manager.teamName}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-body-sm font-black text-white">{manager.totalPoints.toLocaleString()}</div>
                  <div className="text-label-sm text-exp-muted">pts</div>
                </div>
                <ArrowRight size={14} className="text-exp-muted flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
