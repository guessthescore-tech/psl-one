import Link from 'next/link';
import { WC_FIXTURES, WC_PLAYERS, getDataMode } from '@/lib/data';
import { ManOfTheMatchCard } from '@/components/football/ManOfTheMatchCard';
import type { MotmData } from '@/components/football/ManOfTheMatchCard';

interface PageProps {
  params: Promise<{ fixtureId: string }>;
}

export default async function MotmPage({ params }: PageProps) {
  const { fixtureId } = await params;
  const mode = getDataMode();

  // DESIGN_REVIEW_DATA only — no MOTM derivation in LIVE_BETA_DATA
  const fixture =
    WC_FIXTURES.find((f) => f.id === fixtureId) ?? WC_FIXTURES[0]!;

  const mbappe = WC_PLAYERS.find((p) => p.id === 'mbappe') ?? WC_PLAYERS[0]!;

  const motmData: MotmData = {
    player:        mbappe,
    matchContext:  `${fixture.homeClub.name} vs ${fixture.awayClub.name}`,
    rating:        9.2,
    goals:         2,
    assists:       1,
    touches:       84,
    passAccuracy:  91,
  };

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
        <ManOfTheMatchCard data={motmData} />
      </div>
    </div>
  );
}
