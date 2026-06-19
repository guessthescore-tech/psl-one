import { getExperienceData, getDataMode } from '@/lib/data';
import { MatchweekHeroSection } from '@/sections/MatchweekHeroSection';
import { FixtureCarouselSection } from '@/sections/FixtureCarouselSection';
import { FeaturedMatchSection } from '@/sections/FeaturedMatchSection';
import { GuessTheScoreSection } from '@/sections/GuessTheScoreSection';
import { LeagueTableSection } from '@/sections/LeagueTableSection';
import { FantasyGameweekSection } from '@/sections/FantasyGameweekSection';
import { PlayerSpotlightSection } from '@/sections/PlayerSpotlightSection';
import { EditorialGridSection } from '@/sections/EditorialGridSection';
import { VideoRailSection } from '@/sections/VideoRailSection';
import { ClubIdentitySection } from '@/sections/ClubIdentitySection';
import { SponsorSection } from '@/sections/SponsorSection';
import { FanValueSection } from '@/sections/FanValueSection';
import { MyClubSection } from '@/sections/MyClubSection';

export default function HomePage() {
  const data = getExperienceData();
  const mode = getDataMode();

  return (
    <>
      {/* Data mode banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          aria-label="Design review mode"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA - WC 2026 mock data active
        </div>
      )}

      <MatchweekHeroSection data={data} />
      <FixtureCarouselSection data={data} />
      <FeaturedMatchSection data={data} />
      <GuessTheScoreSection data={data} />
      <LeagueTableSection data={data} />
      <FantasyGameweekSection data={data} />
      <PlayerSpotlightSection data={data} />
      <EditorialGridSection data={data} />
      <VideoRailSection data={data} />
      <ClubIdentitySection data={data} />
      <SponsorSection />
      <FanValueSection data={data} />
      <MyClubSection data={data} />
    </>
  );
}
