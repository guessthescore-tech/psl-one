'use client';

import Link from 'next/link';
import {
  MatchweekHero,
  LiveScoreRibbon,
  PremiumFixtureCarousel,
  LeagueTablePanel,
  PlayerSpotlight,
  TopPerformers,
  EditorialStoryGrid,
  VideoHighlightRail,
  ClubIdentityRail,
  SponsorMoment,
  FantasyGameweekPanel,
  FanValuePanel,
} from '@/components/vision';
import {
  PSL_FIXTURES,
  PSL_STANDINGS,
  PSL_PLAYERS,
  PSL_STORIES,
  PSL_CLUBS,
  CURRENT_GAMEWEEK,
  MOCK_FAN_VALUE,
} from '@/lib/vision-data';

export default function VisionInSeasonPage() {
  const featuredPlayer = PSL_PLAYERS[0]!;
  const captain = PSL_PLAYERS[1]!;

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
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">In-Season Home</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wide">Design Review</span>
      </nav>

      {/* 1. Matchweek Hero */}
      <MatchweekHero gameweek={CURRENT_GAMEWEEK} competitionName="DStv Premiership" />

      {/* 2. Live Score Ribbon */}
      <LiveScoreRibbon fixtures={PSL_FIXTURES} />

      {/* 3. Sponsor Moment */}
      <SponsorMoment sponsorName="DStv" message="Live PSL football, every matchday" />

      {/* 4. Premium Fixture Carousel */}
      <div className="bg-white">
        <PremiumFixtureCarousel fixtures={PSL_FIXTURES} label="Gameweek 32" />
      </div>

      {/* 5 + 6. Table + Player Spotlight side by side on larger screens */}
      <div className="px-6 py-8 bg-psl-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* 5. League Table */}
          <LeagueTablePanel standings={PSL_STANDINGS} maxRows={8} />

          {/* 6. Player Spotlight */}
          <PlayerSpotlight player={featuredPlayer} />
        </div>
      </div>

      {/* 7. Top Performers */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPerformers players={PSL_PLAYERS} label="Fantasy Top Performers" />

          {/* 12. Fantasy Gameweek Panel */}
          <FantasyGameweekPanel
            gameweek={CURRENT_GAMEWEEK}
            captain={captain}
            totalPoints={312}
            transfersRemaining={1}
          />
        </div>
      </div>

      {/* 13. Fan Value Panel */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto lg:max-w-2xl">
          <FanValuePanel fanValue={MOCK_FAN_VALUE} />
        </div>
      </div>

      {/* 8. Editorial Story Grid */}
      <div className="max-w-7xl mx-auto">
        <EditorialStoryGrid stories={PSL_STORIES} />
      </div>

      {/* 9. Video Highlight Rail */}
      <VideoHighlightRail stories={PSL_STORIES} />

      {/* 10. Club Identity Rail */}
      <ClubIdentityRail clubs={PSL_CLUBS} />

      {/* Non-financial disclaimer footer */}
      <footer className="bg-psl-dark text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-base font-black mb-1">PSL <span className="text-psl-gold">One</span></div>
              <p className="text-xs text-white/40 max-w-sm leading-relaxed">
                DStv Premiership digital platform. Points only. No real money, no deposits, no withdrawals.
                All gameplay is for engagement points only.
              </p>
            </div>
            <div className="flex gap-4 text-xs text-white/30">
              <Link href="/vision" className="hover:text-white/60 motion-safe:transition-colors focus-visible:outline-none">Vision Hub</Link>
              <Link href="/"       className="hover:text-white/60 motion-safe:transition-colors focus-visible:outline-none">Live site</Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
