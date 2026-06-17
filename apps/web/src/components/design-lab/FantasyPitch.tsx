'use client';

import { useMemo } from 'react';
import type { FantasyTeamPlayer, PlayerPosition } from '@/lib/fantasy-client';

type Position = PlayerPosition;

interface PitchPlayer {
  id: string;
  name: string;
  position: Position;
  teamShort: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isSubstitute: boolean;
  points?: number;
}

interface FantasyPitchProps {
  players: FantasyTeamPlayer[];
  formation?: string | null;
  /** Highlight a selected player */
  selectedId?: string | null;
  onSelectPlayer?: (id: string | null) => void;
}

/* ─── Formation config ──────────────────────────────────────────── */
type FormationRows = { gk: 1; def: number; mid: number; fwd: number };

function parseFormation(f: string | null | undefined): FormationRows {
  if (!f) return { gk: 1, def: 4, mid: 4, fwd: 2 };
  const parts = f.split('-').map(Number);
  return {
    gk: 1,
    def: parts[0] ?? 4,
    mid: parts[1] ?? 4,
    fwd: parts[2] ?? 2,
  };
}

/* ─── Player dot ────────────────────────────────────────────────── */
function PlayerDot({
  player,
  selected,
  onSelect,
}: {
  player: PitchPlayer;
  selected: boolean;
  onSelect: () => void;
}) {
  const posColors: Record<Position, string> = {
    GOALKEEPER: 'bg-amber-400 text-amber-900',
    DEFENDER:   'bg-psl-green text-white',
    MIDFIELDER: 'bg-psl-navy text-white',
    FORWARD:    'bg-psl-red text-white',
  };
  const bg = player.isSubstitute ? 'bg-gray-400 text-white' : posColors[player.position];

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${player.name} — ${player.position.toLowerCase()}${player.isCaptain ? ' (C)' : player.isViceCaptain ? ' (VC)' : ''}`}
      className={`flex flex-col items-center gap-0.5 transition-transform ${selected ? 'scale-110' : 'hover:scale-105'}`}
    >
      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${bg} ${selected ? 'ring-2 ring-psl-gold ring-offset-1 ring-offset-transparent' : ''}`}>
        {player.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
        {player.isCaptain && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-psl-gold text-psl-navy text-[8px] font-black flex items-center justify-center leading-none">C</span>
        )}
        {player.isViceCaptain && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[8px] font-black flex items-center justify-center leading-none">V</span>
        )}
        {player.points !== undefined && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white text-psl-navy text-[8px] font-black flex items-center justify-center leading-none shadow">
            {player.points}
          </span>
        )}
      </div>
      <span className="text-[9px] font-semibold text-white drop-shadow max-w-[44px] truncate leading-tight">
        {player.name.split(' ').at(-1)}
      </span>
      <span className="text-[8px] text-white/60">{player.teamShort}</span>
    </button>
  );
}

/* ─── Pitch row ─────────────────────────────────────────────────── */
function PitchRow({
  players,
  selectedId,
  onSelectPlayer,
}: {
  players: PitchPlayer[];
  selectedId: string | null | undefined;
  onSelectPlayer: (id: string | null) => void;
}) {
  return (
    <div className="flex items-center justify-evenly py-1">
      {players.map(p => (
        <PlayerDot
          key={p.id}
          player={p}
          selected={selectedId === p.id}
          onSelect={() => onSelectPlayer(selectedId === p.id ? null : p.id)}
        />
      ))}
    </div>
  );
}

/* ─── Bench strip ───────────────────────────────────────────────── */
function BenchStrip({
  players,
  selectedId,
  onSelectPlayer,
}: {
  players: PitchPlayer[];
  selectedId: string | null | undefined;
  onSelectPlayer: (id: string | null) => void;
}) {
  return (
    <div className="bg-black/20 rounded-b-xl py-3 px-2">
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 text-center mb-2">Bench</div>
      <div className="flex items-center justify-evenly">
        {players.map(p => (
          <PlayerDot
            key={p.id}
            player={p}
            selected={selectedId === p.id}
            onSelect={() => onSelectPlayer(selectedId === p.id ? null : p.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main pitch ────────────────────────────────────────────────── */
export function FantasyPitch({ players, formation, selectedId, onSelectPlayer }: FantasyPitchProps) {
  const rows = parseFormation(formation);

  const { gk, defenders, midfielders, forwards, bench } = useMemo(() => {
    const starters = players
      .filter(p => p.squadRole === 'STARTER')
      .map(p => ({
        id: p.id,
        name: p.player.name,
        position: p.position,
        teamShort: p.player.team.shortName,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
        isSubstitute: false,
      }));
    const subs = players
      .filter(p => p.squadRole === 'SUBSTITUTE')
      .sort((a, b) => (a.benchSlot ?? 99) - (b.benchSlot ?? 99))
      .map(p => ({
        id: p.id,
        name: p.player.name,
        position: p.position,
        teamShort: p.player.team.shortName,
        isCaptain: false,
        isViceCaptain: false,
        isSubstitute: true,
      }));

    const byPos = (pos: Position, count: number) =>
      starters.filter(p => p.position === pos).slice(0, count);

    return {
      gk:         byPos('GOALKEEPER', rows.gk),
      defenders:  byPos('DEFENDER', rows.def),
      midfielders:byPos('MIDFIELDER', rows.mid),
      forwards:   byPos('FORWARD', rows.fwd),
      bench:      subs,
    };
  }, [players, rows]);

  const handleSelect = onSelectPlayer ?? (() => {});

  if (players.length === 0) {
    return (
      <div className="rounded-xl bg-psl-green/10 border border-psl-green/20 p-8 text-center text-sm text-gray-400">
        No squad selected
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden shadow-inner"
      aria-label="Fantasy team pitch view"
      role="img"
    >
      {/* Pitch surface */}
      <div
        className="relative"
        style={{
          background: 'linear-gradient(180deg, #1a6b2e 0%, #1d7533 16.67%, #1a6b2e 16.67%, #1d7533 33.33%, #1a6b2e 33.33%, #1d7533 50%, #1a6b2e 50%, #1d7533 66.67%, #1a6b2e 66.67%, #1d7533 83.33%, #1a6b2e 83.33%, #1d7533 100%)',
        }}
      >
        {/* Pitch markings */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Centre circle */}
          <div className="w-20 h-20 rounded-full border border-white/15 absolute top-1/2 -translate-y-1/2" />
          <div className="w-1 h-1 rounded-full bg-white/30 absolute top-1/2 -translate-y-1/2" />
          {/* Centre line */}
          <div className="w-full h-px bg-white/15 absolute top-1/2" />
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-10 border border-white/15 border-t-0" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-10 border border-white/15 border-b-0" />
        </div>

        {/* Players — FWD at top, GK at bottom (attacking upwards) */}
        <div className="relative z-10 px-2 pt-3 pb-0 space-y-1">
          <PitchRow players={forwards}    selectedId={selectedId} onSelectPlayer={handleSelect} />
          <PitchRow players={midfielders} selectedId={selectedId} onSelectPlayer={handleSelect} />
          <PitchRow players={defenders}   selectedId={selectedId} onSelectPlayer={handleSelect} />
          <PitchRow players={gk}          selectedId={selectedId} onSelectPlayer={handleSelect} />
        </div>
      </div>

      {/* Bench */}
      {bench.length > 0 && (
        <BenchStrip
          players={bench}
          selectedId={selectedId}
          onSelectPlayer={handleSelect}
        />
      )}
    </div>
  );
}
