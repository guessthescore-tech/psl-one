'use client';

import { useState, useMemo } from 'react';
import { PlayerFilters } from './PlayerFilters';
import { PlayerPoolRow } from './PlayerPoolRow';
import type { ExpFantasyPlayer } from '@/lib/data';

type PositionFilter = 'ALL' | 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

interface PlayerPoolProps {
  players: ExpFantasyPlayer[];
  onSelect?: (player: ExpFantasyPlayer) => void;
  pickedIds?: string[];
  filterPosition?: PositionFilter;
}

export function PlayerPool({ players, onSelect, pickedIds = [], filterPosition }: PlayerPoolProps) {
  const [position, setPosition] = useState<PositionFilter>(filterPosition ?? 'ALL');
  const [sortBy, setSortBy] = useState<'points' | 'price' | 'form'>('points');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...players];
    if (position !== 'ALL') {
      list = list.filter(p => p.position === position);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.clubShort.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === 'points') return b.points - a.points;
      if (sortBy === 'price') return b.price - a.price;
      return b.form - a.form;
    });
    return list;
  }, [players, position, search, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-2 border-b border-exp-border-dk">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search players…"
          aria-label="Search players"
          className="w-full bg-exp-void border border-exp-border-dk rounded-card-xs px-3 py-2 text-body-sm text-white placeholder:text-exp-muted focus:outline-none focus:border-exp-gold"
        />
      </div>

      <PlayerFilters
        position={position}
        onPositionChange={setPosition}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-exp-muted text-body-sm">No players found</div>
        ) : (
          filtered.map(player => (
            <PlayerPoolRow
              key={player.id}
              player={player}
              onSelect={onSelect}
              isAlreadyPicked={pickedIds.includes(player.id)}
            />
          ))
        )}
      </div>

      <p className="px-4 py-2 text-label-sm text-exp-muted text-center border-t border-exp-border-dk">
        Points only — no real money or financial value
      </p>
    </div>
  );
}
