'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ExpPlayer } from '@/lib/data';

interface RivalTeamPitchViewProps {
  players: ExpPlayer[];
  bench: ExpPlayer[];
  captainId?: string;
}

type Formation = [number, number, number]; // DEF, MID, FWD counts

function getFormation(players: ExpPlayer[]): Formation {
  const defs = players.filter(p => p.position === 'DEF').length;
  const mids = players.filter(p => p.position === 'MID').length;
  const fwds = players.filter(p => p.position === 'FWD').length;
  return [defs, mids, fwds];
}

function PlayerToken({ player, isCaptain }: { player: ExpPlayer; isCaptain?: boolean }) {
  const reduce = useReducedMotion();

  const posColors: Record<string, string> = {
    GK:  'bg-exp-gold/20 border-exp-gold/60 text-exp-gold',
    DEF: 'bg-blue-500/20 border-blue-500/60 text-blue-300',
    MID: 'bg-exp-green/20 border-exp-green/60 text-exp-green',
    FWD: 'bg-exp-live/20 border-exp-live/60 text-exp-live',
  };

  const colorClass = posColors[player.position] ?? posColors['MID']!;

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={false}
      whileHover={reduce ? {} : { scale: 1.05 }}
    >
      <div className={clsx(
        'w-10 h-10 rounded-full border-2 flex items-center justify-center relative',
        colorClass,
      )}>
        <span className="text-label-sm font-black">{player.position}</span>
        {isCaptain && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-exp-gold text-exp-void text-[8px] font-black flex items-center justify-center">
            C
          </span>
        )}
      </div>
      <span className="text-label-sm text-white text-center leading-tight max-w-[56px] truncate">
        {player.name.split(' ').pop()}
      </span>
    </motion.div>
  );
}

export function RivalTeamPitchView({ players, bench, captainId }: RivalTeamPitchViewProps) {
  const gk = players.find(p => p.position === 'GK');
  const outfield = players.filter(p => p.position !== 'GK');
  const formation = getFormation(outfield);

  const defs = outfield.filter(p => p.position === 'DEF');
  const mids = outfield.filter(p => p.position === 'MID');
  const fwds = outfield.filter(p => p.position === 'FWD');

  const rows = [
    { label: `${formation[2]} FWD`, players: fwds },
    { label: `${formation[1]} MID`, players: mids },
    { label: `${formation[0]} DEF`, players: defs },
  ];

  return (
    <div className="rounded-card overflow-hidden border border-exp-border-dk">
      {/* Pitch */}
      <div
        className="bg-pitch-dark py-4 px-2 flex flex-col gap-3"
        aria-label="Rival team formation"
        role="region"
      >
        {/* Forwards, Midfielders, Defenders */}
        {rows.map((row) => (
          <div key={row.label} className="flex justify-around items-center">
            {row.players.map((player) => (
              <PlayerToken key={player.id} player={player} isCaptain={player.id === captainId} />
            ))}
          </div>
        ))}

        {/* Goalkeeper */}
        <div className="flex justify-center pt-1">
          {gk && <PlayerToken player={gk} isCaptain={gk.id === captainId} />}
        </div>
      </div>

      {/* Bench */}
      <div className="bg-exp-ink border-t border-exp-border-dk px-3 py-3">
        <div className="text-label-sm text-exp-muted uppercase tracking-widest mb-2">Bench</div>
        <div className="flex justify-around">
          {bench.map((player) => (
            <PlayerToken key={player.id} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}
