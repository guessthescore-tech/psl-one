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
import { getLiveWorldCupStories } from '@/lib/live-world-cup-feed';

/**
 * Homepage — World Cup 2026 Beta.
 * Hero fixtures come from the live API (GET /football/fixtures?seasonSlug=fifa-world-cup-2026).
 * Falls back to "API unavailable" state — no hardcoded match data shown as live.
 * Editorial sections (fantasy preview, articles, video) use design-review data clearly labelled.
 *
 * WC_BETA · NO_REAL_MONEY
 */
export default async function HomePage() {
  const mode = getDataMode();
  const editorialData = mode === 'DESIGN_REVIEW_DATA' ? getExperienceData() : null;
  const stories =
    mode === 'DESIGN_REVIEW_DATA'
      ? editorialData?.stories ?? []
      : await getLiveWorldCupStories();

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

      {/* FIFA-style stories directive — design review should lead with editorial content */}
      {stories.length > 0 && (
        <EditorialGridSection stories={stories} />
      )}

      {/* Live API-backed fixtures — no hardcoded match data */}
      <HomepageFixtureSection />

      {/* Editorial preview sections — design review only */}
      {mode === 'DESIGN_REVIEW_DATA' && editorialData && (
        <div
          role="note"
          aria-label="Editorial beta preview notice"
          className="mx-auto max-w-6xl px-4 py-2 mb-0"
        >
          <p className="text-xs text-white/40 text-center border border-white/10 rounded px-3 py-1.5">
            Sections below are editorial beta previews — design data, not live provider data
          </p>
        </div>
      )}
      {editorialData && (
        <>
          <LeagueTableSection data={editorialData} />
          <FantasyGameweekSection data={editorialData} />
          <PlayerSpotlightSection data={editorialData} />
          <VideoRailSection data={editorialData} />
          <ClubIdentitySection data={editorialData} />
          <SponsorSection />
          <FanValueSection data={editorialData} />
          <MyClubSection data={editorialData} />
        </>
      )}
    </>
  );
}
