'use client';

import { clsx } from 'clsx';

export interface LineupPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
}

export interface TeamLineup {
  teamName: string;
  formation: string;
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

interface LineupPitchProps {
  home: TeamLineup;
  away: TeamLineup;
}

function FormationRow({
  players,
  side,
}: {
  players: LineupPlayer[];
  side: 'home' | 'away';
}) {
  return (
    <div className={clsx('flex items-center justify-around', side === 'away' && 'flex-row-reverse')}>
      {players.map((p) => (
        <div key={p.id} className="flex flex-col items-center gap-0.5 min-w-0">
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-black border-2',
              side === 'home'
                ? 'bg-exp-gold text-exp-void border-exp-gold'
                : 'bg-exp-navy-2 text-white border-white/20',
            )}
            aria-label={`${p.name}, number ${p.number}`}
          >
            {p.number}
          </div>
          <span className="text-label-sm text-white/80 truncate max-w-[56px] text-center leading-tight">
            {p.name.split(' ').pop()}
          </span>
        </div>
      ))}
    </div>
  );
}

function parseFormation(formation: string): number[] {
  return formation.split('-').map(Number);
}

function distributeToRows(players: LineupPlayer[], formation: number[]): LineupPlayer[][] {
  const rows: LineupPlayer[][] = [];
  let idx = 1; // skip goalkeeper (index 0)
  for (const count of formation) {
    rows.push(players.slice(idx, idx + count));
    idx += count;
  }
  return rows;
}

export function LineupPitch({ home, away }: LineupPitchProps) {
  const homeFormation = parseFormation(home.formation);
  const awayFormation = parseFormation(away.formation);

  const homeGk = home.startingXI.slice(0, 1);
  const homeRows = distributeToRows(home.startingXI, homeFormation);
  const awayGk = away.startingXI.slice(0, 1);
  const awayRows = distributeToRows(away.startingXI, awayFormation);

  return (
    <div className="space-y-4" aria-label="Match lineups">
      {/* Pitch background */}
      <div
        className="relative rounded-card overflow-hidden bg-pitch-dark border border-white/10"
        style={{ minHeight: 480 }}
        role="img"
        aria-label={`${home.teamName} (${home.formation}) vs ${away.teamName} (${away.formation})`}
      >
        {/* Pitch markings */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Centre circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/15" />
          {/* Centre line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/15 -translate-y-1/2" />
          {/* Home penalty box */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border border-white/15" />
          {/* Away penalty box */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border border-white/15" />
        </div>

        {/* Home team (bottom half) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col justify-between py-3 px-2">
          {[...homeRows].reverse().map((row, i) => (
            <FormationRow key={i} players={row} side="home" />
          ))}
          <FormationRow players={homeGk} side="home" />
        </div>

        {/* Away team (top half) */}
        <div className="absolute top-0 left-0 right-0 h-1/2 flex flex-col justify-between py-3 px-2">
          <FormationRow players={awayGk} side="away" />
          {awayRows.map((row, i) => (
            <FormationRow key={i} players={row} side="away" />
          ))}
        </div>
      </div>

      {/* Formation labels */}
      <div className="flex items-center justify-between text-label-sm text-exp-muted">
        <span>
          <span className="text-exp-gold font-bold">{home.teamName}</span> {home.formation}
        </span>
        <span>
          {away.formation} <span className="text-white/60 font-bold">{away.teamName}</span>
        </span>
      </div>

      {/* Substitutes */}
      {(home.substitutes.length > 0 || away.substitutes.length > 0) && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-exp-border-dk">
          <div>
            <div className="text-label-sm text-exp-muted mb-2">Subs — {home.teamName}</div>
            {home.substitutes.map((p) => (
              <div key={p.id} className="text-body-sm text-white/70 py-0.5">
                {p.number}. {p.name}
              </div>
            ))}
          </div>
          <div>
            <div className="text-label-sm text-exp-muted mb-2">Subs — {away.teamName}</div>
            {away.substitutes.map((p) => (
              <div key={p.id} className="text-body-sm text-white/70 py-0.5">
                {p.number}. {p.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mock lineups for DESIGN_REVIEW_DATA ─────────────────────────── */
export const MOCK_HOME_LINEUP: TeamLineup = {
  teamName: 'France',
  formation: '4-3-3',
  startingXI: [
    { id: 'h1', name: 'Maignan',    number: 1,  position: 'GK'  },
    { id: 'h2', name: 'Pavard',     number: 5,  position: 'DEF' },
    { id: 'h3', name: 'Upamecano', number: 19, position: 'DEF' },
    { id: 'h4', name: 'Konate',     number: 4,  position: 'DEF' },
    { id: 'h5', name: 'Theo',       number: 22, position: 'DEF' },
    { id: 'h6', name: 'Tchouameni',number: 8,  position: 'MID' },
    { id: 'h7', name: 'Camavinga', number: 12, position: 'MID' },
    { id: 'h8', name: 'Rabiot',     number: 14, position: 'MID' },
    { id: 'h9', name: 'Dembele',    number: 11, position: 'FWD' },
    { id: 'h10',name: 'Mbappe',     number: 10, position: 'FWD' },
    { id: 'h11',name: 'Griezmann', number: 7,  position: 'FWD' },
  ],
  substitutes: [
    { id: 'hs1', name: 'Areola',    number: 16, position: 'GK'  },
    { id: 'hs2', name: 'Varane',    number: 15, position: 'DEF' },
    { id: 'hs3', name: 'Veretout', number: 6,  position: 'MID' },
    { id: 'hs4', name: 'Thuram',    number: 9,  position: 'FWD' },
  ],
};

export const MOCK_AWAY_LINEUP: TeamLineup = {
  teamName: 'Germany',
  formation: '4-2-3-1',
  startingXI: [
    { id: 'a1', name: 'Neuer',      number: 1,  position: 'GK'  },
    { id: 'a2', name: 'Kimmich',    number: 6,  position: 'DEF' },
    { id: 'a3', name: 'Rüdiger',   number: 2,  position: 'DEF' },
    { id: 'a4', name: 'Schlotterbeck', number: 3, position: 'DEF' },
    { id: 'a5', name: 'Raum',       number: 14, position: 'DEF' },
    { id: 'a6', name: 'Kroos',      number: 8,  position: 'MID' },
    { id: 'a7', name: 'Goretzka',   number: 18, position: 'MID' },
    { id: 'a8', name: 'Müller',    number: 13, position: 'MID' },
    { id: 'a9', name: 'Gnabry',     number: 10, position: 'MID' },
    { id: 'a10',name: 'Sané',      number: 19, position: 'MID' },
    { id: 'a11',name: 'Werner',     number: 11, position: 'FWD' },
  ],
  substitutes: [
    { id: 'as1', name: 'Trapp',     number: 22, position: 'GK'  },
    { id: 'as2', name: 'Süle',     number: 15, position: 'DEF' },
    { id: 'as3', name: 'Havertz',  number: 7,  position: 'MID' },
    { id: 'as4', name: 'Volland',   number: 17, position: 'FWD' },
  ],
};
