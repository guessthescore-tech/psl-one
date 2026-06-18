'use client';

import Link from 'next/link';
import { FantasyGameweekPanel, TopPerformers, LeagueTablePanel } from '@/components/vision';
import { PSL_PLAYERS, PSL_STANDINGS, CURRENT_GAMEWEEK, visionImg } from '@/lib/vision-data';

const PITCH_LAYOUT = [
  { position: 'GK',  slots: 1 },
  { position: 'DEF', slots: 4 },
  { position: 'MID', slots: 4 },
  { position: 'FWD', slots: 2 },
];

const SQUAD_SAMPLE = [
  { name: 'Siyabonga Mpontshane', pos: 'GK',  pts: 38, price: 4.0, club: 'AmaZulu',   seed: 'football-player-gk' },
  { name: 'Tebogo Langerman',     pos: 'DEF', pts: 58, price: 7.5, club: 'Pirates',    seed: 'football-player-def-1' },
  { name: 'Rushine De Reuck',     pos: 'DEF', pts: 52, price: 6.5, club: 'Sundowns',   seed: 'football-player-def-2' },
  { name: 'Tercious Malepe',      pos: 'DEF', pts: 47, price: 6.0, club: 'CT City',    seed: 'football-player-def-3' },
  { name: 'Lyle Lakay',           pos: 'DEF', pts: 55, price: 6.5, club: 'Sundowns',   seed: 'football-player-def-4' },
  { name: 'Themba Zwane',         pos: 'MID', pts: 218, price: 12.5, club: 'Sundowns', seed: 'football-player-action-1', captain: true },
  { name: 'Yusuf Maart',          pos: 'MID', pts: 188, price: 9.5, club: 'Sekhukhune', seed: 'football-player-action-4' },
  { name: 'Neo Maema',            pos: 'MID', pts: 181, price: 9.0, club: 'Sundowns',   seed: 'football-player-action-5' },
  { name: 'Sphelele Mkhulise',    pos: 'MID', pts: 162, price: 8.5, club: 'Pirates',    seed: 'football-player-mid-4' },
  { name: 'Evidence Makgopa',     pos: 'FWD', pts: 204, price: 11.0, club: 'Pirates',   seed: 'football-player-action-2' },
  { name: 'Khanyisa Mayo',        pos: 'FWD', pts: 197, price: 10.5, club: 'CT City',   seed: 'football-player-action-3' },
];

function PitchPosition({
  player,
}: {
  player: (typeof SQUAD_SAMPLE)[0];
}) {
  return (
    <div className="flex flex-col items-center gap-1 group">
      {player.captain && (
        <span className="text-[9px] font-black text-psl-gold uppercase tracking-wider">(C)</span>
      )}
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-psl-midnight group-hover:border-psl-gold motion-safe:transition-colors">
          <img
            src={visionImg(player.seed, 96, 96)}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded text-white whitespace-nowrap"
          style={{ backgroundColor: '#1b3a6b' }}
        >
          {player.pts}
        </div>
      </div>
      <span className="text-[9px] font-bold text-white/70 text-center max-w-[56px] truncate mt-1.5">
        {player.name.split(' ').pop()}
      </span>
    </div>
  );
}

export default function VisionFantasyPage() {
  const captain = PSL_PLAYERS[0]!;
  const gk  = [SQUAD_SAMPLE[0]!];
  const def = SQUAD_SAMPLE.slice(1, 5);
  const mid = SQUAD_SAMPLE.slice(5, 9);
  const fwd = SQUAD_SAMPLE.slice(9, 11);
  const rows = [gk, def, mid, fwd];

  return (
    <main className="min-h-[100dvh] bg-psl-surface">

      {/* Vision nav */}
      <nav className="bg-psl-midnight border-b border-white/10 px-6 py-3 flex items-center justify-between" aria-label="Vision studio nav">
        <Link href="/vision" className="text-[10px] font-bold text-white/40 hover:text-white/70 motion-safe:transition-colors flex items-center gap-1.5 focus-visible:outline-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Vision Hub
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Fantasy Hub</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wide">Design Review</span>
      </nav>

      {/* Pitch view */}
      <section
        className="relative overflow-hidden bg-psl-midnight py-8 px-4"
        aria-label="Fantasy squad on pitch"
        style={{ minHeight: 480 }}
      >
        {/* Pitch texture */}
        <div className="absolute inset-0 bg-pitch-dark opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-psl-midnight/50" aria-hidden />

        <div className="relative z-10 max-w-lg mx-auto">
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-psl-gold mb-6">
            {CURRENT_GAMEWEEK.label}
          </p>

          {/* Formation rows */}
          <div className="space-y-6">
            {rows.map((row, ri) => (
              <div key={ri} className="flex items-center justify-center gap-4 flex-wrap">
                {row.map((p) => <PitchPosition key={p.name} player={p} />)}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button className="bg-psl-gold text-psl-midnight text-xs font-black px-5 py-2.5 rounded-pill hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold min-h-[44px]">
              Make transfers
            </button>
            <button className="border border-white/25 bg-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-pill hover:bg-white/20 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[44px]">
              View bench
            </button>
          </div>

          <p className="text-center text-[10px] text-white/25 mt-4">
            Points only · No real money · No financial value
          </p>
        </div>
      </section>

      {/* Gameweek + performers side by side */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FantasyGameweekPanel
          gameweek={CURRENT_GAMEWEEK}
          captain={captain}
          totalPoints={312}
          transfersRemaining={1}
        />
        <TopPerformers players={PSL_PLAYERS} label="Gameweek Performers" />
      </div>

      {/* League table context */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <LeagueTablePanel standings={PSL_STANDINGS} maxRows={5} />
      </div>

    </main>
  );
}
