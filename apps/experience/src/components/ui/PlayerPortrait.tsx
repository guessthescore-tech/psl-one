import { expImg } from '@/lib/data';
import type { ExpPlayer } from '@/lib/data';
import { TeamIdentity } from './TeamIdentity';

interface PlayerPortraitProps {
  player: ExpPlayer;
  compact?: boolean;
}

const POSITION_LABEL: Record<ExpPlayer['position'], string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward',
};

export function PlayerPortrait({ player, compact = false }: PlayerPortraitProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-exp-navy flex-shrink-0">
          <img
            src={expImg(player.imageKey, 80, 80)}
            alt={player.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">{player.name}</div>
          <div className="text-label-sm text-white/45">
            {player.club.shortName} · {POSITION_LABEL[player.position]}
          </div>
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <div className="text-sm font-black text-exp-gold tabular-nums">{player.fantasyPoints}</div>
          <div className="text-label-sm text-white/45">pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-card bg-exp-ink" aria-label={`Player: ${player.name}`}>
      {/* Club colour stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: player.club.primaryColor }}
        aria-hidden
      />

      <div className="flex gap-5 p-5 pl-6">
        {/* Portrait */}
        <div className="w-24 h-28 rounded-card-sm overflow-hidden bg-exp-navy flex-shrink-0">
          <img
            src={expImg(player.imageKey, 192, 224)}
            alt={player.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="text-label-sm text-exp-gold mb-1">
                {POSITION_LABEL[player.position]}
              </div>
              <h3 className="text-display-sm text-white font-black leading-tight">
                {player.name}
              </h3>
            </div>
            <TeamIdentity club={player.club} size="sm" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Goals',     value: player.goalsThisTournament },
              { label: 'Assists',   value: player.assistsThisTournament },
              { label: 'FPL pts',   value: player.fantasyPoints },
              { label: 'Price',     value: `£${player.fantasyPrice}m` },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-card-xs p-2.5">
                <div className="text-stat-md font-black text-white tabular-nums">{s.value}</div>
                <div className="text-label-sm text-white/45 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
