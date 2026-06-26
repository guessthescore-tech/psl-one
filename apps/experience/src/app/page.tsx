import { getExperienceData, getDataMode } from '@/lib/data';
import { HomepageFixtureSection } from '@/sections/HomepageFixtureSection';
import { LeagueTableSection } from '@/sections/LeagueTableSection';
import { FantasyGameweekSection } from '@/sections/FantasyGameweekSection';
import { PlayerSpotlightSection } from '@/sections/PlayerSpotlightSection';
import { EditorialGridSection } from '@/sections/EditorialGridSection';
import { VideoRailSection } from '@/sections/VideoRailSection';
import { ClubIdentitySection } from '@/sections/ClubIdentitySection';
import { SponsorSection } from '@/sections/SponsorSection';
import { FanValueSection } from '@/sections/FanValueSection';
import { MyClubSection } from '@/sections/MyClubSection';

/**
 * Homepage — World Cup 2026 Beta.
 * Hero fixtures come from the live API (GET /football/fixtures?seasonSlug=fifa-world-cup-2026).
 * Falls back to "API unavailable" state — no hardcoded match data shown as live.
 * Editorial sections (fantasy preview, articles, video) use design-review data clearly labelled.
 *
 * WC_BETA · NO_REAL_MONEY
 */
export default async function HomePage() {
  // Editorial/preview data — not presented as live match data
  const editorialData = getExperienceData();
  const mode = getDataMode();

  return (
    <>
      {/* Development-only mode banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          aria-label="Design review mode"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA - WC 2026 mock data active
        </div>
      )}

      {/* Live API-backed fixtures — no hardcoded match data */}
      <HomepageFixtureSection />

      {/* Editorial preview sections — clearly labelled design-review content */}
      <LeagueTableSection data={editorialData} />
      <FantasyGameweekSection data={editorialData} />
      <PlayerSpotlightSection data={editorialData} />
      <EditorialGridSection data={editorialData} />
      <VideoRailSection data={editorialData} />
      <ClubIdentitySection data={editorialData} />
      <SponsorSection />
      <FanValueSection data={editorialData} />
      <MyClubSection data={editorialData} />
    </>
  );
}
