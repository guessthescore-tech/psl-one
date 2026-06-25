import Link from 'next/link';

interface WcTeam {
  name: string;
  shortName?: string;
}

interface WcFixtureCardProps {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: WcTeam | null;
  awayTeam: WcTeam | null;
  homeScore?: number | null;
  awayScore?: number | null;
  round?: string | null;
  href?: string;
  variant?: 'default' | 'live' | 'predict';
}

const NATION_FLAGS: Record<string, string> = {
  'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Belgium': '🇧🇪', 'Brazil': '🇧🇷',
  'Cameroon': '🇨🇲', 'Canada': '🇨🇦', 'Chile': '🇨🇱', 'Colombia': '🇨🇴',
  'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷', 'Czechia': '🇨🇿', 'Czech Republic': '🇨🇿',
  'Denmark': '🇩🇰', 'Ecuador': '🇪🇨', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Hungary': '🇭🇺', 'Iran': '🇮🇷',
  'Italy': '🇮🇹', 'Japan': '🇯🇵', 'Mexico': '🇲🇽', 'Morocco': '🇲🇦',
  'Netherlands': '🇳🇱', 'Nigeria': '🇳🇬', 'Panama': '🇵🇦', 'Peru': '🇵🇪',
  'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Slovenia': '🇸🇮',
  'South Korea': '🇰🇷', 'South Africa': '🇿🇦', 'Spain': '🇪🇸', 'Switzerland': '🇨🇭',
  'Tunisia': '🇹🇳', 'Turkey': '🇹🇷', 'Türkiye': '🇹🇷', 'Ukraine': '🇺🇦',
  'United States': '🇺🇸', 'USA': '🇺🇸', 'Uruguay': '🇺🇾', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
};

function getFlag(name: string | undefined): string {
  if (!name) return '🏳️';
  return NATION_FLAGS[name] ?? '⚽';
}

function statusConfig(status: string, isLive?: boolean): { label: string; className: string; pulse?: boolean } {
  const s = status.toLowerCase();
  if (isLive || s === 'live' || s === 'in_play' || s === 'in_progress') {
    return { label: 'LIVE', className: 'bg-red-500/20 text-red-400 border-red-500/30', pulse: true };
  }
  if (s === 'half_time') {
    return { label: 'HT', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }
  if (s === 'finished' || s === 'closed' || s === 'ended') {
    return { label: 'FT', className: 'bg-white/10 text-white/50 border-white/10' };
  }
  if (s === 'scheduled' || s === 'not_started') {
    return { label: 'OPEN', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  }
  return { label: status.replace(/_/g, ' '), className: 'bg-white/5 text-white/40 border-white/10' };
}

export function WcFixtureCard({
  id,
  kickoffAt,
  status,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  round,
  href,
  variant = 'default',
}: WcFixtureCardProps) {
  const kickoff = new Date(kickoffAt);
  const isLiveVariant = variant === 'live';
  const badge = statusConfig(status, isLiveVariant);
  const hasScore = homeScore != null && awayScore != null;
  const target = href ?? `/matches/${id}`;

  const homeFlag = getFlag(homeTeam?.name);
  const awayFlag = getFlag(awayTeam?.name);
  const homeName = homeTeam?.shortName ?? homeTeam?.name ?? 'TBD';
  const awayName = awayTeam?.shortName ?? awayTeam?.name ?? 'TBD';

  return (
    <Link
      href={target}
      className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors group ${
        isLiveVariant
          ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20'
      }`}
    >
      {/* Home team */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <p className="font-semibold text-sm truncate text-right group-hover:text-emerald-400 transition-colors">
          {homeName}
        </p>
        <span className="text-xl flex-shrink-0" aria-hidden>{homeFlag}</span>
      </div>

      {/* Score or time */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 text-center w-24">
        {hasScore ? (
          <span className="font-mono font-black text-xl text-white tabular-nums">
            {homeScore} – {awayScore}
          </span>
        ) : (
          <span className="text-white/40 text-xs font-mono">
            {kickoff.toLocaleTimeString('en-ZA', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Africa/Johannesburg',
            })}
          </span>
        )}
        <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.className}`}>
          {badge.pulse && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" aria-hidden />
          )}
          {badge.label}
        </div>
        {round && <span className="text-[10px] text-white/25 truncate max-w-[90px]">{round}</span>}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl flex-shrink-0" aria-hidden>{awayFlag}</span>
        <p className="font-semibold text-sm truncate group-hover:text-emerald-400 transition-colors">
          {awayName}
        </p>
      </div>
    </Link>
  );
}

export function WcFixtureDateLabel({ kickoffAt }: { kickoffAt: string }) {
  const d = new Date(kickoffAt);
  return (
    <p className="text-xs text-white/40 text-center">
      {d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
    </p>
  );
}
