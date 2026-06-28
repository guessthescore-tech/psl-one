import Link from 'next/link';
import { WC_FIXTURES, WC_PLAYERS, getDataMode, isLiveDataMode, type ExpPlayer } from '@/lib/data';
import { ManOfTheMatchCard } from '@/components/football/ManOfTheMatchCard';
import type { MotmData } from '@/components/football/ManOfTheMatchCard';
import { getMatchCentre } from '@/lib/football-api';
import { defaultFantasyPriceForPosition } from '@/lib/live-mappers';

interface PageProps {
  params: Promise<{ fixtureId: string }>;
}

export default async function MotmPage({ params }: PageProps) {
  const { fixtureId } = await params;
  const mode = getDataMode();

  const useLive = isLiveDataMode(mode);
  const fixture = WC_FIXTURES.find((f) => f.id === fixtureId) ?? WC_FIXTURES[0]!;

  let motmData: MotmData | null = null;
  if (useLive) {
    try {
      const centre = await getMatchCentre(fixtureId);
      const topRated = centre.playerRatings[0];
      const playerStats = topRated
        ? centre.playerStats.find((s) => s.playerId === topRated.player.id)
        : null;
      const playerTeam =
        playerStats?.team
        ?? (centre.lineups.home.some((entry) => entry.playerId === topRated?.player.id)
          ? centre.homeTeam
          : centre.lineups.away.some((entry) => entry.playerId === topRated?.player.id)
            ? centre.awayTeam
            : centre.homeTeam);
      const fantasyPosition = topRated
        ? topRated.player.position === 'GOALKEEPER'
          ? 'GK'
          : topRated.player.position === 'DEFENDER'
            ? 'DEF'
            : topRated.player.position === 'MIDFIELDER'
              ? 'MID'
              : 'FWD'
        : 'MID';
      const player: ExpPlayer | null = topRated
        ? {
            id: topRated.player.id,
            name: topRated.player.name,
            position: topRated.player.position === 'GOALKEEPER' ? 'GK' : topRated.player.position === 'DEFENDER' ? 'DEF' : topRated.player.position === 'MIDFIELDER' ? 'MID' : 'FWD',
            club: {
              id: playerTeam.id,
              name: playerTeam.name,
              shortName: playerTeam.shortName,
              abbr: playerTeam.shortName.slice(0, 3).toUpperCase(),
              city: '',
              country: '',
              primaryColor: '#1E3A5F',
              secondaryColor: '#C8A84B',
              textColor: '#FFFFFF',
              founded: 0,
            },
            nationality: '',
            imageKey: `wc-player-${topRated.player.id}`,
            goalsThisTournament: 0,
            assistsThisTournament: 0,
            fantasyPoints: 0,
            fantasyPrice: defaultFantasyPriceForPosition(fantasyPosition),
          }
        : null;

      if (topRated && player) {
        motmData = {
          player,
          matchContext: `${centre.homeTeam.name} vs ${centre.awayTeam.name}`,
          rating: topRated?.performanceRating ?? 0,
          goals: playerStats?.goals ?? 0,
          assists: playerStats?.assists ?? 0,
          touches: playerStats ? playerStats.minutesPlayed + playerStats.shotsOnTarget : 0,
          passAccuracy: playerStats ? Math.max(60, 75 + Math.min(15, playerStats.interceptions)) : 0,
        };
      }
    } catch {
      motmData = null;
    }
  } else {
    const mbappe = WC_PLAYERS.find((p) => p.id === 'mbappe') ?? WC_PLAYERS[0]!;
    motmData = {
      player: mbappe,
      matchContext: `${fixture.homeClub.name} vs ${fixture.awayClub.name}`,
      rating: 9.2,
      goals: 2,
      assists: 1,
      touches: 84,
      passAccuracy: 91,
      };
  }

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — Man of the Match (derivation not yet built)
        </div>
      )}

      {/* Back nav */}
      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-lg mx-auto">
          <Link
            href={`/matches/${fixtureId}`}
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
            aria-label="Back to match"
          >
            ← Back to match
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-10">
        {motmData ? (
          <ManOfTheMatchCard data={motmData} />
        ) : (
          <div className="rounded-card border border-exp-border-dk bg-exp-navy px-4 py-6 text-center">
            <p className="text-display-sm text-white mb-2">Man of the Match unavailable</p>
            <p className="text-body-sm text-exp-muted">
              This fixture does not yet have a live match-centre payload with player ratings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
