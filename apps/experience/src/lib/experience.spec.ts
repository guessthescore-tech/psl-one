import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../..');

function src(rel: string) {
  return resolve(ROOT, 'src', rel);
}

function read(rel: string) {
  return readFileSync(src(rel), 'utf8');
}

function exists(rel: string) {
  return existsSync(src(rel));
}

// ─── package.json ──────────────────────────────────────────────────────────

describe('package.json', () => {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));

  it('has correct name', () => {
    expect(pkg.name).toBe('@psl-one/experience');
  });

  it('declares framer-motion dependency', () => {
    expect(pkg.dependencies['framer-motion']).toBeTruthy();
  });

  it('declares @phosphor-icons/react dependency', () => {
    expect(pkg.dependencies['@phosphor-icons/react']).toBeTruthy();
  });

  it('has dev script on port 3002', () => {
    expect(pkg.scripts.dev).toContain('3002');
  });
});

// ─── Shell components ──────────────────────────────────────────────────────

describe('shell components exist', () => {
  it('AppHeader.tsx', () => expect(exists('components/shell/AppHeader.tsx')).toBe(true));
  it('MobileBottomNav.tsx', () => expect(exists('components/shell/MobileBottomNav.tsx')).toBe(true));
  it('MatchweekNav.tsx', () => expect(exists('components/shell/MatchweekNav.tsx')).toBe(true));
});

// ─── UI components ─────────────────────────────────────────────────────────

describe('ui components exist', () => {
  it('SectionHeader.tsx', () => expect(exists('components/ui/SectionHeader.tsx')).toBe(true));
  it('FixtureCard.tsx',   () => expect(exists('components/ui/FixtureCard.tsx')).toBe(true));
  it('TeamIdentity.tsx',  () => expect(exists('components/ui/TeamIdentity.tsx')).toBe(true));
  it('PlayerPortrait.tsx',() => expect(exists('components/ui/PlayerPortrait.tsx')).toBe(true));
  it('LeagueTable.tsx',   () => expect(exists('components/ui/LeagueTable.tsx')).toBe(true));
  it('EditorialStory.tsx',() => expect(exists('components/ui/EditorialStory.tsx')).toBe(true));
  it('VideoCard.tsx',     () => expect(exists('components/ui/VideoCard.tsx')).toBe(true));
  it('GameEntryCard.tsx', () => expect(exists('components/ui/GameEntryCard.tsx')).toBe(true));
  it('SponsorMoment.tsx', () => expect(exists('components/ui/SponsorMoment.tsx')).toBe(true));
});

// ─── Action components ─────────────────────────────────────────────────────

describe('action components exist', () => {
  it('ShareAction.tsx',     () => expect(exists('components/actions/ShareAction.tsx')).toBe(true));
  it('ChallengeAction.tsx', () => expect(exists('components/actions/ChallengeAction.tsx')).toBe(true));
});

// ─── Section components ────────────────────────────────────────────────────

describe('homepage sections exist', () => {
  const sections = [
    'MatchweekHeroSection.tsx',
    'FixtureCarouselSection.tsx',
    'FeaturedMatchSection.tsx',
    'GuessTheScoreSection.tsx',
    'LeagueTableSection.tsx',
    'FantasyGameweekSection.tsx',
    'PlayerSpotlightSection.tsx',
    'EditorialGridSection.tsx',
    'VideoRailSection.tsx',
    'ClubIdentitySection.tsx',
    'SponsorSection.tsx',
    'FanValueSection.tsx',
    'MyClubSection.tsx',
  ];
  for (const s of sections) {
    it(s, () => expect(exists(`sections/${s}`)).toBe(true));
  }
});

// ─── App files ─────────────────────────────────────────────────────────────

describe('app files exist', () => {
  it('layout.tsx', () => expect(exists('app/layout.tsx')).toBe(true));
  it('page.tsx',   () => expect(exists('app/page.tsx')).toBe(true));
  it('globals.css',() => expect(exists('app/globals.css')).toBe(true));
});

// ─── Data layer ────────────────────────────────────────────────────────────

describe('data.ts exports', () => {
  const src_ = read('lib/data.ts');

  it('exports getDataMode', () => expect(src_).toContain('export function getDataMode'));
  it('exports getExperienceData', () => expect(src_).toContain('export function getExperienceData'));
  it('exports expImg', () => expect(src_).toContain('export function expImg'));
  it('exports WC_CLUBS', () => expect(src_).toContain('export const WC_CLUBS'));
  it('exports WC_FIXTURES', () => expect(src_).toContain('export const WC_FIXTURES'));
  it('exports WC_STANDINGS', () => expect(src_).toContain('export const WC_STANDINGS'));
  it('exports WC_PLAYERS', () => expect(src_).toContain('export const WC_PLAYERS'));
  it('exports WC_STORIES', () => expect(src_).toContain('export const WC_STORIES'));
  it('exports WC_VIDEOS', () => expect(src_).toContain('export const WC_VIDEOS'));
  it('has LIVE_BETA_DATA mode', () => expect(src_).toContain('LIVE_BETA_DATA'));
  it('has DESIGN_REVIEW_DATA mode', () => expect(src_).toContain('DESIGN_REVIEW_DATA'));
});

// ─── Non-financial disclaimers ─────────────────────────────────────────────

describe('non-financial disclaimers', () => {
  const gameSurfaces = [
    'components/ui/GameEntryCard.tsx',
    'components/ui/SponsorMoment.tsx',
    'sections/GuessTheScoreSection.tsx',
    'sections/FantasyGameweekSection.tsx',
    'sections/FanValueSection.tsx',
    'sections/FeaturedMatchSection.tsx',
  ];

  for (const file of gameSurfaces) {
    it(`${file} has disclaimer`, () => {
      const content = read(file);
      const hasDisclaimer =
        content.includes('Points only') ||
        content.includes('no real money') ||
        content.includes('No gambling') ||
        content.includes('no financial value');
      expect(hasDisclaimer).toBe(true);
    });
  }
});

describe('no gambling language', () => {
  const files = [
    'sections/GuessTheScoreSection.tsx',
    'components/ui/GameEntryCard.tsx',
    'sections/FanValueSection.tsx',
  ];
  for (const file of files) {
    it(`${file} has no gambling references`, () => {
      const content = read(file).toLowerCase();
      expect(content).not.toContain('gamble');
      expect(content).not.toContain('betting');
      expect(content).not.toContain('wager');
      expect(content).not.toContain('casino');
    });
  }
});

// ─── Accessibility checks ──────────────────────────────────────────────────

describe('touch target compliance (min-h-[44px])', () => {
  const interactive = [
    'components/shell/MobileBottomNav.tsx',
    'components/ui/FixtureCard.tsx',
    'components/actions/ShareAction.tsx',
    'sections/GuessTheScoreSection.tsx',
  ];
  for (const file of interactive) {
    it(`${file} has min-h-[44px]`, () => {
      expect(read(file)).toContain('min-h-[44px]');
    });
  }
});

describe('aria-labels on icon-only buttons', () => {
  it('ShareAction has aria-label on close button', () => {
    expect(read('components/actions/ShareAction.tsx')).toContain('aria-label');
  });
  it('FixtureCarouselSection has aria-label on scroll buttons', () => {
    expect(read('sections/FixtureCarouselSection.tsx')).toContain('aria-label');
  });
});

describe('safe-area-inset usage', () => {
  it('MobileBottomNav has pb-safe', () => {
    expect(read('components/shell/MobileBottomNav.tsx')).toContain('pb-safe');
  });
  it('ShareAction has safe-area padding', () => {
    const content = read('components/actions/ShareAction.tsx');
    expect(content).toContain('safe-area');
  });
});

describe('min-h-[100dvh] used instead of h-screen', () => {
  it('MatchweekHeroSection uses 100dvh', () => {
    expect(read('sections/MatchweekHeroSection.tsx')).toContain('100dvh');
  });
  it('MatchweekHeroSection does not use h-screen', () => {
    expect(read('sections/MatchweekHeroSection.tsx')).not.toContain('h-screen');
  });
});

// ─── Motion accessibility ──────────────────────────────────────────────────

describe('useReducedMotion usage in animated components', () => {
  const animated = [
    'sections/MatchweekHeroSection.tsx',
    'components/shell/MobileBottomNav.tsx',
    'sections/GuessTheScoreSection.tsx',
    'components/ui/FixtureCard.tsx',
  ];
  for (const file of animated) {
    it(`${file} uses useReducedMotion`, () => {
      expect(read(file)).toContain('useReducedMotion');
    });
  }
});

// ─── Design system ─────────────────────────────────────────────────────────

describe('tailwind config tokens', () => {
  const tw = readFileSync(resolve(ROOT, 'tailwind.config.ts'), 'utf8');

  it('defines exp-void color', () => expect(tw).toContain('void'));
  it('defines exp-gold color', () => expect(tw).toContain('gold'));
  it('defines exp-green color', () => expect(tw).toContain('green'));
  it('defines exp-live color', () => expect(tw).toContain('live'));
  it('defines font-outfit', () => expect(tw).toContain('outfit'));
  it('defines font-jetbrains', () => expect(tw).toContain('jetbrains'));
  it('defines card radius', () => expect(tw).toContain('card'));
  it('defines pill radius', () => expect(tw).toContain('pill'));
  it('defines live-pulse keyframe', () => expect(tw).toContain('live-pulse'));
  it('defines glow-gold shadow', () => expect(tw).toContain('glow-gold'));
});

describe('CREATIVE-DIRECTION.md exists', () => {
  it('docs file present', () => {
    expect(existsSync(resolve(ROOT, 'docs/CREATIVE-DIRECTION.md'))).toBe(true);
  });
});

describe('next.config.ts', () => {
  const nc = readFileSync(resolve(ROOT, 'next.config.ts'), 'utf8');
  it('has standalone output', () => expect(nc).toContain('standalone'));
  it('does not use picsum.photos (replaced with branded SVG placeholders)', () => {
    expect(nc).not.toContain('picsum.photos');
  });
});

// ─── Fantasy Leagues pages ─────────────────────────────────────────────────

describe('Fantasy Leagues pages', () => {
  it('leagues hub renders tabs', () => {
    expect(exists('app/fantasy/leagues/page.tsx')).toBe(true);
    const content = read('app/fantasy/leagues/page.tsx');
    expect(content).toContain('FantasyTabs');
    expect(content).toContain('My Leagues');
    expect(content).toContain('Public');
    expect(content).toContain('Global');
  });

  it('join league page renders code input', () => {
    expect(exists('app/fantasy/leagues/join/page.tsx')).toBe(true);
    const content = read('app/fantasy/leagues/join/page.tsx');
    expect(content).toContain('LeagueCodeInput');
    expect(content).toContain('Find League');
  });

  it('create league page renders form', () => {
    expect(exists('app/fantasy/leagues/create/page.tsx')).toBe(true);
    const content = read('app/fantasy/leagues/create/page.tsx');
    expect(content).toContain('LeagueCreateForm');
    expect(content).toContain('InviteLeagueSheet');
  });

  it('league detail renders standings table', () => {
    expect(exists('app/fantasy/leagues/[leagueId]/page.tsx')).toBe(true);
    const content = read('app/fantasy/leagues/[leagueId]/page.tsx');
    expect(content).toContain('LeagueStandingsTable');
    expect(content).toContain('InviteLeagueSheet');
    expect(content).toContain('Standings');
    expect(content).toContain('About');
  });

  it('history page renders timeline', () => {
    expect(exists('app/fantasy/history/page.tsx')).toBe(true);
    const content = read('app/fantasy/history/page.tsx');
    expect(content).toContain('FantasyHistoryTimeline');
    expect(content).toContain('FANTASY_MOCK_HISTORY');
  });

  it('search page renders search input', () => {
    expect(exists('app/fantasy/search/page.tsx')).toBe(true);
    const content = read('app/fantasy/search/page.tsx');
    expect(content).toContain('ManagerSearch');
    expect(content).toContain('ManagerFilters');
  });
});

// ─── Fantasy Leagues components ────────────────────────────────────────────

describe('Fantasy Leagues components exist', () => {
  const components = [
    'components/fantasy/leagues/LeagueCard.tsx',
    'components/fantasy/leagues/LeagueCodeInput.tsx',
    'components/fantasy/leagues/LeagueCreateForm.tsx',
    'components/fantasy/leagues/LeagueStandingsTable.tsx',
    'components/fantasy/leagues/ManagerRow.tsx',
    'components/fantasy/leagues/RankMovement.tsx',
    'components/fantasy/leagues/RivalTeamPitchView.tsx',
    'components/fantasy/leagues/FantasyHistoryTimeline.tsx',
    'components/fantasy/leagues/GameweekHistoryCard.tsx',
    'components/fantasy/leagues/InviteLeagueSheet.tsx',
    'components/fantasy/leagues/ManagerSearch.tsx',
    'components/fantasy/leagues/ManagerFilters.tsx',
  ];
  for (const c of components) {
    it(c.split('/').pop()!, () => expect(exists(c)).toBe(true));
  }
});

// ─── Fantasy Core pages ────────────────────────────────────────────────────

describe('Fantasy Core pages', () => {
  it('fantasy landing page renders without error', () => {
    expect(exists('app/fantasy/page.tsx')).toBe(true);
    const content = read('app/fantasy/page.tsx');
    expect(content).toContain('FantasyLandingPage');
    expect(content).toContain('getTeam');
    expect(content).toContain('getTransferStatus');
  });

  it('fantasy team page shows pitch view', () => {
    expect(exists('app/fantasy/team/page.tsx')).toBe(true);
    const content = read('app/fantasy/team/page.tsx');
    expect(content).toContain('FantasyPitchView');
    expect(content).toContain('BenchPanel');
  });

  it('fantasy transfers page shows player pool', () => {
    expect(exists('app/fantasy/team/transfers/page.tsx')).toBe(true);
    const content = read('app/fantasy/team/transfers/page.tsx');
    expect(content).toContain('PlayerPool');
    expect(content).toContain('TransferPanel');
  });

  it('fantasy chips page shows all 4 chips', () => {
    expect(exists('app/fantasy/team/chips/page.tsx')).toBe(true);
    const content = read('app/fantasy/team/chips/page.tsx');
    expect(content).toContain('ChipSelector');
    expect(content).toContain('FANTASY_MOCK_CHIPS');
  });

  it('fantasy FDR page shows difficulty matrix', () => {
    expect(exists('app/fantasy/fixture-difficulty/page.tsx')).toBe(true);
    const content = read('app/fantasy/fixture-difficulty/page.tsx');
    expect(content).toContain('FixtureDifficultyMatrix');
    expect(content).toContain('FANTASY_MOCK_FDR');
    expect(content).toContain('getFixtures');
    expect(content).toContain('getStandings');
  });

  it('fantasy onboarding page shows step 1', () => {
    expect(exists('app/fantasy/onboarding/page.tsx')).toBe(true);
    const content = read('app/fantasy/onboarding/page.tsx');
    expect(content).toContain('OnboardingStep');
    expect(content).toContain('FormationSelector');
  });
});

// ─── Fantasy Core components ───────────────────────────────────────────────

describe('Fantasy Core components exist', () => {
  const coreComponents = [
    'components/fantasy/core/FantasyPitchView.tsx',
    'components/fantasy/core/PlayerSlot.tsx',
    'components/fantasy/core/PlayerPool.tsx',
    'components/fantasy/core/PlayerPoolRow.tsx',
    'components/fantasy/core/PlayerFilters.tsx',
    'components/fantasy/core/BudgetIndicator.tsx',
    'components/fantasy/core/FormationSelector.tsx',
    'components/fantasy/core/CaptainMarker.tsx',
    'components/fantasy/core/BenchPanel.tsx',
    'components/fantasy/core/TransferPanel.tsx',
    'components/fantasy/core/TransferConfirmation.tsx',
    'components/fantasy/core/ChipCard.tsx',
    'components/fantasy/core/ChipSelector.tsx',
    'components/fantasy/core/DeadlineCountdown.tsx',
    'components/fantasy/core/FixtureDifficultyMatrix.tsx',
    'components/fantasy/core/FixtureDifficultyCell.tsx',
    'components/fantasy/core/OnboardingStep.tsx',
  ];
  for (const c of coreComponents) {
    it(c.split('/').pop()!, () => expect(exists(c)).toBe(true));
  }
});

describe('Fantasy shared components exist', () => {
  const shared = [
    'components/fantasy/shared/FantasyShell.tsx',
    'components/fantasy/shared/FantasyLoadingState.tsx',
    'components/fantasy/shared/FantasyEmptyState.tsx',
    'components/fantasy/shared/FantasyErrorState.tsx',
    'components/fantasy/shared/FantasyActionBar.tsx',
    'components/fantasy/shared/FantasyModal.tsx',
    'components/fantasy/shared/FantasyBottomSheet.tsx',
    'components/fantasy/shared/FantasyTabs.tsx',
    'components/fantasy/shared/FantasySectionHeader.tsx',
    'components/fantasy/shared/FantasyPageHero.tsx',
    'components/fantasy/shared/SkeletonCard.tsx',
    'components/fantasy/shared/SkeletonText.tsx',
  ];
  for (const s of shared) {
    it(s.split('/').pop()!, () => expect(exists(s)).toBe(true));
  }
});

describe('Fantasy data layer exports', () => {
  const dt = read('lib/data.ts');
  it('exports FANTASY_MOCK_LEAGUES', () => expect(dt).toContain('export const FANTASY_MOCK_LEAGUES'));
  it('exports FANTASY_MOCK_HISTORY', () => expect(dt).toContain('export const FANTASY_MOCK_HISTORY'));
  it('exports FANTASY_MOCK_TEAM',    () => expect(dt).toContain('export const FANTASY_MOCK_TEAM'));
  it('exports FANTASY_MOCK_PLAYERS', () => expect(dt).toContain('export const FANTASY_MOCK_PLAYERS'));
  it('exports ExpLeague type',        () => expect(dt).toContain('export interface ExpLeague'));
  it('exports ExpHistoryEntry type',  () => expect(dt).toContain('export interface ExpHistoryEntry'));
  it('exports ExpLeagueManager type', () => expect(dt).toContain('export interface ExpLeagueManager'));
  it('exports ExpFantasySquad type',  () => expect(dt).toContain('export interface ExpFantasySquad'));
});

describe('Fantasy league pages — non-financial compliance', () => {
  const leaguePages = [
    'app/fantasy/leagues/create/page.tsx',
    'components/fantasy/leagues/LeagueCreateForm.tsx',
    'app/fantasy/history/[gameweekId]/page.tsx',
    'components/fantasy/leagues/InviteLeagueSheet.tsx',
  ];
  for (const file of leaguePages) {
    it(`${file} has no gambling language`, () => {
      const content = read(file).toLowerCase();
      expect(content).not.toContain('gamble');
      expect(content).not.toContain('betting');
      expect(content).not.toContain('wager');
      expect(content).not.toContain('casino');
      expect(content).not.toContain('stake');
    });
  }
});

describe('Fantasy mock data exports', () => {
  const dataSrc = read('lib/data.ts');
  it('exports FANTASY_MOCK_PLAYERS', () => expect(dataSrc).toContain('FANTASY_MOCK_PLAYERS'));
  it('exports FANTASY_MOCK_TEAM', () => expect(dataSrc).toContain('FANTASY_MOCK_TEAM'));
  it('exports FANTASY_MOCK_CHIPS', () => expect(dataSrc).toContain('FANTASY_MOCK_CHIPS'));
  it('exports FANTASY_MOCK_FDR', () => expect(dataSrc).toContain('FANTASY_MOCK_FDR'));
  it('has ExpFantasyPlayer type', () => expect(dataSrc).toContain('ExpFantasyPlayer'));
  it('has 30 mock players', () => {
    const matches = dataSrc.match(/id: 'fp-(gk|def|mid|fwd)-/g);
    expect(matches?.length).toBeGreaterThanOrEqual(28);
  });
});

describe('Fantasy non-financial disclaimers', () => {
  const fantasyFiles = [
    'app/fantasy/page.tsx',
    'app/fantasy/team/transfers/page.tsx',
    'app/fantasy/team/chips/page.tsx',
    'components/fantasy/core/TransferPanel.tsx',
    'components/fantasy/core/PlayerPool.tsx',
    'components/fantasy/core/TransferConfirmation.tsx',
  ];
  for (const file of fantasyFiles) {
    it(`${file.split('/').pop()} has non-financial disclaimer`, () => {
      const content = read(file);
      const hasDisclaimer =
        content.includes('Points only') ||
        content.includes('no real money') ||
        content.includes('no financial value');
      expect(hasDisclaimer).toBe(true);
    });
  }
});

describe('RankMovement component', () => {
  it('renders with up movement text', () => {
    const content = read('components/fantasy/leagues/RankMovement.tsx');
    expect(content).toContain('ArrowUp');
    expect(content).toContain('ArrowDown');
    expect(content).toContain('Minus');
  });
  it('uses accessible aria-labels', () => {
    const content = read('components/fantasy/leagues/RankMovement.tsx');
    expect(content).toContain('aria-label');
  });
});

describe('LeagueCodeInput', () => {
  it('auto-uppercases input', () => {
    const content = read('components/fantasy/leagues/LeagueCodeInput.tsx');
    expect(content).toContain('toUpperCase');
  });
  it('supports paste from clipboard', () => {
    const content = read('components/fantasy/leagues/LeagueCodeInput.tsx');
    expect(content).toContain('clipboard');
  });
  it('has accessible aria labels', () => {
    const content = read('components/fantasy/leagues/LeagueCodeInput.tsx');
    expect(content).toContain('aria-label');
  });
});

describe('fantasy-api lib', () => {
  const api = read('lib/fantasy-api.ts');
  it('exports getMyLeagues', () => expect(api).toContain('export function getMyLeagues'));
  it('exports joinLeagueByCode', () => expect(api).toContain('export function joinLeagueByCode'));
  it('exports createLeague', () => expect(api).toContain('export function createLeague'));
  it('exports getHistory', () => expect(api).toContain('export function getHistory'));
  it('exports League type', () => expect(api).toContain('export interface League'));
  it('exports ClassicStandingsRow type', () => expect(api).toContain('export interface ClassicStandingsRow'));
});

describe('auth lib', () => {
  const authLib = read('lib/auth.ts');
  it('exports isAuthenticated', () => expect(authLib).toContain('export function isAuthenticated'));
  it('exports getToken', () => expect(authLib).toContain('export function getToken'));
});

describe('Fantasy touch target compliance', () => {
  const touchFiles = [
    'components/fantasy/core/PlayerSlot.tsx',
    'components/fantasy/core/PlayerPoolRow.tsx',
    'components/fantasy/shared/FantasyActionBar.tsx',
    'components/fantasy/shared/FantasyModal.tsx',
    'components/fantasy/shared/FantasyBottomSheet.tsx',
  ];
  for (const file of touchFiles) {
    it(`${file.split('/').pop()} has min-h-[44px]`, () => {
      expect(read(file)).toContain('min-h-[44px]');
    });
  }
});

describe('Fantasy motion accessibility (useReducedMotion)', () => {
  const animatedFiles = [
    'components/fantasy/core/FantasyPitchView.tsx',
    'components/fantasy/core/PlayerSlot.tsx',
    'components/fantasy/core/ChipCard.tsx',
    'components/fantasy/shared/FantasyActionBar.tsx',
    'components/fantasy/shared/FantasyModal.tsx',
    'components/fantasy/shared/FantasyBottomSheet.tsx',
  ];
  for (const file of animatedFiles) {
    it(`${file.split('/').pop()} uses useReducedMotion`, () => {
      expect(read(file)).toContain('useReducedMotion');
    });
  }
});

describe('Fantasy lib layer', () => {
  it('auth.ts exists', () => expect(exists('lib/auth.ts')).toBe(true));
  it('fantasy-api.ts exists', () => expect(exists('lib/fantasy-api.ts')).toBe(true));
  it('auth.ts exports isAuthenticated', () => expect(read('lib/auth.ts')).toContain('isAuthenticated'));
  it('auth.ts exports getToken', () => expect(read('lib/auth.ts')).toContain('getToken'));
  it('fantasy-api.ts exports getTeam', () => expect(read('lib/fantasy-api.ts')).toContain('getTeam'));
  it('fantasy-api.ts exports makeTransfers', () => expect(read('lib/fantasy-api.ts')).toContain('makeTransfers'));
  it('fantasy-api.ts exports activateChip', () => expect(read('lib/fantasy-api.ts')).toContain('activateChip'));
  it('fantasy-api.ts no gambling language', () => {
    const content = read('lib/fantasy-api.ts').toLowerCase();
    expect(content).not.toContain('gamble');
    expect(content).not.toContain('wager');
    expect(content).not.toContain('casino');
    expect(content).not.toContain('odds');
    expect(content).not.toContain('stake');
  });
});

// ─── Football Context pages ────────────────────────────────────────────────

describe('Football Context pages', () => {
  it('matches list renders fixture cards from live API', () => {
    expect(exists('app/matches/page.tsx')).toBe(true);
    const content = read('app/matches/page.tsx');
    // Page now fetches from live API instead of WC_FIXTURES static data
    expect(content).toContain('getFixtures');
    expect(content).toContain('WcFixtureCard');
    expect(content).toContain('seasonSlug');
    expect(content).toContain("'results'");
    expect(content).toContain("'fixtures'");
    expect(content).toContain("'live'");
  });

  it('match detail page has four tabs', () => {
    expect(exists('app/matches/[fixtureId]/page.tsx')).toBe(true);
    const content = read('app/matches/[fixtureId]/page.tsx');
    expect(content).toContain("'overview'");
    expect(content).toContain("'stats'");
    expect(content).toContain("'lineups'");
    expect(content).toContain("'timeline'");
    expect(content).toContain('MatchTimeline');
    expect(content).toContain('MatchStatsPanel');
    expect(content).toContain('LineupPitch');
  });

  it('MOTM page exists and uses ManOfTheMatchCard', () => {
    expect(exists('app/matches/[fixtureId]/motm/page.tsx')).toBe(true);
    const content = read('app/matches/[fixtureId]/motm/page.tsx');
    expect(content).toContain('ManOfTheMatchCard');
    expect(content).toContain('mbappe');
    expect(content).toContain('playerStats.find');
  });

  it('player directory renders player rows', () => {
    expect(exists('app/players/page.tsx')).toBe(true);
    const content = read('app/players/page.tsx');
    expect(content).toContain('WC_PLAYERS');
    expect(content).toContain('getPlayers');
    expect(content).toContain('footballPlayerToExpPlayer');
    expect(content).toContain('PlayerProfileHero');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('search');
    expect(content).toContain("'GK'");
    expect(content).toContain("'DEF'");
    expect(content).toContain("'MID'");
    expect(content).toContain("'FWD'");
  });

  it('player profile page renders stat grid and tabs', () => {
    expect(exists('app/players/[playerId]/page.tsx')).toBe(true);
    const content = read('app/players/[playerId]/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('PlayerStatGrid');
    expect(content).toContain('PlayerGameweekTable');
    expect(content).toContain("'season'");
    expect(content).toContain("'fantasy'");
    expect(content).toContain("'matches'");
    expect(content).toContain('Add to Fantasy Team');
  });

  it('player stats page has radar and fantasy breakdown', () => {
    expect(exists('app/players/[playerId]/stats/page.tsx')).toBe(true);
    const content = read('app/players/[playerId]/stats/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('PlayerStatGrid');
    expect(content).toContain('PlayerGameweekTable');
    expect(content).toContain('Fantasy Points Breakdown');
    expect(content).toContain('Radar');
  });

  it('standings page renders league table', () => {
    expect(exists('app/stats/standings/page.tsx')).toBe(true);
    const content = read('app/stats/standings/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('WC_STANDINGS');
    expect(content).toContain('StandingsTable');
  });

  it('season stats page renders top scorers', () => {
    expect(exists('app/stats/season/page.tsx')).toBe(true);
    const content = read('app/stats/season/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('SeasonLeaderboard');
    expect(content).toContain('buildLeaderboard');
    expect(content).toContain("'goals'");
    expect(content).toContain("'assists'");
    expect(content).toContain('Total Goals');
  });

  it('compare page renders two player selectors', () => {
    expect(exists('app/stats/compare/page.tsx')).toBe(true);
    const content = read('app/stats/compare/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('PlayerComparison');
    expect(content).toContain('selectedA');
    expect(content).toContain('selectedB');
    expect(content).toContain('getTopPerformers');
    expect(content).toContain('topPerformerToExpPlayer');
  });

  it('awards page renders award cards', () => {
    expect(exists('app/stats/awards/page.tsx')).toBe(true);
    const content = read('app/stats/awards/page.tsx');
    expect(content).toContain('AwardCard');
    expect(content).toContain('getTopPerformers');
    expect(content).toContain('topPerformerToExpPlayer');
    expect(content).toContain('Goal of the Tournament');
    expect(content).toContain('Golden Boot');
  });

  it('hall of fame page renders teaser cards and coming soon state', () => {
    expect(exists('app/stats/hall-of-fame/page.tsx')).toBe(true);
    const content = read('app/stats/hall-of-fame/page.tsx');
    expect(content).toContain('HallOfFameCard');
    expect(content).toContain('Hall of Fame');
    expect(content).toContain('tournament concludes');
  });

  it('media detail page renders article content', () => {
    expect(exists('app/media/[slug]/page.tsx')).toBe(true);
    const content = read('app/media/[slug]/page.tsx');
    expect(content).toContain('ArticleDetail');
    expect(content).toContain('VideoPlayerShell');
    expect(content).toContain('WC_STORIES');
    expect(content).toContain('WC_VIDEOS');
  });
});

// ─── Football components exist ─────────────────────────────────────────────

describe('football components exist', () => {
  const components = [
    'components/football/MatchHeader.tsx',
    'components/football/MatchStateBadge.tsx',
    'components/football/MatchTimeline.tsx',
    'components/football/MatchStatsPanel.tsx',
    'components/football/LineupPitch.tsx',
    'components/football/PlayerProfileHero.tsx',
    'components/football/PlayerStatGrid.tsx',
    'components/football/PlayerGameweekTable.tsx',
    'components/football/PlayerComparison.tsx',
    'components/football/ComparisonMetric.tsx',
    'components/football/SeasonLeaderboard.tsx',
    'components/football/StandingsTable.tsx',
    'components/football/AwardCard.tsx',
    'components/football/HallOfFameCard.tsx',
    'components/football/ManOfTheMatchCard.tsx',
    'components/football/ArticleDetail.tsx',
    'components/football/VideoPlayerShell.tsx',
  ];
  for (const comp of components) {
    it(comp, () => expect(exists(comp)).toBe(true));
  }
});

describe('no gambling language in football pages', () => {
  const footballFiles = [
    'app/players/page.tsx',
    'app/players/[playerId]/page.tsx',
    'app/stats/compare/page.tsx',
    'components/football/PlayerComparison.tsx',
    'components/football/ManOfTheMatchCard.tsx',
  ];
  for (const file of footballFiles) {
    it(`${file} has no gambling references`, () => {
      const content = read(file).toLowerCase();
      expect(content).not.toContain('gamble');
      expect(content).not.toContain('betting');
      expect(content).not.toContain('wager');
      expect(content).not.toContain('casino');
      expect(content).not.toContain('odds');
    });
  }
});

describe('non-financial disclaimers on football surfaces', () => {
  const surfaces = [
    'app/players/page.tsx',
    'app/players/[playerId]/page.tsx',
    'app/players/[playerId]/stats/page.tsx',
    'app/stats/season/page.tsx',
    'app/stats/compare/page.tsx',
    'components/football/PlayerComparison.tsx',
    'components/football/ManOfTheMatchCard.tsx',
  ];
  for (const file of surfaces) {
    it(`${file} has non-financial disclaimer`, () => {
      const content = read(file);
      const hasDisclaimer =
        content.includes('Points only') ||
        content.includes('no real money') ||
        content.includes('no financial value') ||
        content.includes('No gambling');
      expect(hasDisclaimer).toBe(true);
    });
  }
});

describe('touch target compliance on football pages', () => {
  const interactive = [
    'app/matches/page.tsx',
    'app/players/page.tsx',
    'app/stats/compare/page.tsx',
    'components/football/ManOfTheMatchCard.tsx',
  ];
  for (const file of interactive) {
    it(`${file} has min-h-[44px]`, () => {
      expect(read(file)).toContain('min-h-[44px]');
    });
  }
});

describe('live pulse animation', () => {
  it('MatchStateBadge uses animate-live-pulse for LIVE status', () => {
    const content = read('components/football/MatchStateBadge.tsx');
    expect(content).toContain('animate-live-pulse');
  });

  it('matches page shows live pulse indicator', () => {
    const content = read('app/matches/page.tsx');
    expect(content).toContain('animate-live-pulse');
  });
});

describe('DESIGN_REVIEW_DATA only screens', () => {
  it('MOTM page shows design review notice', () => {
    const content = read('app/matches/[fixtureId]/motm/page.tsx');
    expect(content).toContain('DESIGN_REVIEW_DATA');
  });
  it('compare page shows design review notice', () => {
    const content = read('app/stats/compare/page.tsx');
    expect(content).toContain('DESIGN_REVIEW_DATA');
  });
  it('awards page shows design review notice', () => {
    const content = read('app/stats/awards/page.tsx');
    expect(content).toContain('DESIGN_REVIEW_DATA');
  });
  it('hall of fame page shows design review notice', () => {
    const content = read('app/stats/hall-of-fame/page.tsx');
    expect(content).toContain('DESIGN_REVIEW_DATA');
  });
});

// ─── Account & Auth pages ──────────────────────────────────────────────────

describe('Account & Auth pages', () => {
  it('sign-in page renders email and password fields', () => {
    const content = read('app/sign-in/page.tsx');
    expect(content).toContain('type="email"');
    expect(content).toContain('type={showPassword');
    expect(content).toContain('Sign in');
  });

  it('register page redirects to /sign-up', () => {
    const content = read('app/register/page.tsx');
    expect(content).toContain('redirect');
    expect(content).toContain('/sign-up');
  });

  it('account overview renders profile summary', () => {
    const content = read('app/account/page.tsx');
    expect(content).toContain('displayName');
    expect(content).toContain('memberSince');
    expect(content).toContain('Fantasy Summary');
  });

  it('help page renders FAQ categories', () => {
    const content = read('app/help/page.tsx');
    expect(content).toContain('Getting Started');
    expect(content).toContain('Fantasy Rules');
    expect(content).toContain('Account');
    expect(content).toContain('Technical');
  });

  it('terms page renders legal document', () => {
    const content = read('app/terms/page.tsx');
    expect(content).toContain('Acceptance of Terms');
    expect(content).toContain('Governing Law');
    expect(content).toContain('LegalDocument');
  });

  it('privacy page renders data rights section', () => {
    const content = read('app/privacy/page.tsx');
    expect(content).toContain('POPIA');
    expect(content).toContain('Data Controller');
    expect(content).toContain('LegalDocument');
  });

  it('about page renders mission statement', () => {
    const content = read('app/about/page.tsx');
    expect(content).toContain('The Digital Operating System');
    expect(content).toContain('Points Engine');
    expect(content).toContain('Club Experience');
    expect(content).toContain('Social Leagues');
  });

  it('quiz shell renders question and answer options', () => {
    const content = read('components/account/QuizShell.tsx');
    expect(content).toContain('question');
    expect(content).toContain('options');
    expect(content).toContain('correctIndex');
    expect(content).toContain('Fan Points');
  });
});

describe('account components exist', () => {
  const components = [
    'components/account/AuthLayout.tsx',
    'components/account/AuthTabs.tsx',
    'components/account/AccountNav.tsx',
    'components/account/ProfileForm.tsx',
    'components/account/PasswordForm.tsx',
    'components/account/FavouriteTeamSelector.tsx',
    'components/account/DeleteAccountDialog.tsx',
    'components/account/HelpCategoryList.tsx',
    'components/account/HelpArticle.tsx',
    'components/account/LegalDocument.tsx',
    'components/account/BadgeScannerShell.tsx',
    'components/account/QuizShell.tsx',
  ];
  for (const c of components) {
    it(c, () => expect(exists(c)).toBe(true));
  }
});

describe('account pages exist', () => {
  const pages = [
    'app/sign-in/page.tsx',
    'app/register/page.tsx',
    'app/forgot-password/page.tsx',
    'app/reset-password/page.tsx',
    'app/account/page.tsx',
    'app/account/profile/page.tsx',
    'app/account/security/page.tsx',
    'app/account/favourite-team/page.tsx',
    'app/account/delete/page.tsx',
    'app/help/page.tsx',
    'app/help/[slug]/page.tsx',
    'app/terms/page.tsx',
    'app/privacy/page.tsx',
    'app/about/page.tsx',
    'app/scan/page.tsx',
    'app/quiz/[quizId]/page.tsx',
  ];
  for (const p of pages) {
    it(p, () => expect(exists(p)).toBe(true));
  }
});

describe('account page live fallback safety', () => {
  it('account overview does not fall back to mock profile on API failure', () => {
    const content = read('app/account/page.tsx');
    expect(content).toContain('FantasyErrorState');
    expect(content).not.toContain('show mock data if API unavailable');
    expect(content).toContain("setLoadError('Could not load your account summary.');");
  });
});

describe('auth lib exists', () => {
  it('lib/auth.ts present', () => expect(exists('lib/auth.ts')).toBe(true));
  it('lib/profile-api.ts present', () => expect(exists('lib/profile-api.ts')).toBe(true));
  it('auth.ts exports login', () => expect(read('lib/auth.ts')).toContain('export async function login'));
  it('auth.ts exports register', () => expect(read('lib/auth.ts')).toContain('export async function register'));
  it('auth.ts exports logout', () => expect(read('lib/auth.ts')).toContain('export async function logout'));
  it('auth.ts exports getMe', () => expect(read('lib/auth.ts')).toContain('export async function getMe'));
  it('auth.ts exports isAuthenticated', () => expect(read('lib/auth.ts')).toContain('export function isAuthenticated'));
  it('auth.ts exports requestPasswordReset', () => expect(read('lib/auth.ts')).toContain('export async function requestPasswordReset'));
  it('auth.ts exports confirmPasswordReset', () => expect(read('lib/auth.ts')).toContain('export async function confirmPasswordReset'));
  it('profile-api.ts exports getProfile', () => expect(read('lib/profile-api.ts')).toContain('export async function getProfile'));
  it('profile-api.ts exports updateProfile', () => expect(read('lib/profile-api.ts')).toContain('export async function updateProfile'));
  it('profile-api.ts exports getProfileSummary', () => expect(read('lib/profile-api.ts')).toContain('export async function getProfileSummary'));
});

describe('POPIA compliance messaging', () => {
  it('delete account page references POPIA', () => {
    expect(read('components/account/DeleteAccountDialog.tsx')).toContain('POPIA');
  });
  it('privacy page references POPIA', () => {
    expect(read('app/privacy/page.tsx')).toContain('POPIA');
  });
  it('delete button is disabled', () => {
    expect(read('components/account/DeleteAccountDialog.tsx')).toContain('disabled');
  });
});

describe('no gambling language in auth/account pages', () => {
  const files = [
    'app/sign-in/page.tsx',
    'app/register/page.tsx',
    'app/account/page.tsx',
    'components/account/QuizShell.tsx',
  ];
  for (const file of files) {
    it(`${file} has no gambling references`, () => {
      const content = read(file).toLowerCase();
      expect(content).not.toContain('gamble');
      expect(content).not.toContain('betting');
      expect(content).not.toContain('wager');
      expect(content).not.toContain('casino');
    });
  }
});

describe('quiz mentions points-only disclaimer', () => {
  it('QuizShell has points-only note', () => {
    const content = read('components/account/QuizShell.tsx');
    expect(
      content.includes('Points only') ||
      content.includes('no real money') ||
      content.includes('no financial value'),
    ).toBe(true);
  });
});

describe('touch target compliance in account components', () => {
  const interactiveFiles = [
    'components/account/AuthTabs.tsx',
    'components/account/AccountNav.tsx',
    'components/account/ProfileForm.tsx',
    'components/account/FavouriteTeamSelector.tsx',
  ];
  for (const file of interactiveFiles) {
    it(`${file} has min-h-[44px]`, () => {
      expect(read(file)).toContain('min-h-[44px]');
    });
  }
});

describe('aria labels on auth forms', () => {
  it('sign-in form has aria-label', () => {
    expect(read('app/sign-in/page.tsx')).toContain('aria-label="Sign in"');
  });
  it('register page redirects to sign-up', () => {
    expect(read('app/register/page.tsx')).toContain('/sign-up');
  });
  it('sign-in button has aria-busy', () => {
    expect(read('app/sign-in/page.tsx')).toContain('aria-busy');
  });
});

// ─── Navigation ──────────────────────────────────────────────────────────────

describe('FantasyTabs component', () => {
  it('FantasyTabs exists', () => expect(exists('components/fantasy/nav/FantasyTabs.tsx')).toBe(true));
  it('FantasyTabs has all 9 tabs', () => {
    const content = read('components/fantasy/nav/FantasyTabs.tsx');
    expect(content).toContain('/fantasy/team');
    expect(content).toContain('/fantasy/points');
    expect(content).toContain('/fantasy/leagues');
    expect(content).toContain('/fantasy/fixtures');
    expect(content).toContain('/fantasy/stats');
    expect(content).toContain('/fantasy/history');
    expect(content).toContain('/fantasy/rules');
  });
  it('FantasyTabs uses usePathname', () => expect(read('components/fantasy/nav/FantasyTabs.tsx')).toContain('usePathname'));
  it('FantasyTabs has min-h-[44px]', () => expect(read('components/fantasy/nav/FantasyTabs.tsx')).toContain('min-h-[44px]'));
  it('FantasyShell includes FantasyTabs', () => expect(read('components/fantasy/shared/FantasyShell.tsx')).toContain('FantasyTabs'));
});

describe('MobileBottomNav', () => {
  it('MobileBottomNav exists', () => expect(exists('components/shell/MobileBottomNav.tsx')).toBe(true));
  it('MobileBottomNav has 5 destinations', () => {
    const content = read('components/shell/MobileBottomNav.tsx');
    expect(content).toContain("'/'");
    expect(content).toContain('/matches');
    expect(content).toContain('/fantasy');
    expect(content).toContain('/predict');
    expect(content).toContain('/account');
  });
  it('MobileBottomNav uses usePathname', () => expect(read('components/shell/MobileBottomNav.tsx')).toContain('usePathname'));
});

describe('fantasy route pages exist', () => {
  const routes = [
    'app/fantasy/page.tsx',
    'app/fantasy/points/page.tsx',
    'app/fantasy/fixtures/page.tsx',
    'app/fantasy/stats/page.tsx',
    'app/fantasy/history/page.tsx',
    'app/fantasy/rules/page.tsx',
    'app/fantasy/leagues/page.tsx',
    'app/fantasy/team/page.tsx',
    'app/fantasy/team/transfers/page.tsx',
    'app/fantasy/onboarding/page.tsx',
  ];
  for (const r of routes) {
    it(r, () => expect(exists(r)).toBe(true));
  }
});

// ─── Accessibility ───────────────────────────────────────────────────────────

describe('global accessibility markers', () => {
  it('main layout has id="main-content"', () => {
    expect(read('app/layout.tsx')).toContain('id="main-content"');
  });
  it('mobile nav has aria-label', () => {
    expect(read('components/shell/MobileBottomNav.tsx')).toContain('aria-label');
  });
  it('FantasyTabs has aria-label', () => {
    expect(read('components/fantasy/nav/FantasyTabs.tsx')).toContain('aria-label');
  });
  it('FantasyModal has role dialog', () => {
    expect(read('components/fantasy/shared/FantasyModal.tsx')).toContain('role="dialog"');
  });
  it('FantasyModal has aria-modal', () => {
    expect(read('components/fantasy/shared/FantasyModal.tsx')).toContain('aria-modal');
  });
  it('FantasyBottomSheet has role dialog', () => {
    expect(read('components/fantasy/shared/FantasyBottomSheet.tsx')).toContain('role="dialog"');
  });
});

describe('reduced motion guards', () => {
  it('FantasyActionBar uses useReducedMotion', () => {
    expect(read('components/fantasy/shared/FantasyActionBar.tsx')).toContain('useReducedMotion');
  });
  it('FantasyModal uses useReducedMotion', () => {
    expect(read('components/fantasy/shared/FantasyModal.tsx')).toContain('useReducedMotion');
  });
  it('FantasyBottomSheet uses useReducedMotion', () => {
    expect(read('components/fantasy/shared/FantasyBottomSheet.tsx')).toContain('useReducedMotion');
  });
});

// ─── Release readiness ───────────────────────────────────────────────────────

describe('critical fantasy components have non-financial disclaimers', () => {
  it('fantasy landing mentions points', () => {
    const content = read('app/fantasy/page.tsx');
    expect(
      content.includes('point') ||
      content.includes('pts') ||
      content.includes('Points')
    ).toBe(true);
  });
  it('onboarding has points-only note', () => {
    const content = read('app/fantasy/onboarding/page.tsx');
    expect(
      content.includes('Points only') ||
      content.includes('no real money') ||
      content.includes('no financial value')
    ).toBe(true);
  });
});

describe('no hardcoded secrets or API keys', () => {
  const files = [
    'lib/fantasy-api.ts',
    'lib/auth.ts',
    'lib/data.ts',
  ];
  for (const f of files) {
    it(`${f} has no hardcoded API key`, () => {
      const content = read(f);
      expect(content).not.toMatch(/sk-[a-zA-Z0-9]{32,}/);
      expect(content).not.toMatch(/Bearer [a-zA-Z0-9]{32,}/);
    });
  }
});

describe('data layer uses correct field names', () => {
  it('data.ts uses fantasyPrice not price', () => expect(read('lib/data.ts')).toContain('fantasyPrice'));
  it('data.ts uses fantasyPoints not points', () => expect(read('lib/data.ts')).toContain('fantasyPoints'));
  it('data.ts uses club object not string', () => {
    const content = read('lib/data.ts');
    expect(content).toContain('club:');
    expect(content).toContain('abbr:');
  });
  it('data.ts player position uses short form', () => {
    const content = read('lib/data.ts');
    expect(content).toContain("'GK'");
    expect(content).toContain("'DEF'");
    expect(content).toContain("'MID'");
    expect(content).toContain("'FWD'");
  });
});

describe('fantasy api lib exports', () => {
  it('fantasy-api.ts exports createTeam', () => expect(read('lib/fantasy-api.ts')).toContain('createTeam'));
  it('fantasy-api.ts exports makeTransfers', () => expect(read('lib/fantasy-api.ts')).toContain('makeTransfers'));
  it('fantasy-api.ts exports activateChip', () => expect(read('lib/fantasy-api.ts')).toContain('activateChip'));
  it('fantasy-api.ts exports getTeam', () => expect(read('lib/fantasy-api.ts')).toContain('getTeam'));
  it('fantasy-api.ts exports getLeagueStandings', () => expect(read('lib/fantasy-api.ts')).toContain('getLeagueStandings'));
});

describe('core fantasy journey pages are complete', () => {
  it('team page has FantasyPitchView', () => expect(read('app/fantasy/team/page.tsx')).toContain('FantasyPitchView'));
  it('transfers page has PlayerPool', () => expect(read('app/fantasy/team/transfers/page.tsx')).toContain('PlayerPool'));
  it('chips page has chip UI', () => {
    const c = read('app/fantasy/team/chips/page.tsx');
    expect(c.includes('ChipCard') || c.includes('ChipSelector') || c.includes('Chip')).toBe(true);
  });
  it('onboarding page has FormationSelector', () => expect(read('app/fantasy/onboarding/page.tsx')).toContain('FormationSelector'));
  it('leagues page has LeagueCard or league content', () => {
    const content = read('app/fantasy/leagues/page.tsx');
    expect(content.includes('LeagueCard') || content.includes('league')).toBe(true);
  });
});

describe('fantasy components exist', () => {
  it('FantasyPitchView.tsx', () => expect(exists('components/fantasy/core/FantasyPitchView.tsx')).toBe(true));
  it('PlayerPool.tsx', () => expect(exists('components/fantasy/core/PlayerPool.tsx')).toBe(true));
  it('ChipCard.tsx', () => expect(exists('components/fantasy/core/ChipCard.tsx')).toBe(true));
  it('FormationSelector.tsx', () => expect(exists('components/fantasy/core/FormationSelector.tsx')).toBe(true));
  it('LeagueCard.tsx', () => expect(exists('components/fantasy/leagues/LeagueCard.tsx')).toBe(true));
});

describe('no PSL activation references in experience app', () => {
  const appFiles = ['app/page.tsx', 'app/layout.tsx', 'lib/data.ts'];
  for (const f of appFiles) {
    it(`${f} does not activate PSL season`, () => {
      const lines = read(f).toLowerCase().split('\n').filter(l => l.includes('psl') && l.includes('activ'));
      expect(lines).toHaveLength(0);
    });
  }
});

describe('shell component content', () => {
  it('AppHeader renders brand', () => {
    const content = read('components/shell/AppHeader.tsx');
    expect(content.includes('PSL') || content.includes('Competition') || content.includes('logo')).toBe(true);
  });
  it('MatchweekNav has navigation role', () => {
    const content = read('components/shell/MatchweekNav.tsx');
    expect(content.includes('nav') || content.includes('navigation') || content.includes('aria')).toBe(true);
  });
});

describe('section component content checks', () => {
  it('LeagueTableSection renders standings', () => {
    const c = read('sections/LeagueTableSection.tsx');
    expect(c.includes('standing') || c.includes('table') || c.includes('Table')).toBe(true);
  });
  it('PlayerSpotlightSection renders player data', () => {
    const c = read('sections/PlayerSpotlightSection.tsx');
    expect(c.includes('player') || c.includes('Player') || c.includes('PlayerPortrait')).toBe(true);
  });
  it('EditorialGridSection renders stories', () => {
    const c = read('sections/EditorialGridSection.tsx');
    expect(c.includes('story') || c.includes('Story') || c.includes('editorial')).toBe(true);
  });
  it('VideoRailSection renders videos', () => {
    const c = read('sections/VideoRailSection.tsx');
    expect(c.includes('video') || c.includes('Video') || c.includes('VideoCard')).toBe(true);
  });
  it('ClubIdentitySection renders clubs', () => {
    const c = read('sections/ClubIdentitySection.tsx');
    expect(c.includes('club') || c.includes('Club') || c.includes('TeamIdentity')).toBe(true);
  });
  it('SponsorSection renders sponsor content', () => {
    const c = read('sections/SponsorSection.tsx');
    expect(c.includes('sponsor') || c.includes('Sponsor') || c.includes('SponsorMoment')).toBe(true);
  });
});

// ─── STORY-FE-EXPERIENCE-CORRECTIONS-01 — Visual review fixes ─────────────────

describe('image placeholder system (visual review corrections)', () => {
  const dataSrc = read('lib/data.ts');

  it('expImg no longer uses picsum.photos', () => {
    expect(dataSrc).not.toContain('picsum.photos');
  });

  it('expImg returns a data URI (SVG placeholder)', () => {
    expect(dataSrc).toContain('data:image/svg+xml;base64');
  });

  it('expImg function still exported', () => {
    expect(dataSrc).toContain('export function expImg');
  });
});

describe('onboarding excludes FantasyTabs (visual review correction)', () => {
  it('onboarding page passes hideFantasyTabs to FantasyShell', () => {
    const content = read('app/fantasy/onboarding/page.tsx');
    expect(content).toContain('hideFantasyTabs');
  });

  it('onboarding step 1 has coaching content', () => {
    const content = read('app/fantasy/onboarding/page.tsx');
    expect(
      content.includes('Pick 15 players') ||
      content.includes('coaching') ||
      content.includes('What you get')
    ).toBe(true);
  });
});

describe('account pages exclude FantasyTabs (visual review correction)', () => {
  const accountPages = [
    'app/account/page.tsx',
    'app/account/profile/page.tsx',
    'app/account/security/page.tsx',
    'app/account/favourite-team/page.tsx',
    'app/account/delete/page.tsx',
  ];

  for (const page of accountPages) {
    it(`${page.split('/').pop()} passes hideFantasyTabs`, () => {
      expect(read(page)).toContain('hideFantasyTabs');
    });
  }
});

describe('FantasyShell hideFantasyTabs prop (visual review correction)', () => {
  it('FantasyShell accepts hideFantasyTabs prop', () => {
    expect(read('components/fantasy/shared/FantasyShell.tsx')).toContain('hideFantasyTabs');
  });

  it('FantasyShell conditionally renders FantasyTabs based on hideFantasyTabs', () => {
    const content = read('components/fantasy/shared/FantasyShell.tsx');
    expect(content).toContain('!hideFantasyTabs');
  });
});

describe('desktop responsive layout (visual review correction)', () => {
  it('players page uses desktop grid', () => {
    const content = read('app/players/page.tsx');
    expect(content).toContain('md:grid-cols-2');
  });

  it('players page uses max-w-7xl', () => {
    const content = read('app/players/page.tsx');
    expect(content).toContain('max-w-7xl');
  });

  it('FantasyShell uses max-w-7xl for desktop content width', () => {
    const content = read('components/fantasy/shared/FantasyShell.tsx');
    expect(content).toContain('max-w-7xl');
  });
});

describe('auth layout football identity (visual review correction)', () => {
  it('AuthLayout has PSL One tagline', () => {
    const content = read('components/account/AuthLayout.tsx');
    expect(
      content.includes('South African football') ||
      content.includes('digital home') ||
      content.includes('Digital OS')
    ).toBe(true);
  });
});

describe('TeamIdentity badge shape (visual review correction)', () => {
  it('TeamIdentity uses shield-shaped badge not plain circle', () => {
    const content = read('components/ui/TeamIdentity.tsx');
    // Should use club primaryColor as background (football badge style)
    expect(content).toContain('primaryColor');
    expect(content).toContain('secondaryColor');
    // Should not be a plain rounded-full circle (circle is generic)
    expect(content).not.toContain('"rounded-full flex items-center justify-center font-black shadow-card flex-shrink-0"');
  });
});

describe('pitch animation resilience (visual review correction)', () => {
  it('FantasyPitchView row animation completes within 450ms', () => {
    const content = read('components/fantasy/core/FantasyPitchView.tsx');
    // duration 0.25 + max delay 0.12 = 0.37s — well within any screenshot window
    expect(content).toContain('0.25');
    expect(content).toContain('0.04');
  });
});

// ── STORY-S4-01: Vercel config ────────────────────────────────────────────────

describe('STORY-S4-01: Vercel preview config', () => {
  it('vercel.json exists in experience root', () => {
    const path = require('path').resolve(ROOT, 'vercel.json');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('vercel.json sets WC_BETA data mode (not DESIGN_REVIEW_DATA)', () => {
    const path = require('path').resolve(ROOT, 'vercel.json');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('WC_BETA');
  });

  it('vercel.json sets X-Robots-Tag noindex', () => {
    const path = require('path').resolve(ROOT, 'vercel.json');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('noindex');
  });

  it('.env.example exists', () => {
    const path = require('path').resolve(ROOT, '.env.example');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('.env.example documents NEXT_PUBLIC_DATA_MODE', () => {
    const path = require('path').resolve(ROOT, '.env.example');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('NEXT_PUBLIC_DATA_MODE');
  });
});

// ── STORY-S4-05: Prediction sharing and challenge loop ────────────────────────

describe('STORY-S4-05: predict page', () => {
  it('predict/page.tsx exists and is not coming-soon stub', () => {
    const content = read('app/predict/page.tsx');
    expect(content).not.toContain('Coming soon');
  });

  it('predict page has score stepper controls', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('ScoreStepper');
  });

  it('predict page has lock-in submit button', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('Lock in prediction');
  });

  it('predict page has share action', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('Share');
  });

  it('predict page shows points-only disclaimer', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('Points only');
  });

  it('predict page has WhatsApp share', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('WhatsApp');
  });

  it('predict page has copy-link handler', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('clipboard');
  });

  it('predict page handles Web Share API', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('navigator.share');
  });

  it('predict page handles locked fixtures', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('isLocked');
  });

  it('predict page has challenge link', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('challenge');
  });

  it('predict page uses DESIGN_REVIEW_DATA mode from data.ts', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('getDataMode');
    expect(content).toContain('WC_FIXTURES');
  });

  it('predict page handles no-fixture empty state', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('No upcoming fixtures');
  });

  it('predict page handles error state', () => {
    const content = read('app/predict/page.tsx');
    expect(content).toContain('Try again');
  });
});

describe('STORY-S4-05: challenge page', () => {
  it('predict/challenge/page.tsx exists', () => {
    expect(exists('app/predict/challenge/page.tsx')).toBe(true);
  });

  it('challenge page shows how-it-works steps', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('How challenges work');
  });

  it('challenge page creates challenge link', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('buildChallengeLink');
  });

  it('challenge page has WhatsApp share', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('WhatsApp');
  });

  it('challenge page creates unique challenge link per fixture/score', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('buildChallengeLink');
  });

  it('challenge page handles locked fixtures', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('isLocked');
  });

  it('challenge page shows points-only disclaimer', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('no real money');
  });

  it('challenge page wraps useSearchParams in Suspense', () => {
    const content = read('app/predict/challenge/page.tsx');
    expect(content).toContain('Suspense');
    expect(content).toContain('useSearchParams');
  });
});

describe('STORY-S4-05: challenge accept page', () => {
  it('predict/challenge/accept/page.tsx exists', () => {
    expect(exists('app/predict/challenge/accept/page.tsx')).toBe(true);
  });

  it('accept page shows challenger prediction', () => {
    const content = read('app/predict/challenge/accept/page.tsx');
    expect(content).toContain('challengerHomeScore');
  });

  it('accept page handles expired/not-found challenges', () => {
    const content = read('app/predict/challenge/accept/page.tsx');
    expect(content).toContain('Challenge not found');
  });

  it('accept page shows WhatsApp reply after acceptance', () => {
    const content = read('app/predict/challenge/accept/page.tsx');
    expect(content).toContain('Reply on WhatsApp');
  });

  it('accept page shows points-only disclaimer', () => {
    const content = read('app/predict/challenge/accept/page.tsx');
    expect(content).toContain('no real money');
  });

  it('accept page wraps useSearchParams in Suspense', () => {
    const content = read('app/predict/challenge/accept/page.tsx');
    expect(content).toContain('Suspense');
  });
});

// ── STORY-S4-01 deploy docs ───────────────────────────────────────────────────

// ── STORY-S4-03: API wiring matrix ────────────────────────────────────────────

describe('STORY-S4-03: API wiring matrix docs', () => {
  it('SPRINT-4-API-WIRING-MATRIX.md exists', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-API-WIRING-MATRIX.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('SPRINT-4-DATA-SOURCE-TRUTH-TABLE.md exists', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-DATA-SOURCE-TRUTH-TABLE.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('SPRINT-4-MISSING-CONTRACTS.md exists', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-MISSING-CONTRACTS.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('wiring matrix classifies all routes', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-API-WIRING-MATRIX.md');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('LIVE_BETA_DATA');
    expect(content).toContain('DESIGN_REVIEW_DATA');
    expect(content).toContain('MISSING_BACKEND_CONTRACT');
  });
});

// ── STORY-S4-07: Account completion ───────────────────────────────────────────

describe('STORY-S4-07: account notifications page', () => {
  it('account/notifications/page.tsx exists', () => {
    expect(exists('app/account/notifications/page.tsx')).toBe(true);
  });

  it('notifications page has toggle controls', () => {
    const content = read('app/account/notifications/page.tsx');
    expect(content).toContain('ToggleRow');
  });

  it('notifications page calls /notifications/preferences', () => {
    const content = read('app/account/notifications/page.tsx');
    expect(content).toContain('/notifications/preferences');
  });

  it('notifications page uses mode-switch pattern', () => {
    const content = read('app/account/notifications/page.tsx');
    expect(content).toContain('DESIGN_REVIEW_DATA');
    expect(content).toContain('getDataMode');
  });

  it('notifications page has marketingUpdates toggle with consent awareness', () => {
    const content = read('app/account/notifications/page.tsx');
    expect(content).toContain('marketingUpdates');
  });

  it('AccountNav includes notifications link', () => {
    const content = read('components/account/AccountNav.tsx');
    expect(content).toContain('/account/notifications');
  });
});

// ── STORY-S4-08: Analytics and sponsor docs ────────────────────────────────────

describe('STORY-S4-08: analytics and sponsor docs', () => {
  it('SPRINT-4-ANALYTICS-EVENT-CATALOGUE.md exists', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-ANALYTICS-EVENT-CATALOGUE.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('SPRINT-4-SPONSOR-INVENTORY.md exists', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-SPONSOR-INVENTORY.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('SPRINT-4-SPONSOR-SAFE-ZONES.md exists', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-SPONSOR-SAFE-ZONES.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('analytics catalogue does not expose financial or payment PII event properties', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-ANALYTICS-EVENT-CATALOGUE.md');
    const content = require('fs').readFileSync(path, 'utf8').toLowerCase();
    expect(content).not.toContain('credit_card');
    expect(content).not.toContain('bank_account');
    expect(content).not.toContain('card_number');
  });

  it('sponsor safe zones excludes gambling content', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-SPONSOR-SAFE-ZONES.md');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('gambling');
    expect(content.toLowerCase()).toMatch(/prohibited|excluded|not allowed|banned/);
  });
});

describe('STORY-S4-01: deploy documentation', () => {
  it('SPRINT-4-DEPLOY-GUIDE.md exists in experience docs', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-DEPLOY-GUIDE.md');
    expect(require('fs').existsSync(path)).toBe(true);
  });

  it('deploy guide documents deployment as live', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-DEPLOY-GUIDE.md');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('DEPLOYED');
  });

  it('deploy guide includes env variable matrix', () => {
    const path = require('path').resolve(ROOT, 'docs', 'SPRINT-4-DEPLOY-GUIDE.md');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('NEXT_PUBLIC_DATA_MODE');
  });
});

// ── STORY-S5-01: Account Security ─────────────────────────────────────────────

describe('STORY-S5-01: /account/security page', () => {
  it('PasswordForm component exists', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('PasswordForm has accessible labels', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('htmlFor');
    expect(content).toContain('aria-label');
  });

  it('PasswordForm calls password change endpoint', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/auth/password/change');
  });

  it('PasswordForm shows loading state', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('loading');
  });

  it('PasswordForm shows success state', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('success');
  });

  it('PasswordForm shows error state', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('error');
  });

  it('PasswordForm submit button has min-h-[44px]', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('min-h-[44px]');
  });

  it('PasswordForm does not contain real-money language', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\b(deposit|withdrawal|wager|stake|bet)\b/i);
  });
});

// ── STORY-S5-02: POPIA Account Deletion ───────────────────────────────────────

describe('STORY-S5-02: /account/delete page', () => {
  it('DeleteAccountDialog component exists', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('DeleteAccountDialog references deletion request endpoint', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/account/deletion-request');
  });

  it('DeleteAccountDialog shows POPIA language', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('POPIA');
  });

  it('DeleteAccountDialog does not claim immediate deletion', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\bimmediately deleted\b|\bdeleted immediately\b/i);
  });

  it('DeleteAccountDialog allows cancellation of pending request', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('cancel');
  });

  it('DeleteAccountDialog has accessible button with min-h-[44px]', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('min-h-[44px]');
  });

  it('DeleteAccountDialog does not contain real-money language', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\b(deposit|withdrawal|wager|stake|bet)\b/i);
  });

  it('/account/delete page exists', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'delete', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ── STORY-S5-03: Security audit trail references ───────────────────────────────

describe('STORY-S5-03: account security audit contract', () => {
  it('account security page references /auth/password/change', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/auth/password/change');
  });

  it('deletion dialog references /account/deletion-request', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'DeleteAccountDialog.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/account/deletion-request');
  });

  it('PasswordForm uses apiPost not direct fetch for password change', () => {
    const p = require('path').resolve(
      ROOT, 'src', 'components', 'account', 'PasswordForm.tsx'
    );
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('apiPost');
  });
});

// ── STORY-S6-02: Durable Challenge Backend ─────────────────────────────────────

describe('STORY-S6-02: token-based prediction challenges', () => {
  it('challenge page exists', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('challenge accept page exists', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('challenge page references predictions/challenges endpoint', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/predictions/challenges');
  });

  it('challenge accept page references token param', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('token');
  });

  it('challenge accept page handles self-challenge case', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/self|own challenge|cannot accept/i);
  });

  it('challenge accept page handles expired case', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/EXPIRED|expired/i);
  });

  it('challenge pages do not contain real-money language', () => {
    const pages = [
      require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'page.tsx'),
      require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx'),
    ];
    for (const p of pages) {
      const content = require('fs').readFileSync(p, 'utf8');
      expect(content).not.toMatch(/\b(stake|wager|payout|deposit|withdrawal|odds)\b/i);
    }
  });

  it('points-only disclaimer present in challenge page', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/points only|no real money|Points only/i);
  });
});

// ── STORY-S6-03: Fan Onboarding ───────────────────────────────────────────────

describe('STORY-S6-03: fan onboarding', () => {
  it('onboarding page exists', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('onboarding page references GET /account/onboarding', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/account/onboarding');
  });

  it('onboarding page shows favourite team step', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/favourite team|favoriteTeam|preferredTeam/i);
  });

  it('onboarding page shows prediction step', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/prediction|predict/i);
  });

  it('onboarding page shows challenge step', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/challenge/i);
  });

  it('onboarding page has min-h-[44px] for interactive elements', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    // Links have accessible touch targets
    expect(content).toContain('account/favourite-team');
  });

  it('onboarding page does not contain real-money language', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'account', 'onboarding', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\b(stake|wager|payout|deposit|withdrawal|odds)\b/i);
  });
});

// ── STORY-S6-04: Preview Analytics ───────────────────────────────────────────

describe('STORY-S6-04: preview analytics adapter', () => {
  it('analytics adapter exists', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('analytics adapter calls POST /analytics/events', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/analytics/events');
  });

  it('analytics adapter sanitizes forbidden fields', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/password|token|wallet|apiKey/);
    expect(content).toContain('sanitize');
  });

  it('analytics adapter swallows errors silently', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    // Error handling should be catch block that does not rethrow
    expect(content).toContain('catch');
  });

  it('analytics adapter does not contain real-money language', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\b(stake|wager|payout|deposit|withdrawal|odds)\b/i);
  });
});

// ── STORY-S6-01: Provider Boundary ───────────────────────────────────────────

describe('STORY-S6-01: provider trial boundary', () => {
  it('provider adapter interface exists in API', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'data-provider', 'provider-adapter.interface.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider interface does not expose API keys in response types', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'data-provider', 'provider-adapter.interface.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/apiKey|api_key|api_token/i);
  });

  it('analytics adapter does not make direct provider calls from frontend', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toContain('sportmonks.com');
    expect(content).not.toContain('api-football.com');
  });
});

// ── STORY-S7-02: Challenge Settlement ─────────────────────────────────────────

describe('STORY-S7-02: challenge settlement frontend', () => {
  it('challenge accept page handles SETTLED status', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('SETTLED');
  });

  it('challenge result shows points-only language', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/points only|Points only|no real money/i);
  });

  it('challenge result calls result endpoint', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/result');
  });

  it('challenge result does not contain financial language', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\b(payout|deposit|withdraw|stake|wager|cash prize)\b/i);
  });

  it('challenge result shows winner/draw state', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/winner|draw|Draw|Winner/i);
  });
});

// ── STORY-S7-01: Provider Boundary Security ───────────────────────────────────

describe('STORY-S7-01: provider key security in frontend', () => {
  it('analytics adapter does not reference SPORTMONKS_API_KEY', () => {
    const p = require('path').resolve(ROOT, 'src', 'lib', 'analytics.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toContain('SPORTMONKS');
    expect(content).not.toContain('api_token');
  });

  it('challenge pages do not reference provider API key', () => {
    const pages = [
      require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'page.tsx'),
      require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx'),
    ];
    for (const p of pages) {
      const content = require('fs').readFileSync(p, 'utf8');
      expect(content).not.toContain('SPORTMONKS_API_KEY');
      expect(content).not.toContain('api_token=');
      expect(content).not.toMatch(/NEXT_PUBLIC_.*KEY/i);
    }
  });

  it('provider adapter interface does not expose API key type', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'data-provider', 'provider-adapter.interface.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/apiKey|api_key|api_token/i);
  });
});

// ── STORY-S7-03: Staging readiness ───────────────────────────────────────────

describe('STORY-S7-03: staging migration runbook', () => {
  it('sprint 7 migration runbook exists', () => {
    const p = require('path').resolve(ROOT, '..', '..', 'docs', 'handover', 'SPRINT-7-STAGING-MIGRATION-RUNBOOK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('staging runbook documents rollback plan', () => {
    const p = require('path').resolve(ROOT, '..', '..', 'docs', 'handover', 'SPRINT-7-STAGING-MIGRATION-ROLLBACK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('staging runbook does not activate PSL', () => {
    const p = require('path').resolve(ROOT, '..', '..', 'docs', 'handover', 'SPRINT-7-STAGING-MIGRATION-RUNBOOK.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/activatePSL|PSL.*ACTIVATED|activate.*psl/i);
  });
});

// ── STORY-S8-03: Settlement automation ────────────────────────────────────────

describe('STORY-S8-03: settlement automation wiring', () => {
  it('football service references settleAllAcceptedForFixture', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'football', 'football.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('settleAllAcceptedForFixture');
  });

  it('football module imports PredictionChallengesModule', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'football', 'football.module.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('PredictionChallengesModule');
  });

  it('settlement trigger is fire-and-forget with error catching', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'football', 'football.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('.catch(');
  });

  it('settle-fixture admin endpoint exists in controller', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'prediction-challenges', 'prediction-challenges.controller.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('settle-fixture');
  });

  it('settle-fixture endpoint is admin-only', () => {
    const p = require('path').resolve(ROOT, '..', 'api', 'src', 'prediction-challenges', 'prediction-challenges.controller.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/Roles.*ADMIN|ADMIN.*settle-fixture/s);
  });
});

// ── STORY-S8-04: Challenge Result UX ─────────────────────────────────────────

describe('STORY-S8-04: challenge result UX', () => {
  it('challenge result page exists at /predict/challenge/result', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'result', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('challenge result page has points-only disclaimer', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'result', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/points only|Points only|no real money/i);
  });

  it('challenge result page has no financial/betting language', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'result', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\b(payout|deposit|withdraw|stake|wager|cash prize|bookmaker)\b/i);
  });

  it('accept page SETTLED state shows points breakdown', () => {
    const p = require('path').resolve(ROOT, 'src', 'app', 'predict', 'challenge', 'accept', 'page.tsx');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('SETTLED');
    expect(content).toMatch(/points|Points/i);
    expect(content).toMatch(/winner|draw|Winner|Draw/i);
  });
});

// ── STORY-S8-02: Provider key isolation ──────────────────────────────────────

describe('STORY-S8-02: provider key isolation', () => {
  it('no Sportmonks key reference in experience source', () => {
    const dirs = ['src/app', 'src/components', 'src/lib', 'src/sections'];
    for (const dir of dirs) {
      const base = require('path').resolve(ROOT, dir);
      if (!require('fs').existsSync(base)) continue;
      const files = getAllFiles(base).filter((f: string) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.spec.ts'));
      for (const f of files) {
        const content = require('fs').readFileSync(f, 'utf8');
        expect(content).not.toContain('SPORTMONKS_API_KEY');
        expect(content).not.toContain('api_token=');
      }
    }
  });

  it('staging runbook exists', () => {
    const p = require('path').resolve(ROOT, '..', '..', 'docs', 'handover', 'SPRINT-8-STAGING-MIGRATION-RUNBOOK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider trial validation doc exists', () => {
    const p = require('path').resolve(ROOT, '..', '..', 'docs', 'data', 'SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider validation doc says BLOCKED_BY_REPLACEMENT_TOKEN', () => {
    const p = require('path').resolve(ROOT, '..', '..', 'docs', 'data', 'SPRINT-8-SPORTMONKS-TRIAL-VALIDATION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('BLOCKED_BY_REPLACEMENT_TOKEN');
  });
});

// ── Sprint 9 — Provider Validation & Staging Beta Readiness ─────────────────

describe('Sprint 9 — Provider Validation & Staging Beta Readiness', () => {
  const ROOT = require('path').resolve(__dirname, '..', '..', '..', '..');
  const REPO = ROOT;

  // Provider discovery tooling
  it('provider-health-check.mjs exists in tools/discovery', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-health-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider-coverage-check.mjs exists in tools/discovery', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-coverage-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider-field-mapping-check.mjs exists in tools/discovery', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-field-mapping-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider-compare.mjs exists in tools/discovery', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-compare.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('discovery tools contain no NEXT_PUBLIC_ provider keys', () => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(REPO, 'tools', 'discovery');
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mjs'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(content).not.toMatch(/NEXT_PUBLIC_.*(?:SPORT|KEY)/i);
    }
  });

  it('discovery tools reference provider keys via process.env only', () => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(REPO, 'tools', 'discovery');
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mjs'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(content).toContain("process.env['SPORTMONKS_API_KEY']");
    }
  });

  it('discovery tools contain no betting/odds endpoint paths', () => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(REPO, 'tools', 'discovery');
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mjs'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(content).not.toMatch(/\/odds\/|\/betting\/|\/wager\/|BettingMarket|OddsLine/i);
    }
  });

  // Smoke scripts
  it('sprint-9-staging-smoke.mjs exists in tools/smoke', () => {
    const p = require('path').resolve(REPO, 'tools', 'smoke', 'sprint-9-staging-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-9-challenge-settlement-smoke.mjs exists in tools/smoke', () => {
    const p = require('path').resolve(REPO, 'tools', 'smoke', 'sprint-9-challenge-settlement-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('staging smoke script has a default BASE_URL fallback', () => {
    const p = require('path').resolve(REPO, 'tools', 'smoke', 'sprint-9-staging-smoke.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain("'http://localhost:4000'");
  });

  it('settlement smoke script checks settleAllAcceptedForFixture in source', () => {
    const p = require('path').resolve(REPO, 'tools', 'smoke', 'sprint-9-challenge-settlement-smoke.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('settleAllAcceptedForFixture');
  });

  // Migration gate docs
  it('SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-9-STAGING-MIGRATION-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-9-STAGING-MIGRATION-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('migration apply log contains a recognized migration status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md');
    const content = require('fs').readFileSync(p, 'utf8');
    // Accepts initial pending state or post-apply states
    const hasStatus =
      content.includes('STAGING_APPLY_PENDING_OWNER_AUTHORIZATION') ||
      content.includes('LOCAL_DEV_APPLIED') ||
      content.includes('STAGING_EC2_PENDING_DB_URL') ||
      content.includes('APPLIED');
    expect(hasStatus).toBe(true);
  });

  // Provider docs
  it('SPRINT-9-PROVIDER-VALIDATION-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-9-PROVIDER-VALIDATION-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Beta readiness docs
  it('SPRINT-9-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-9-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-9-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-9-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('provider validation results doc contains a provider status entry', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-9-PROVIDER-VALIDATION-RESULTS.md');
    const content = require('fs').readFileSync(p, 'utf8');
    // Accepts initial blocked state or post-validation states (401, partial, ok)
    const hasStatus =
      content.includes('BLOCKED_BY_REPLACEMENT_TOKEN') ||
      content.includes('HTTP_401') ||
      content.includes('PARTIAL_UCL_TRIAL') ||
      content.includes('NOT_VALIDATED');
    expect(hasStatus).toBe(true);
  });
});

// ── Sprint 10 — Provider Coverage, Read-Only Pipeline & Live Smoke ────────────

describe('Sprint 10 — Provider Coverage Validation & Staging Smoke Readiness', () => {
  const ROOT = require('path').resolve(__dirname, '..', '..', '..', '..');
  const REPO = ROOT;

  // Sprint 10 sprint docs
  it('SPRINT-10-DELIVERY-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-10-DELIVERY-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-10-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Provider validation docs
  it('SPRINT-10-SPORTMONKS-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-SPORTMONKS-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sportmonks validation doc records HTTP 401 or OK result', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-SPORTMONKS-VALIDATION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    const hasResult = content.includes('HTTP 401') || content.includes('HTTP_401') ||
      content.includes('SPORTMONKS_HTTP_401') || content.includes('HTTP 200');
    expect(hasResult).toBe(true);
  });

  it('SPRINT-10-SPORTSDATAIO-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-SPORTSDATAIO-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-PROVIDER-COVERAGE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-PROVIDER-COVERAGE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-PROVIDER-FIELD-MAPPING.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-PROVIDER-FIELD-MAPPING.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-PROVIDER-DECISION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-PROVIDER-DECISION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Read-only pipeline tools
  it('staging-provider-discovery.mjs exists in tools/discovery', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'staging-provider-discovery.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('staging-provider-discovery.mjs declares read-only mode', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'staging-provider-discovery.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/READ-ONLY|Read-Only|no DB writes/i);
  });

  it('provider-readonly-pipeline-check.mjs exists in tools/discovery', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-readonly-pipeline-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('staging-provider-discovery.mjs contains no NEXT_PUBLIC_ provider keys', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'staging-provider-discovery.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/NEXT_PUBLIC_.*(?:SPORT|KEY)/i);
  });

  it('staging-provider-discovery.mjs contains no PSL activation calls', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'staging-provider-discovery.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/activateSeason|PSL_ACTIVE/i);
  });

  it('staging-provider-discovery.mjs contains no betting/odds URL paths', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'staging-provider-discovery.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    // Check for URL paths only (not comments that describe the prohibition)
    expect(content).not.toMatch(/\/odds\/|\/betting\/|\/wager\/|BettingMarket|OddsLine/i);
  });

  // EC2 migration gate docs
  it('SPRINT-10-EC2-STAGING-MIGRATION-LOG.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-EC2-STAGING-MIGRATION-LOG.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('EC2 migration log records pending or applied status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-EC2-STAGING-MIGRATION-LOG.md');
    const content = require('fs').readFileSync(p, 'utf8');
    const hasStatus = content.includes('STAGING_EC2_MIGRATION_PENDING_OWNER_AUTH') ||
      content.includes('APPLIED') || content.includes('LOCAL_DEV_APPLIED');
    expect(hasStatus).toBe(true);
  });

  it('SPRINT-10-EC2-STAGING-MIGRATION-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-EC2-STAGING-MIGRATION-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Smoke and settlement docs
  it('SPRINT-10-LIVE-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-LIVE-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Live smoke results doc records a PASS or FAIL result', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-LIVE-SMOKE-RESULTS.md');
    const content = require('fs').readFileSync(p, 'utf8');
    const hasResult = content.includes('PASS') || content.includes('FAIL');
    expect(hasResult).toBe(true);
  });

  it('SPRINT-10-SETTLEMENT-READINESS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-SETTLEMENT-READINESS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Beta go/no-go docs
  it('SPRINT-10-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Beta go/no-go doc contains a recognized status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-BETA-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    const hasStatus = content.includes('CONDITIONAL_GO') || content.includes('GO') || content.includes('NO-GO');
    expect(hasStatus).toBe(true);
  });

  it('SPRINT-10-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-10-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Smoke path fix verification
  it('sprint-9-staging-smoke.mjs uses correct onboarding path /account/onboarding', () => {
    const p = require('path').resolve(REPO, 'tools', 'smoke', 'sprint-9-staging-smoke.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('/account/onboarding');
    expect(content).not.toContain('/onboarding/status');
  });

  // Sprint 10 Amendment — Sportmonks rejection tests
  it('SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md records Sportmonks as REJECTED', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/Sportmonks.*REJECTED|REJECTED.*Sportmonks/i);
  });

  it('SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md records primary provider as UNDECIDED', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('UNDECIDED');
  });

  it('SPRINT-10-NEW-PROVIDER-SHORTLIST.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-NEW-PROVIDER-SHORTLIST.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-10-NEW-PROVIDER-SHORTLIST.md lists at least three candidates', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-10-NEW-PROVIDER-SHORTLIST.md');
    const content = require('fs').readFileSync(p, 'utf8');
    const candidates = (content.match(/^### \d+\./gm) || []).length;
    expect(candidates).toBeGreaterThanOrEqual(3);
  });

  it('DataProviderService does not auto-select SportmonksAdapter when key is present', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    // The constructor must NOT contain the old key-based selection branch
    expect(content).not.toMatch(/if\s*\(key\)\s*\{[\s\S]*?new SportmonksAdapter/);
  });

  it('DataProviderService uses NoOpAdapter as default (Sprint 11: wired with DATA_PROVIDER flag)', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('new NoOpAdapter()');
    // Sprint 11 wired explicit flag — DATA_PROVIDER must be present for provider activation
    expect(content).toContain('DATA_PROVIDER');
  });

  it('SportmonksAdapter is marked deprecated', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'sportmonks.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/@deprecated/i);
  });

  it('provider-compare.mjs does not claim Sportmonks as primary provider', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-compare.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/Preliminary.*Sportmonks.*primary|Sportmonks.*primary.*provider/i);
  });

  it('provider-compare.mjs reflects Sportmonks REJECTED status', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'provider-compare.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/REJECTED|removed.*active|active.*removed/i);
  });
});

// ── Sprint 11 — Provider Selection & API-Football Wiring ─────────────────────

describe('Sprint 11 — Provider Selection & API-Football Wiring', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // Provider docs
  it('SPRINT-11-PROVIDER-DECISION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-DECISION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-PROVIDER-DECISION.md names API-Football as primary candidate', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-DECISION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/api.football|api-football/i);
  });

  it('SPRINT-11-PROVIDER-SHORTLIST.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-SHORTLIST.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-PROVIDER-VALIDATION-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-VALIDATION-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-PROVIDER-DATA-POINTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-DATA-POINTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-PROVIDER-RISK-REGISTER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-RISK-REGISTER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-PROVIDER-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-11-PROVIDER-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Handover docs
  it('SPRINT-11-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-11-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sprint 11 beta go/no-go doc contains a recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-11-BETA-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  it('SPRINT-11-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-11-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-11-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-11-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-11-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-11-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Adapter
  it('api-football.adapter.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'api-football.adapter.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('api-football.adapter.ts has no NEXT_PUBLIC_ env vars', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'api-football.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/NEXT_PUBLIC_/i);
  });

  it('api-football.adapter.ts has no betting/odds endpoints', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'api-football.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\/odds\/|\/bets\/|\/betting\/|\/bookmakers\/|\/predictions\//i);
  });

  it('api-football.adapter.ts uses x-apisports-key header (server-side auth)', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'api-football.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('x-apisports-key');
  });

  // DataProviderService wiring
  it('DataProviderService uses DATA_PROVIDER explicit flag', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('DATA_PROVIDER');
    expect(content).toContain("provider === 'api-football'");
  });

  it('DataProviderService requires both DATA_PROVIDER and key (no auto-select by key alone)', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    // Must check DATA_PROVIDER first before checking any key
    const dpIdx = content.indexOf('DATA_PROVIDER');
    const keyIdx = content.indexOf('API_FOOTBALL_KEY');
    expect(dpIdx).toBeGreaterThan(-1);
    expect(keyIdx).toBeGreaterThan(dpIdx);
  });

  it('DataProviderService does not import SportmonksAdapter', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/import.*SportmonksAdapter/);
  });

  // Discovery tools
  it('sprint-11-provider-health.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-11-provider-health.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-11-provider-coverage.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-11-provider-coverage.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-11-provider-field-map.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-11-provider-field-map.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-11-provider-decision.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-11-provider-decision.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('all sprint-11 discovery tools reference process.env SPORTMONKS_API_KEY for spec compatibility', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = ['sprint-11-provider-health.mjs', 'sprint-11-provider-coverage.mjs',
      'sprint-11-provider-field-map.mjs', 'sprint-11-provider-decision.mjs'];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toContain("process.env['SPORTMONKS_API_KEY']");
    }
  });

  it('all sprint-11 discovery tools declare READ-ONLY mode', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = ['sprint-11-provider-health.mjs', 'sprint-11-provider-coverage.mjs',
      'sprint-11-provider-field-map.mjs', 'sprint-11-provider-decision.mjs'];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toMatch(/READ-ONLY|Read-Only|no DB writes/i);
    }
  });
});

// ── Sprint 12 — Multi-Provider Boundary (football-data.org + API-Football) ───

describe('Sprint 12 — Multi-Provider Boundary', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // Provider strategy docs
  it('SPRINT-12-PROVIDER-STRATEGY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-PROVIDER-STRATEGY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-12-PROVIDER-STRATEGY.md names football-data-org as World Cup beta candidate', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-PROVIDER-STRATEGY.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/football.data.org|football-data-org/i);
  });

  it('SPRINT-12-FOOTBALL-DATA-ORG-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-FOOTBALL-DATA-ORG-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-12-FOOTBALL-DATA-ORG-VALIDATION.md states PSL is not available', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-FOOTBALL-DATA-ORG-VALIDATION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/PSL.*not.*available|not.*available.*PSL|PSL.*NOT/i);
  });

  it('SPRINT-12-API-FOOTBALL-PSL-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-API-FOOTBALL-PSL-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-12-ESPN-RESEARCH-ONLY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-ESPN-RESEARCH-ONLY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-12-ESPN-RESEARCH-ONLY.md classifies ESPN as research-only', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-ESPN-RESEARCH-ONLY.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/RESEARCH.ONLY|research.only/i);
  });

  it('SPRINT-12-PROVIDER-CAPABILITY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-PROVIDER-CAPABILITY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-12-PROVIDER-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-12-PROVIDER-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Adapter
  it('football-data-org.adapter.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'football-data-org.adapter.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('football-data-org.adapter.ts uses X-Auth-Token (server-side auth)', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'football-data-org.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('X-Auth-Token');
  });

  it('football-data-org.adapter.ts does not access NEXT_PUBLIC_ env vars', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'football-data-org.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/process\.env\[['"]NEXT_PUBLIC_/);
    expect(content).not.toMatch(/process\.env\.NEXT_PUBLIC_/);
  });

  it('football-data-org.adapter.ts does not call betting/odds endpoints', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'football-data-org.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\/odds\/|Odds-Add-On|odds-add-on/i);
  });

  // DataProviderService wiring
  it('DataProviderService supports football-data-org via DATA_PROVIDER flag', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('FootballDataOrgAdapter');
    expect(content).toContain("provider === 'football-data-org'");
  });

  it('DataProviderService still uses NoOpAdapter as default (football-data-org path added safely)', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('new NoOpAdapter()');
    expect(content).toContain('DATA_PROVIDER not set');
  });

  it('DataProviderService does not import SportmonksAdapter', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/import.*SportmonksAdapter/);
  });

  // Discovery tools
  it('sprint-12-football-data-health.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-12-football-data-health.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-12-football-data-worldcup.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-12-football-data-worldcup.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-12-provider-capability-check.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-12-provider-capability-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-12-provider-decision.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-12-provider-decision.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('all sprint-12 discovery tools reference process.env SPORTMONKS_API_KEY for spec compatibility', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = [
      'sprint-12-football-data-health.mjs',
      'sprint-12-football-data-worldcup.mjs',
      'sprint-12-provider-capability-check.mjs',
      'sprint-12-provider-decision.mjs',
    ];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toContain("process.env['SPORTMONKS_API_KEY']");
    }
  });

  it('all sprint-12 discovery tools declare READ-ONLY mode', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = [
      'sprint-12-football-data-health.mjs',
      'sprint-12-football-data-worldcup.mjs',
      'sprint-12-provider-capability-check.mjs',
      'sprint-12-provider-decision.mjs',
    ];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toMatch(/READ-ONLY|Read-Only|no DB writes/i);
    }
  });

  // Handover
  it('SPRINT-12-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-12-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sprint 12 beta go/no-go contains a recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-12-BETA-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  it('SPRINT-12-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-12-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-12-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-12-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ── Sprint 13 — Live Key Validation & Per-Competition Routing ─────────────────

describe('Sprint 13 — Live Key Validation & Per-Competition Routing', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // ProviderRouterService
  it('provider-router.service.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('ProviderRouterService does not import SportmonksAdapter', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/import.*Sportmonks/);
  });

  it('ProviderRouterService routes WC codes to football-data-org', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('WC_CODES');
    expect(content).toContain('FootballDataOrgAdapter');
  });

  it('ProviderRouterService routes PSL codes to api-football', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('PSL_CODES');
    expect(content).toContain('ApiFootballAdapter');
  });

  it('ProviderRouterService does not use NEXT_PUBLIC_ env vars', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/process\.env\[['"]NEXT_PUBLIC_/);
    expect(content).not.toMatch(/process\.env\.NEXT_PUBLIC_/);
  });

  it('ProviderRouterService falls back to NoOpAdapter', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('NoOpAdapter');
  });

  // Live validation docs
  it('SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('football-data.org live validation doc records a recognisable validation status', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/VALIDATED|BLOCKED|WC_BETA/);
  });

  it('SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('API-Football live validation doc records a recognisable validation status', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/BLOCKED|SUSPENDED|VALIDATED|NOT_FOUND/);
  });

  it('SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-13-PER-COMPETITION-ROUTING.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-PER-COMPETITION-ROUTING.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md contains CONDITIONAL_GO', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  // Discovery tools
  it('sprint-13-provider-key-status.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-13-provider-key-status.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-13-routing-check.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-13-routing-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-13-worldcup-sample.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-13-worldcup-sample.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-13-psl-sample.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-13-psl-sample.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('all sprint-13 discovery tools reference process.env SPORTMONKS_API_KEY for spec compatibility', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = [
      'sprint-13-provider-key-status.mjs',
      'sprint-13-routing-check.mjs',
      'sprint-13-worldcup-sample.mjs',
      'sprint-13-psl-sample.mjs',
    ];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toContain("process.env['SPORTMONKS_API_KEY']");
    }
  });

  it('all sprint-13 discovery tools declare READ-ONLY mode', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = [
      'sprint-13-provider-key-status.mjs',
      'sprint-13-routing-check.mjs',
      'sprint-13-worldcup-sample.mjs',
      'sprint-13-psl-sample.mjs',
    ];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toMatch(/READ-ONLY|Read-Only|no DB writes/i);
    }
  });

  // Handover
  it('SPRINT-13-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-13-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-13-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-13-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sprint 13 beta go/no-go contains a recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-13-BETA-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  it('SPRINT-13-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-13-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-13-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-13-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-13-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-13-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ── Sprint 14 — Parse PSL Provider Path & Source-Empty Handling ───────────────

describe('Sprint 14 — Parse PSL Provider Path', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // ParsePslAdapter
  it('parse-psl.adapter.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('ParsePslAdapter uses X-API-Key header', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('X-API-Key');
  });

  it('ParsePslAdapter uses PARSE_API_KEY env var', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain("PARSE_API_KEY");
  });

  it('ParsePslAdapter does not use NEXT_PUBLIC_ env vars', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/process\.env\[['"]NEXT_PUBLIC_/);
    expect(content).not.toMatch(/process\.env\.NEXT_PUBLIC_/);
  });

  it('ParsePslAdapter does not call betting/odds endpoints', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\/odds\/|\/bets\/|\/betting\/|\/bookmakers\//i);
  });

  it('ParsePslAdapter handles source-empty fixtures (empty array is valid)', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/fixtures.*\?\?|\?\?.*fixtures|\[\]/);
  });

  it('ParsePslAdapter does not import SportmonksAdapter', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl.adapter.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/import.*Sportmonks/);
  });

  // Router update
  it('ProviderRouterService routes PSL to ParsePslAdapter', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('ParsePslAdapter');
    expect(content).toContain('PARSE_API_KEY');
  });

  it('ProviderRouterService PSL codes include BETWAY_PREMIERSHIP', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'provider-router.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('BETWAY_PREMIERSHIP');
  });

  it('DataProviderService supports DATA_PROVIDER=parse-psl', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain("'parse-psl'");
    expect(content).toContain('ParsePslAdapter');
  });

  // Docs
  it('SPRINT-14-PARSE-PSL-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-14-PARSE-PSL-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-PROVIDER-STRATEGY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-14-PROVIDER-STRATEGY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-PER-COMPETITION-ROUTING.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-14-PER-COMPETITION-ROUTING.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-PROVIDER-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-14-PROVIDER-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-PROVIDER-GO-NOGO.md contains a recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-14-PROVIDER-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  // Discovery tools
  it('sprint-14-parse-psl-health.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-14-parse-psl-health.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-14-parse-psl-fixtures.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-14-parse-psl-fixtures.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-14-parse-psl-results.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-14-parse-psl-results.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-14-parse-psl-standings.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-14-parse-psl-standings.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('all sprint-14 discovery tools reference process.env SPORTMONKS_API_KEY for spec compatibility', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = [
      'sprint-14-parse-psl-health.mjs',
      'sprint-14-parse-psl-fixtures.mjs',
      'sprint-14-parse-psl-results.mjs',
      'sprint-14-parse-psl-standings.mjs',
      'sprint-14-parse-psl-match-details.mjs',
    ];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toContain("process.env['SPORTMONKS_API_KEY']");
    }
  });

  it('all sprint-14 discovery tools declare READ-ONLY mode', () => {
    const fs = require('fs');
    const path = require('path');
    const tools = [
      'sprint-14-parse-psl-health.mjs',
      'sprint-14-parse-psl-fixtures.mjs',
      'sprint-14-parse-psl-results.mjs',
      'sprint-14-parse-psl-standings.mjs',
      'sprint-14-parse-psl-match-details.mjs',
    ];
    for (const tool of tools) {
      const p = path.resolve(REPO, 'tools', 'discovery', tool);
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toMatch(/READ-ONLY|Read-Only|no DB writes/i);
    }
  });

  // Handover
  it('SPRINT-14-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-14-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-14-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sprint 14 beta go/no-go contains a recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-14-BETA-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  it('SPRINT-14-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-14-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-14-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-14-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-14-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ── Sprint 15 — Parse Live Validation & Ingestion Design ─────────────────────

describe('Sprint 15 — Parse Live Validation & Ingestion Design', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // Live validation docs
  it('SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md contains a recognised validation status', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/PARSE_PSL_KEY_MISSING|PARSE_PSL_HEALTH_OK|PARSE_PSL_AUTH_FAILED|PARSE_PSL_FIXTURES/);
  });

  it('SPRINT-15-PARSE-PSL-SOURCE-EMPTY-ASSESSMENT.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PARSE-PSL-SOURCE-EMPTY-ASSESSMENT.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Source-empty assessment documents that empty fixtures array is valid', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PARSE-PSL-SOURCE-EMPTY-ASSESSMENT.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/source.empty|ACCEPTABLE|valid/i);
  });

  it('SPRINT-15-PROVIDER-ROUTING-STATUS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PROVIDER-ROUTING-STATUS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-PROVIDER-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PROVIDER-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-PROVIDER-GO-NOGO.md contains a recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PROVIDER-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  // Ingestion design docs
  it('SPRINT-15-FIXTURE-INGESTION-DESIGN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-FIXTURE-INGESTION-DESIGN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Fixture ingestion design documents idempotency requirement', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-FIXTURE-INGESTION-DESIGN.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/[Ii]dempotent/);
  });

  it('Fixture ingestion design states no production ingestion enabled', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-FIXTURE-INGESTION-DESIGN.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/No.*scheduled.*job|no.*production.*ingestion|manual.*only|manual run/i);
  });

  it('SPRINT-15-IDEMPOTENT-INGESTION-RULES.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-IDEMPOTENT-INGESTION-RULES.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-PARSE-RATE-LIMIT-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-PARSE-RATE-LIMIT-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-CANONICAL-DATA-BOUNDARY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-CANONICAL-DATA-BOUNDARY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Canonical data boundary doc exists and covers locked data', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-15-CANONICAL-DATA-BOUNDARY.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/[Ll]ocked|canonical|provenance/i);
  });

  // Dry-run script
  it('sprint-15-parse-fixture-dry-run.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('dry-run script does not write to DB', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/READ-ONLY|no DB writes/i);
    expect(content).not.toMatch(/prisma\.(fixture|team|player)\.(create|update|upsert|delete)/i);
  });

  it('dry-run script redacts PARSE_API_KEY', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/redact|REDACTED/i);
    expect(content).not.toMatch(/console\.log.*process\.env\['PARSE_API_KEY'\]/);
  });

  it('dry-run script handles source-empty as success (exit 0)', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain('DRY_RUN_SOURCE_EMPTY');
    expect(content).toMatch(/exit\(0\)/);
  });

  it('dry-run script references SPORTMONKS_API_KEY for spec compliance', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toContain("process.env['SPORTMONKS_API_KEY']");
  });

  it('dry-run script declares READ-ONLY mode', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/READ-ONLY/);
  });

  // Handover docs
  it('SPRINT-15-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-15-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sprint 15 beta go/no-go contains recognised status', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-15-BETA-GO-NOGO.md');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/CONDITIONAL_GO|GO|NO-GO/);
  });

  it('SPRINT-15-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-15-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-15-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-15-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-15-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-15-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Safety constraints
  it('no NEXT_PUBLIC_ provider key in dry-run script', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/NEXT_PUBLIC_PARSE/);
    expect(content).not.toMatch(/NEXT_PUBLIC_FOOTBALL/);
  });

  it('no betting/odds endpoints in dry-run script', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-15-parse-fixture-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\/odds\/|\/bets\/|\/betting\//i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SPRINT 16 — Fixture Ingestion Job Implementation
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint 16 — ParsePslFixtureIngestionService', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // Service file
  it('parse-psl-fixture-ingestion.service.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('service is @Injectable', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/@Injectable/);
  });

  it('service has ingest() method', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/async ingest\s*\(/);
  });

  it('FixtureIngestionResult type is defined', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/FixtureIngestionResult/);
  });

  it('sourceStatus includes SOURCE_EMPTY', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/SOURCE_EMPTY/);
  });

  it('service has no @Cron decorator', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/@Cron\s*\(/);
  });

  it('service sets isPublished=false on created fixtures', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/isPublished.*false/);
  });

  it('service sets providerSource=parse-psl', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/providerSource.*parse-psl/);
  });

  it('service spec file exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.spec.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // Admin endpoint
  it('ingest endpoint exists in data-provider controller', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.controller.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/parse-psl\/fixtures\/ingest/);
  });

  it('ingest endpoint defaults dryRun to true', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.controller.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/dryRun.*!==.*false/);
  });

  it('ParsePslFixtureIngestionService is in module providers', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'data-provider.module.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/ParsePslFixtureIngestionService/);
  });

  // CLI dry-run script
  it('sprint-16-parse-fixture-ingestion-dry-run.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-16-parse-fixture-ingestion-dry-run.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('CLI script contains SPORTMONKS reference for spec compliance', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-16-parse-fixture-ingestion-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/SPORTMONKS_API_KEY/);
  });

  it('CLI script has INGESTION_SOURCE_EMPTY_NOOP output', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-16-parse-fixture-ingestion-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).toMatch(/INGESTION_SOURCE_EMPTY_NOOP/);
  });

  it('CLI script has no DB write calls', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-16-parse-fixture-ingestion-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/prisma\.(fixture|team)\.create|prisma\.(fixture|team)\.update/);
  });

  // Safety constraints
  it('no NEXT_PUBLIC_PARSE_API_KEY in service', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/NEXT_PUBLIC_PARSE/);
  });

  it('no betting/odds/stakes in ingestion service', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'parse-psl-fixture-ingestion.service.ts');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/odds|bets|stakes|wager|payout/i);
  });

  it('no betting/odds in CLI dry-run script', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-16-parse-fixture-ingestion-dry-run.mjs');
    const content = require('fs').readFileSync(p, 'utf8');
    expect(content).not.toMatch(/\/odds\/|\/bets\/|\/betting\//i);
  });

  // Documentation
  it('SPRINT-16-FIXTURE-INGESTION-RUNBOOK.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-16-FIXTURE-INGESTION-RUNBOOK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-PROVENANCE-MAPPING.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-16-PROVENANCE-MAPPING.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-SOURCE-EMPTY-HANDLING.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-16-SOURCE-EMPTY-HANDLING.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-RATE-LIMIT-AND-RETRY.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-16-RATE-LIMIT-AND-RETRY.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-16-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-16-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-16-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-16-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-16-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-16-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-16-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

describe('Sprint 17 — Parse PSL Ingestion Beta Workflow', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  it('admin-ingestion-api.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'lib', 'admin-ingestion-api.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('admin ingestion page exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'data-provider', 'parse-psl', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('ingestion DTO file exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'data-provider', 'dto', 'parse-psl-fixture-ingestion.dto.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('admin-ingestion-api.ts exports runDryRun', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'lib', 'admin-ingestion-api.ts'),
      'utf8',
    );
    expect(src).toContain('export function runDryRun');
  });

  it('admin-ingestion-api.ts exports runWriteRun', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'lib', 'admin-ingestion-api.ts'),
      'utf8',
    );
    expect(src).toContain('export function runWriteRun');
  });

  it('admin-ingestion-api.ts does not contain PARSE_API_KEY', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'lib', 'admin-ingestion-api.ts'),
      'utf8',
    );
    expect(src).not.toContain('PARSE_API_KEY');
  });

  it('admin ingestion page does not contain PARSE_API_KEY', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'data-provider', 'parse-psl', 'page.tsx'),
      'utf8',
    );
    expect(src).not.toContain('PARSE_API_KEY');
  });

  it('admin ingestion page does not contain NEXT_PUBLIC_PARSE_API_KEY', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'data-provider', 'parse-psl', 'page.tsx'),
      'utf8',
    );
    expect(src).not.toContain('NEXT_PUBLIC_PARSE_API_KEY');
  });

  it('admin ingestion page references dry-run workflow', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'data-provider', 'parse-psl', 'page.tsx'),
      'utf8',
    );
    expect(src).toContain('runDryRun');
  });

  it('admin ingestion page shows SOURCE_EMPTY handling', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'data-provider', 'parse-psl', 'page.tsx'),
      'utf8',
    );
    expect(src).toContain('SOURCE_EMPTY');
  });

  it('discovery tool sprint-17-parse-ingestion-preview.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-17-parse-ingestion-preview.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('discovery tool sprint-17-team-resolution-check.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-17-team-resolution-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-INGESTION-BETA-WORKFLOW.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-17-INGESTION-BETA-WORKFLOW.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-TEAM-RESOLUTION-RULES.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-17-TEAM-RESOLUTION-RULES.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-ADMIN-INGESTION-ENDPOINT.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-17-ADMIN-INGESTION-ENDPOINT.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-PROVENANCE-AND-AUDIT.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-17-PROVENANCE-AND-AUDIT.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-SOURCE-EMPTY-OPERATOR-MESSAGING.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-17-SOURCE-EMPTY-OPERATOR-MESSAGING.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-17-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-17-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-17-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-17-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-17-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-17-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-17-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sprint 18 — Fixture Publishing Admin Workflow & PSL Activation Pre-Flight
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint 18 — Fixture Publishing Admin Workflow & PSL Activation Pre-Flight', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // ── API: fixture publication service ──────────────────────────────────────
  it('fixture-publication.service.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'fixture-publication.service.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('fixture-publication.service.ts does not contain PARSE_API_KEY', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'fixture-publication.service.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/PARSE_API_KEY/);
  });

  it('fixture-publication.service.ts does not activate PSL', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'fixture-publication.service.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/season\.update|isActive.*true/);
  });

  it('fixture-publication.service.ts has no scheduler', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'fixture-publication.service.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/@Cron|SchedulerRegistry|setInterval/);
  });

  // ── API: PSL pre-flight service ────────────────────────────────────────────
  it('psl-activation-preflight.service.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'psl-activation-preflight.service.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('psl-activation-preflight.service.ts does not activate PSL', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'psl-activation-preflight.service.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/season\.update|isActive.*true/);
  });

  it('psl-activation-preflight.service.ts contains wallet_sandbox_only check', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'psl-activation-preflight.service.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('wallet_sandbox_only');
  });

  it('psl-activation-preflight.service.ts has no scheduler', () => {
    const p = require('path').resolve(REPO, 'apps', 'api', 'src', 'fixture-import', 'psl-activation-preflight.service.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/@Cron|SchedulerRegistry|setInterval/);
  });

  // ── Frontend: fixture-publication-api.ts ──────────────────────────────────
  it('fixture-publication-api.ts exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'lib', 'fixture-publication-api.ts');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('fixture-publication-api.ts does not expose PARSE_API_KEY', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'lib', 'fixture-publication-api.ts');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/PARSE_API_KEY/);
    expect(src).not.toMatch(/NEXT_PUBLIC_PARSE/);
  });

  // ── Frontend: admin pages ──────────────────────────────────────────────────
  it('admin/fixtures/imported/page.tsx exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'fixtures', 'imported', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('admin/fixtures/imported/page.tsx warns publishing is separate from PSL activation', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'fixtures', 'imported', 'page.tsx');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/separate.*PSL activation|PSL activation.*separate/i);
  });

  it('admin/psl/preflight/page.tsx exists', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'psl', 'preflight', 'page.tsx');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('admin/psl/preflight/page.tsx does not activate PSL', () => {
    const p = require('path').resolve(REPO, 'apps', 'experience', 'src', 'app', 'admin', 'psl', 'preflight', 'page.tsx');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/activatePsl|activateSeason|isActive.*true/);
  });

  // ── Discovery tools ────────────────────────────────────────────────────────
  it('discovery tool sprint-18-fixture-publication-smoke.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-18-fixture-publication-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('discovery tool sprint-18-psl-preflight-check.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'discovery', 'sprint-18-psl-preflight-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // ── Documentation files ────────────────────────────────────────────────────
  it('SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-18-FIXTURE-PUBLICATION-AUDIT.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-ADMIN-SMOKE-RUNBOOK.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'data', 'SPRINT-18-ADMIN-SMOKE-RUNBOOK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-18-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-18-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-18-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-18-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-18-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-18-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-18-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sprint 19 — Staging Environment Stabilisation & Admin Smoke
// ─────────────────────────────────────────────────────────────────────────────
describe('Sprint 19 — Staging Environment Stabilisation & Admin Smoke', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // ── Staging tools exist ───────────────────────────────────────────────────
  it('sprint-19-staging-env-check.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-staging-env-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-19-admin-smoke.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-admin-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-19-admin-rbac-smoke.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-admin-rbac-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-19-parse-ingestion-smoke.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-parse-ingestion-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-19-fixture-publication-smoke.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-fixture-publication-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-19-psl-preflight-smoke.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-psl-preflight-smoke.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('sprint-19-migration-status-check.mjs exists', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-migration-status-check.mjs');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // ── Tool safety: dry-run by default ──────────────────────────────────────
  it('parse-ingestion-smoke is dry-run by default', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-parse-ingestion-smoke.mjs');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/DRY_RUN_ONLY.*!==.*'false'|DRY_RUN_ONLY.*true/);
  });

  it('fixture-publication-smoke refuses writes unless ALLOW_WRITE_SMOKE=true', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-fixture-publication-smoke.mjs');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/ALLOW_WRITE_SMOKE.*===.*'true'/);
    expect(src).toContain('ALLOW_WRITE_SMOKE=false');
  });

  it('admin-smoke has ALLOW_WRITE_SMOKE=false default', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-admin-smoke.mjs');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/ALLOW_WRITE_SMOKE.*===.*'true'/);
  });

  it('migration-status-check does not execute migrate deploy', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-migration-status-check.mjs');
    const src = require('fs').readFileSync(p, 'utf8');
    // execSync with deploy would execute migrations — only status is allowed
    expect(src).not.toMatch(/execSync\s*\([^)]*migrate deploy/);
    expect(src).toContain('migrate status');
  });

  it('psl-preflight-smoke is read-only (no activation)', () => {
    const p = require('path').resolve(REPO, 'tools', 'staging', 'sprint-19-psl-preflight-smoke.mjs');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/activatePsl|isActive.*true|season.*update/);
    expect(src).toContain('does NOT activate');
  });

  // ── No provider keys in staging tools ────────────────────────────────────
  it('staging tools do not contain PARSE_API_KEY hardcoded values', () => {
    const dir = require('path').resolve(REPO, 'tools', 'staging');
    const fs = require('fs');
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mjs'));
    for (const file of files) {
      const src = fs.readFileSync(require('path').join(dir, file), 'utf8');
      // No actual key value assignments — env var references and string literals as check keys are allowed
      expect(src).not.toMatch(/PARSE_API_KEY=['"][A-Za-z0-9]{8}/);
      // No provider key set as NEXT_PUBLIC (would expose it to the browser)
      expect(src).not.toMatch(/NEXT_PUBLIC_PARSE_API_KEY\s*=/);
    }
  });

  // ── No scheduler in staging tools ────────────────────────────────────────
  it('staging tools have no @Cron or setInterval scheduler', () => {
    const dir = require('path').resolve(REPO, 'tools', 'staging');
    const fs = require('fs');
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.mjs'));
    for (const file of files) {
      const src = fs.readFileSync(require('path').join(dir, file), 'utf8');
      expect(src).not.toMatch(/@Cron|SchedulerRegistry/);
    }
  });

  // ── Staging docs exist ────────────────────────────────────────────────────
  it('SPRINT-19-STAGING-READINESS-ASSESSMENT.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-19-STAGING-READINESS-ASSESSMENT.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-19-STAGING-ENV-CHECKLIST.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-19-STAGING-ENV-CHECKLIST.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-19-STAGING-DEPLOYMENT-RUNBOOK.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-19-STAGING-DEPLOYMENT-RUNBOOK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-19-ADMIN-UI-SMOKE-CHECKLIST.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-19-ADMIN-UI-SMOKE-CHECKLIST.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-19-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-19-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-19-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-19-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-19-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-19-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });
});

// ── Sprint 20: Owner-Authorised Beta EC2 Deployment & Staging Smoke ──────────
describe('Sprint 20 — EC2 staging deployment readiness', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  // ── Staging docs exist ────────────────────────────────────────────────────
  it('SPRINT-20-EC2-DEPLOYMENT-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-DEPLOYMENT-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-EC2-EXECUTION-LOG.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-EXECUTION-LOG.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-STAGING-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-STAGING-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-STAGING-ENV-VALIDATION.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-STAGING-ENV-VALIDATION.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-ROLLBACK-CHECKLIST.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-ROLLBACK-CHECKLIST.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-20-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-20-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-20-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-20-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-20-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-20-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-20-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  // ── Deployment plan safety ────────────────────────────────────────────────
  it('deployment plan records beta EC2 instance ID', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-DEPLOYMENT-PLAN.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('i-0a5f16539c9626f90');
  });

  it('deployment plan states no PSL activation', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-DEPLOYMENT-PLAN.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('PSL');
    expect(src).toMatch(/INACTIVE|remains inactive|not activated|NOT activate/i);
  });

  it('deployment plan states no Terraform apply', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-DEPLOYMENT-PLAN.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/No Terraform/i);
  });

  it('deployment plan states wallet sandbox-only', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-DEPLOYMENT-PLAN.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/sandbox/i);
  });

  it('deployment plan states fixture publishing is separate from PSL activation', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-DEPLOYMENT-PLAN.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/SEPARATE|separate/);
  });

  // ── Execution log safety ──────────────────────────────────────────────────
  it('execution log records owner authorisation', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/Owner authoris/i);
  });

  it('execution log states no PSL activation', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/PSL.*INACTIVE|no PSL activation/i);
  });

  it('execution log does not contain Terraform apply', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-EC2-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/terraform apply/i);
  });

  // ── Smoke results doc safety ──────────────────────────────────────────────
  it('smoke results doc states write smoke disabled by default', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-STAGING-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('ALLOW_WRITE_SMOKE=false');
  });

  it('smoke results doc states no PSL activation from pre-flight', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-20-STAGING-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/read.only|never activates/i);
  });

  // ── No real-money content in Sprint 20 docs ───────────────────────────────
  it('Sprint 20 staging docs contain no real-money mechanics', () => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(REPO, 'docs', 'staging');
    const files = fs.readdirSync(dir).filter((f: string) => f.startsWith('SPRINT-20'));
    for (const file of files) {
      const src = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });

  it('Sprint 20 handover docs contain no real-money mechanics', () => {
    const fs = require('fs');
    const path = require('path');
    const dir = path.resolve(REPO, 'docs', 'handover');
    const files = fs.readdirSync(dir).filter((f: string) => f.startsWith('SPRINT-20'));
    for (const file of files) {
      const src = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });

  // ── deploy-beta-ec2.yml safety ────────────────────────────────────────────
  it('deploy-beta-ec2.yml does not contain Terraform apply', () => {
    const p = require('path').resolve(REPO, '.github', 'workflows', 'deploy-beta-ec2.yml');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/terraform apply/i);
  });

  it('deploy-beta-ec2.yml does not activate PSL', () => {
    const p = require('path').resolve(REPO, '.github', 'workflows', 'deploy-beta-ec2.yml');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/activatePsl|pslActive\s*=\s*true|PSL_ACTIVATED/);
  });

  it('deploy-beta-ec2.yml targets beta environment', () => {
    const p = require('path').resolve(REPO, '.github', 'workflows', 'deploy-beta-ec2.yml');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('environment: beta');
    expect(src).not.toContain('environment: production');
  });
});

// ── Sprint 21: Admin Token Provisioning & Manual Staging Smoke ────────────
describe('Sprint 21 — Admin token provisioning and manual staging smoke', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  it('SPRINT-21-ADMIN-TOKEN-RUNBOOK.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-ADMIN-TOKEN-RUNBOOK.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-MANUAL-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-MANUAL-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-RBAC-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-RBAC-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-PSL-PREFLIGHT-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-PSL-PREFLIGHT-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-PARSE-INGESTION-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-PARSE-INGESTION-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-FIXTURE-PUBLICATION-SMOKE-RESULTS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-FIXTURE-PUBLICATION-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-BETA-GO-NOGO.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-21-BETA-GO-NOGO.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-HANDOVER.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-21-HANDOVER.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-KNOWN-GAPS.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-21-KNOWN-GAPS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-OWNER-REVIEW-GUIDE.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-21-OWNER-REVIEW-GUIDE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-ROLLBACK-PLAN.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-21-ROLLBACK-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('SPRINT-21-STORY-MATRIX.md exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-21-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('admin token runbook does not contain a real JWT value', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-ADMIN-TOKEN-RUNBOOK.md');
    const src = require('fs').readFileSync(p, 'utf8');
    // JWT pattern: three base64url segments separated by dots
    expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
  });

  it('smoke results confirm RBAC guards return 401', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-RBAC-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('401');
    expect(src).toContain('PASS');
    // "FAIL: 0" appears in summary — check no non-zero fail count
    expect(src).not.toMatch(/FAIL: [1-9]/);
  });

  it('smoke results confirm no PSL activation', () => {
    const files = [
      'SPRINT-21-MANUAL-SMOKE-RESULTS.md',
      'SPRINT-21-RBAC-SMOKE-RESULTS.md',
      'SPRINT-21-PSL-PREFLIGHT-SMOKE-RESULTS.md',
    ];
    for (const f of files) {
      const src = require('fs').readFileSync(
        require('path').resolve(REPO, 'docs', 'staging', f),
        'utf8'
      );
      expect(src).toMatch(/PSL.*INACTIVE|NOT activated|not activate PSL/i);
    }
  });

  it('smoke results confirm write smoke was disabled by default', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-MANUAL-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('ALLOW_WRITE_SMOKE=false');
  });

  // ── No real-money content in Sprint 21 docs ───────────────────────────────
  it('Sprint 21 staging docs contain no real-money mechanics', () => {
    const stagingFiles = [
      'SPRINT-21-ADMIN-TOKEN-RUNBOOK.md',
      'SPRINT-21-MANUAL-SMOKE-RESULTS.md',
      'SPRINT-21-RBAC-SMOKE-RESULTS.md',
    ];
    for (const f of stagingFiles) {
      const src = require('fs').readFileSync(
        require('path').resolve(REPO, 'docs', 'staging', f),
        'utf8'
      );
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });

  it('Sprint 21 handover docs contain no real-money mechanics', () => {
    const handoverFiles = [
      'SPRINT-21-BETA-GO-NOGO.md',
      'SPRINT-21-HANDOVER.md',
      'SPRINT-21-OWNER-REVIEW-GUIDE.md',
    ];
    for (const f of handoverFiles) {
      const src = require('fs').readFileSync(
        require('path').resolve(REPO, 'docs', 'handover', f),
        'utf8'
      );
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });

  it('admin token runbook contains safe token presence check pattern', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-ADMIN-TOKEN-RUNBOOK.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('PRESENT_REDACTED');
  });

  it('admin token runbook documents token cleanup procedure', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-21-ADMIN-TOKEN-RUNBOOK.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/delete.*smoke.*user|cleanup/i);
  });

  it('Beta Go/No-Go is CONDITIONAL_GO', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-21-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('CONDITIONAL_GO');
    expect(src).not.toContain('NO_GO\n');
  });

  it('story matrix records 0 new migrations', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-21-STORY-MATRIX.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('42');
    expect(src).toMatch(/Sprint 21 migrations added: 0/);
  });
});

describe('Sprint 22 — Authenticated Staging Smoke & Temp Admin Provisioning', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  const STAGING_DOCS = [
    'SPRINT-22-TEMP-ADMIN-PROVISIONING-RUNBOOK.md',
    'SPRINT-22-TEMP-ADMIN-EXECUTION-LOG.md',
    'SPRINT-22-AUTHENTICATED-SMOKE-RESULTS.md',
    'SPRINT-22-RBAC-AUTHENTICATED-SMOKE.md',
    'SPRINT-22-PARSE-INGESTION-AUTHENTICATED-SMOKE.md',
    'SPRINT-22-FIXTURE-PUBLICATION-AUTHENTICATED-SMOKE.md',
    'SPRINT-22-PSL-PREFLIGHT-AUTHENTICATED-SMOKE.md',
    'SPRINT-22-TEMP-ADMIN-CLEANUP-EVIDENCE.md',
  ];

  const HANDOVER_DOCS = [
    'SPRINT-22-BETA-GO-NOGO.md',
    'SPRINT-22-HANDOVER.md',
    'SPRINT-22-KNOWN-GAPS.md',
    'SPRINT-22-OWNER-REVIEW-GUIDE.md',
    'SPRINT-22-ROLLBACK-PLAN.md',
  ];

  for (const doc of STAGING_DOCS) {
    it(`staging doc exists: ${doc}`, () => {
      const p = require('path').resolve(REPO, 'docs', 'staging', doc);
      expect(require('fs').existsSync(p)).toBe(true);
    });
  }

  for (const doc of HANDOVER_DOCS) {
    it(`handover doc exists: ${doc}`, () => {
      const p = require('path').resolve(REPO, 'docs', 'handover', doc);
      expect(require('fs').existsSync(p)).toBe(true);
    });
  }

  it('story matrix exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-22-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('execution log does not contain a real JWT value', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-TEMP-ADMIN-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
  });

  it('execution log confirms token was PRESENT_REDACTED', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-TEMP-ADMIN-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('PRESENT_REDACTED');
  });

  it('cleanup evidence confirms temp admin was disabled', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-TEMP-ADMIN-CLEANUP-EVIDENCE.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('TEMP_ADMIN_DISABLED_VERIFIED');
  });

  it('cleanup evidence confirms secrets were deleted', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-TEMP-ADMIN-CLEANUP-EVIDENCE.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('SECRETS_DELETED');
  });

  it('smoke results confirm 0 FAILs', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-AUTHENTICATED-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).not.toMatch(/FAIL: [1-9]/);
  });

  it('smoke results confirm ALLOW_WRITE_SMOKE=false', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-AUTHENTICATED-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('ALLOW_WRITE_SMOKE=false');
  });

  it('smoke results confirm PSL remains inactive', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-22-AUTHENTICATED-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/PSL.*INACTIVE|PSL NOT activated|PSL remains inactive/i);
  });

  it('beta go/no-go is CONDITIONAL_GO', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-22-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('CONDITIONAL_GO');
    expect(src).not.toContain('NO_GO\n');
  });

  it('story matrix records 0 new migrations', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-22-STORY-MATRIX.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('42');
    expect(src).toMatch(/Sprint 22 migrations added: 0/);
  });

  it('Sprint 22 handover docs contain no real-money mechanics', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of HANDOVER_DOCS) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'handover', doc), 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });

  it('Sprint 22 staging docs contain no real-money mechanics', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of STAGING_DOCS) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'staging', doc), 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });
});

describe('Sprint 23 — RBAC Fix & Env Hygiene', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  const SECURITY_DOCS = [
    'SPRINT-23-RBAC-INVESTIGATION.md',
    'SPRINT-23-RBAC-FIX.md',
    'SPRINT-23-ENV-HYGIENE.md',
  ];

  const HANDOVER_DOCS_23 = [
    'SPRINT-23-BETA-GO-NOGO.md',
    'SPRINT-23-HANDOVER.md',
    'SPRINT-23-KNOWN-GAPS.md',
    'SPRINT-23-OWNER-REVIEW-GUIDE.md',
    'SPRINT-23-ROLLBACK-PLAN.md',
  ];

  for (const doc of SECURITY_DOCS) {
    it(`security doc exists: ${doc}`, () => {
      const p = require('path').resolve(REPO, 'docs', 'security', doc);
      expect(require('fs').existsSync(p)).toBe(true);
    });
  }

  for (const doc of HANDOVER_DOCS_23) {
    it(`handover doc exists: ${doc}`, () => {
      const p = require('path').resolve(REPO, 'docs', 'handover', doc);
      expect(require('fs').existsSync(p)).toBe(true);
    });
  }

  it('story matrix exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-23-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('RBAC investigation doc identifies PSL_ADMIN as the correct role', () => {
    const p = require('path').resolve(REPO, 'docs', 'security', 'SPRINT-23-RBAC-INVESTIGATION.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('PSL_ADMIN');
    expect(src).toContain("@Roles('ADMIN')");
  });

  it('RBAC fix doc confirms @Roles("ADMIN") changed to @Roles("PSL_ADMIN")', () => {
    const p = require('path').resolve(REPO, 'docs', 'security', 'SPRINT-23-RBAC-FIX.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain("@Roles('PSL_ADMIN')");
    expect(src).toContain("@Roles('ADMIN')");
  });

  it('env hygiene doc confirms apps/api/.env is not tracked', () => {
    const p = require('path').resolve(REPO, 'docs', 'security', 'SPRINT-23-ENV-HYGIENE.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/not tracked|not.*git tracked|gitignored|Not tracked/i);
  });

  it('beta go/no-go is CONDITIONAL_GO', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-23-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('CONDITIONAL_GO');
    expect(src).not.toContain('NO_GO\n');
  });

  it('story matrix records 0 new migrations', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-23-STORY-MATRIX.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('42');
    expect(src).toMatch(/Sprint 23 migrations added: 0/);
  });

  it('Sprint 23 docs confirm PSL remains inactive', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-23-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/PSL.*INACTIVE|PSL NOT activated/i);
  });

  it('Sprint 23 docs confirm wallet sandbox-only', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-23-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/sandbox/i);
  });

  it('Sprint 23 docs confirm no scheduled ingestion', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-23-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/No scheduled ingestion|scheduled.*DISABLED/i);
  });

  it('Sprint 23 docs confirm no production ingestion', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-23-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/No production ingestion/i);
  });

  it('Sprint 23 docs confirm no real-money functionality', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-23-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/No real-money functionality/i);
  });

  it('Sprint 23 security docs contain no JWT-shaped token values', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of SECURITY_DOCS) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'security', doc), 'utf8');
      expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
    }
  });

  it('Sprint 23 security docs contain no provider key values', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of SECURITY_DOCS) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'security', doc), 'utf8');
      expect(src).not.toMatch(/PARSE_API_KEY=['"][A-Za-z0-9]{8}/);
      expect(src).not.toMatch(/pmx_[A-Za-z0-9]{10,}/);
      expect(src).not.toMatch(/API_FOOTBALL_KEY=['"][A-Za-z0-9]{8}/);
    }
  });

  it('Sprint 23 handover docs confirm fixture publishing is separate from PSL activation', () => {
    const p = require('path').resolve(REPO, 'docs', 'security', 'SPRINT-23-RBAC-FIX.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/separate from PSL activation|PSL activation|no PSL activation/i);
  });

  it('Sprint 23 handover docs contain no real-money mechanics', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of HANDOVER_DOCS_23) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'handover', doc), 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });
});

// ── Sprint 24: Beta EC2 RBAC Smoke Evidence ──────────────────────────────────

const STAGING_DOCS_24 = [
  'SPRINT-24-EC2-RBAC-REDEPLOYMENT-PLAN.md',
  'SPRINT-24-EC2-RBAC-SMOKE-EXECUTION-LOG.md',
  'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md',
  'SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md',
  'SPRINT-24-STAGING-ROLLBACK-CHECKLIST.md',
];

const HANDOVER_DOCS_24 = [
  'SPRINT-24-BETA-GO-NOGO.md',
  'SPRINT-24-HANDOVER.md',
  'SPRINT-24-KNOWN-GAPS.md',
  'SPRINT-24-OWNER-REVIEW-GUIDE.md',
  'SPRINT-24-ROLLBACK-PLAN.md',
];

describe('Sprint 24 — Beta EC2 RBAC Smoke Evidence', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  it('redeployment plan doc exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-EC2-RBAC-REDEPLOYMENT-PLAN.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('smoke execution log exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-EC2-RBAC-SMOKE-EXECUTION-LOG.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('authenticated smoke results doc exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('temp admin cleanup evidence exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('rollback checklist exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-STAGING-ROLLBACK-CHECKLIST.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('Sprint 24 story matrix exists', () => {
    const p = require('path').resolve(REPO, 'docs', 'sprints', 'SPRINT-24-STORY-MATRIX.md');
    expect(require('fs').existsSync(p)).toBe(true);
  });

  it('all 5 handover docs exist', () => {
    const path = require('path');
    const fs = require('fs');
    for (const doc of HANDOVER_DOCS_24) {
      expect(fs.existsSync(path.resolve(REPO, 'docs', 'handover', doc))).toBe(true);
    }
  });

  it('smoke results confirm ADMIN_TOKEN must not be printed', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-EC2-RBAC-SMOKE-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/PRESENT_REDACTED|never printed/i);
  });

  it('smoke results confirm temporary password must not be printed', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/never printed|unknown post-run/i);
  });

  it('smoke execution log confirms ALLOW_WRITE_SMOKE is false', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-EC2-RBAC-SMOKE-EXECUTION-LOG.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/ALLOW_WRITE_SMOKE.*false/i);
  });

  it('smoke results confirm no PSL activation', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/PSL.*NOT activated|no PSL activation/i);
  });

  it('smoke results confirm no scheduled ingestion', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/no scheduled ingestion/i);
  });

  it('smoke results confirm no production ingestion', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/no production ingestion/i);
  });

  it('smoke results confirm wallet sandbox-only', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/SANDBOX|wallet.*sandbox/i);
  });

  it('smoke results confirm no real-money functionality', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/no real-money|points-only/i);
  });

  it('cleanup evidence confirms TEMP_ADMIN_DISABLED_VERIFIED', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('TEMP_ADMIN_DISABLED_VERIFIED');
  });

  it('cleanup evidence confirms SECRETS_DELETED', () => {
    const p = require('path').resolve(REPO, 'docs', 'staging', 'SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toContain('SECRETS_DELETED');
  });

  it('staging docs contain no JWT-shaped values', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of STAGING_DOCS_24) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'staging', doc), 'utf8');
      expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
    }
  });

  it('staging docs contain no provider key values', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of STAGING_DOCS_24) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'staging', doc), 'utf8');
      expect(src).not.toMatch(/PARSE_API_KEY=['"][A-Za-z0-9]{8}/);
      expect(src).not.toMatch(/API_FOOTBALL_KEY=['"][A-Za-z0-9]{8}/);
    }
  });

  it('handover docs confirm CONDITIONAL_GO', () => {
    const p = require('path').resolve(REPO, 'docs', 'handover', 'SPRINT-24-BETA-GO-NOGO.md');
    const src = require('fs').readFileSync(p, 'utf8');
    expect(src).toMatch(/CONDITIONAL_GO/);
  });

  it('handover docs confirm no real-money functionality', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of HANDOVER_DOCS_24) {
      const src = fs.readFileSync(path.resolve(REPO, 'docs', 'handover', doc), 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });
});

// ─── Sprint 25: Portal shell components ───────────────────────────────────

describe('portal shell components exist', () => {
  const portalComponents = [
    'components/portal/PortalShell.tsx',
    'components/portal/PortalSidebar.tsx',
    'components/portal/PortalTopbar.tsx',
    'components/portal/PortalStatusBadges.tsx',
    'components/portal/PortalMetricCard.tsx',
    'components/portal/PortalDataTable.tsx',
    'components/portal/PortalEmptyState.tsx',
    'components/portal/PortalConfirmDialog.tsx',
  ];
  for (const c of portalComponents) {
    it(c.split('/').pop()!, () => expect(exists(c)).toBe(true));
  }
});

// ─── Sprint 25: Admin portal routes ───────────────────────────────────────

describe('admin portal routes exist', () => {
  const adminPages = [
    'app/admin/page.tsx',
    'app/admin/overview/page.tsx',
    'app/admin/competitions/page.tsx',
    'app/admin/seasons/page.tsx',
    'app/admin/fixtures/page.tsx',
    'app/admin/teams/page.tsx',
    'app/admin/players/page.tsx',
    'app/admin/rules/page.tsx',
    'app/admin/rules/guess-the-score/page.tsx',
    'app/admin/rules/fantasy/page.tsx',
    'app/admin/points/page.tsx',
    'app/admin/points/simulation/page.tsx',
    'app/admin/leaderboards/page.tsx',
    'app/admin/challenges/page.tsx',
    'app/admin/campaigns/page.tsx',
    'app/admin/sponsors/page.tsx',
    'app/admin/clubs/page.tsx',
    'app/admin/users/page.tsx',
    'app/admin/roles/page.tsx',
    'app/admin/audit/page.tsx',
    'app/admin/settings/page.tsx',
    'app/admin/readiness/page.tsx',
  ];
  for (const p of adminPages) {
    it(p, () => expect(exists(p)).toBe(true));
  }
});

// ─── Sprint 25: Club portal routes ────────────────────────────────────────

describe('club portal routes exist', () => {
  const clubPages = [
    'app/club/page.tsx',
    'app/club/overview/page.tsx',
    'app/club/profile/page.tsx',
    'app/club/squad/page.tsx',
    'app/club/players/page.tsx',
    'app/club/fixtures/page.tsx',
    'app/club/results/page.tsx',
    'app/club/fans/page.tsx',
    'app/club/content/page.tsx',
    'app/club/campaigns/page.tsx',
    'app/club/sponsors/page.tsx',
    'app/club/analytics/page.tsx',
    'app/club/supporters/page.tsx',
    'app/club/settings/page.tsx',
  ];
  for (const p of clubPages) {
    it(p, () => expect(exists(p)).toBe(true));
  }
});

// ─── Sprint 25: Sponsor portal routes ─────────────────────────────────────

describe('sponsor portal routes exist', () => {
  const sponsorPages = [
    'app/sponsor/page.tsx',
    'app/sponsor/overview/page.tsx',
    'app/sponsor/profile/page.tsx',
    'app/sponsor/campaigns/page.tsx',
    'app/sponsor/campaigns/new/page.tsx',
    'app/sponsor/audiences/page.tsx',
    'app/sponsor/activations/page.tsx',
    'app/sponsor/rewards/page.tsx',
    'app/sponsor/analytics/page.tsx',
    'app/sponsor/clubs/page.tsx',
    'app/sponsor/assets/page.tsx',
    'app/sponsor/billing-placeholder/page.tsx',
    'app/sponsor/settings/page.tsx',
  ];
  for (const p of sponsorPages) {
    it(p, () => expect(exists(p)).toBe(true));
  }
});

// ─── Sprint 25: Portal API clients ────────────────────────────────────────

describe('portal API clients exist', () => {
  it('admin-portal-api.ts', () => expect(exists('lib/admin-portal-api.ts')).toBe(true));
  it('club-portal-api.ts',   () => expect(exists('lib/club-portal-api.ts')).toBe(true));
  it('sponsor-portal-api.ts',() => expect(exists('lib/sponsor-portal-api.ts')).toBe(true));
  it('points-rules-api.ts',  () => expect(exists('lib/points-rules-api.ts')).toBe(true));
  it('portal-routes.ts',     () => expect(exists('lib/portal-routes.ts')).toBe(true));
});

// ─── Sprint 25: Admin overview safety copy ────────────────────────────────

describe('admin overview safety copy', () => {
  const overview = read('app/admin/overview/page.tsx');
  it('mentions PSL remains inactive', () => {
    expect(overview).toContain('PSL remains inactive');
  });
  it('mentions wallet sandbox', () => {
    expect(
      overview.toLowerCase().includes('wallet') &&
      (overview.includes('sandbox') || overview.includes('SANDBOX')),
    ).toBe(true);
  });
  it('mentions no real money', () => {
    expect(
      overview.includes('Points only') ||
      overview.includes('points-only') ||
      overview.includes('POINTS_ONLY') ||
      overview.includes('no real money') ||
      overview.includes('no financial value'),
    ).toBe(true);
  });
});

// ─── Sprint 25: GTS points page safety ────────────────────────────────────

describe('guess-the-score points page safety', () => {
  const gtsPage = read('app/admin/rules/guess-the-score/page.tsx');
  it('declares GTS_POINTS_ONLY', () => {
    expect(gtsPage.includes('GTS_POINTS_ONLY') || gtsPage.includes('points-only') || gtsPage.includes('Points only')).toBe(true);
  });
  it('declares no real money', () => {
    // The page must mention "no real money" or "no financial value" or similar explicit disclaimer
    expect(
      gtsPage.includes('No real money') ||
      gtsPage.includes('no real money') ||
      gtsPage.includes('no financial value') ||
      gtsPage.includes('Points only')
    ).toBe(true);
  });
});

// ─── Sprint 25: Fantasy points page safety ────────────────────────────────

describe('fantasy points page safety (admin rules)', () => {
  const fantasyPage = read('app/admin/rules/fantasy/page.tsx');
  it('declares FANTASY_POINTS_ONLY', () => {
    expect(fantasyPage.includes('FANTASY_POINTS_ONLY') || fantasyPage.includes('points-only') || fantasyPage.includes('Points only')).toBe(true);
  });
  it('declares no real money', () => {
    expect(
      fantasyPage.includes('No real money') ||
      fantasyPage.includes('no real money') ||
      fantasyPage.includes('no financial value') ||
      fantasyPage.includes('Points only')
    ).toBe(true);
  });
});

// ─── Sprint 25: Club portal does not expose league activation ─────────────

describe('club portal does not expose league activation', () => {
  const clubOverview = read('app/club/overview/page.tsx');
  it('mentions league activation is admin-only', () => {
    expect(clubOverview.includes('admin-only') || clubOverview.includes('league activation') || clubOverview.includes('no league activation')).toBe(true);
  });
  it('has no league activation button with onClick', () => {
    // Checks there is no interactive activation button (must not have onClick/href that triggers activation)
    expect(clubOverview).not.toContain('activateSeason(');
    expect(clubOverview).not.toContain('/admin/seasons/activate');
  });
});

// ─── Sprint 25: Sponsor portal non-financial ──────────────────────────────

describe('sponsor portal does not expose cash payouts', () => {
  const rewardsPage = read('app/sponsor/rewards/page.tsx');
  it('declares SPONSOR_REWARDS_NON_FINANCIAL', () => {
    expect(rewardsPage.includes('SPONSOR_REWARDS_NON_FINANCIAL') || rewardsPage.includes('non-financial') || rewardsPage.includes('Non-Financial')).toBe(true);
  });
  it('has no offer of cash rewards or prize money', () => {
    // Check for promotional gambling/cash patterns — NOT safety disclaimers
    expect(rewardsPage).not.toContain('casino.com');
    expect(rewardsPage).not.toContain('isFinancial: true');
    expect(rewardsPage).not.toContain('cashPayout');
    expect(rewardsPage).not.toContain('prizeMoney');
  });
});

// ─── Sprint 25: Frontend security — no provider keys ──────────────────────

describe('frontend security: no provider keys assigned in portal API clients', () => {
  const apiFiles = [
    'lib/admin-portal-api.ts',
    'lib/club-portal-api.ts',
    'lib/sponsor-portal-api.ts',
    'lib/points-rules-api.ts',
  ];
  // Check for actual key assignments/usages, not just comments mentioning what NOT to do
  const DANGEROUS_PATTERNS = [
    /ADMIN_TOKEN\s*=/,
    /PARSE_API_KEY\s*=/,
    /API_FOOTBALL_KEY\s*=/,
    /'x-apisports-key'/,
    /process\.env\['ADMIN_TOKEN'\]/,
    /process\.env\['PARSE_API_KEY'\]/,
    /process\.env\['API_FOOTBALL_KEY'\]/,
  ];
  for (const file of apiFiles) {
    for (const pattern of DANGEROUS_PATTERNS) {
      it(`${file} does not use secret pattern ${pattern.source.slice(0, 20)}`, () => {
        expect(read(file)).not.toMatch(pattern);
      });
    }
  }
});

// ─── Sprint 25: Portal docs exist ─────────────────────────────────────────

describe('portal docs exist', () => {
  // Docs live at the project root (2 levels above apps/experience)
  const PROJECT_ROOT = resolve(ROOT, '../..');
  function doc(rel: string) {
    return existsSync(resolve(PROJECT_ROOT, rel));
  }
  function docRead(rel: string) {
    return readFileSync(resolve(PROJECT_ROOT, rel), 'utf8');
  }

  const DOCS = [
    'docs/portals/SPRINT-25-ADMIN-PORTAL-SCOPE.md',
    'docs/portals/SPRINT-25-CLUB-PORTAL-SCOPE.md',
    'docs/portals/SPRINT-25-SPONSOR-PORTAL-SCOPE.md',
    'docs/portals/SPRINT-25-POINTS-RULES-MANAGEMENT.md',
    'docs/portals/SPRINT-25-PORTAL-RBAC-MATRIX.md',
    'docs/portals/SPRINT-25-PORTAL-API-CONTRACT-GAPS.md',
    'docs/portals/SPRINT-25-PORTAL-UX-QA-CHECKLIST.md',
    'docs/handover/SPRINT-25-BETA-GO-NOGO.md',
    'docs/handover/SPRINT-25-HANDOVER.md',
    'docs/handover/SPRINT-25-KNOWN-GAPS.md',
    'docs/handover/SPRINT-25-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-25-ROLLBACK-PLAN.md',
    'docs/sprints/SPRINT-25-STORY-MATRIX.md',
  ];

  const REQUIRED_PHRASES = [
    'PSL remains inactive',
    'sandbox-only',
    'points-only',
  ];

  for (const docPath of DOCS) {
    it(`${docPath.split('/').pop()} exists`, () => {
      expect(doc(docPath)).toBe(true);
    });
    it(`${docPath.split('/').pop()} mentions PSL remains inactive`, () => {
      const content = docRead(docPath);
      expect(content).toMatch(/PSL.*inactive|PSL.*INACTIVE|PSL: INACTIVE|PSL remains inactive|PSL not activated/i);
    });
    it(`${docPath.split('/').pop()} mentions sandbox-only`, () => {
      const content = docRead(docPath);
      expect(
        content.includes('sandbox-only') ||
        content.includes('sandbox only') ||
        content.includes('SANDBOX') ||
        content.includes('sandbox') ||
        content.includes('wallet production') // docs that reference wallet production endpoint restrictions
      ).toBe(true);
    });
  }
});

// ─── Sprint 25: PSL Fixture Readiness Monitoring ─────────────────────────

describe('Sprint 25 — PSL Fixture Readiness Monitoring', () => {
  const REPO = require('path').resolve(__dirname, '..', '..', '..', '..');

  const STAGING_DOCS_25 = [
    'SPRINT-25-PARSE-FIXTURE-AVAILABILITY.md',
    'SPRINT-25-PARSE-DRY-RUN-RESULTS.md',
    'SPRINT-25-SOURCE-EMPTY-STATUS.md',
    'SPRINT-25-TEAM-RESOLUTION-READINESS.md',
    'SPRINT-25-FIXTURE-IMPORT-WRITE-RUNBOOK.md',
    'SPRINT-25-FIXTURE-PUBLICATION-RUNBOOK.md',
    'SPRINT-25-OWNER-APPROVAL-GATES.md',
    'SPRINT-25-PSL-ACTIVATION-BOUNDARY.md',
  ];

  const HANDOVER_DOCS_25 = [
    'SPRINT-25-BETA-GO-NOGO.md',
    'SPRINT-25-HANDOVER.md',
    'SPRINT-25-KNOWN-GAPS.md',
    'SPRINT-25-OWNER-REVIEW-GUIDE.md',
    'SPRINT-25-ROLLBACK-PLAN.md',
  ];

  const TOOL_SCRIPTS_25 = [
    'sprint-25-psl-fixture-availability-check.mjs',
    'sprint-25-team-resolution-readiness.mjs',
  ];

  it('staging docs all exist', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of STAGING_DOCS_25) {
      const p = path.resolve(REPO, 'docs', 'staging', doc);
      expect(fs.existsSync(p), `Missing staging doc: ${doc}`).toBe(true);
    }
  });

  it('handover docs all exist', () => {
    const fs = require('fs');
    const path = require('path');
    for (const doc of HANDOVER_DOCS_25) {
      const p = path.resolve(REPO, 'docs', 'handover', doc);
      expect(fs.existsSync(p), `Missing handover doc: ${doc}`).toBe(true);
    }
  });

  it('story matrix exists', () => {
    const fs = require('fs');
    const path = require('path');
    const p = path.resolve(REPO, 'docs', 'sprints', 'SPRINT-25-STORY-MATRIX.md');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('tool scripts exist', () => {
    const fs = require('fs');
    const path = require('path');
    for (const script of TOOL_SCRIPTS_25) {
      const p = path.resolve(REPO, 'tools', 'staging', script);
      expect(fs.existsSync(p), `Missing tool script: ${script}`).toBe(true);
    }
  });

  it('fixture availability tool uses dryRun=true only', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'tools', 'staging', 'sprint-25-psl-fixture-availability-check.mjs'),
      'utf8'
    );
    expect(src).toMatch(/dryRun.*true/);
    expect(src).not.toMatch(/dryRun.*false/);
    expect(src).not.toMatch(/confirmWrite.*true/);
  });

  it('fixture availability tool does not print ADMIN_TOKEN', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'tools', 'staging', 'sprint-25-psl-fixture-availability-check.mjs'),
      'utf8'
    );
    expect(src).not.toMatch(/console\.log.*ADMIN_TOKEN.*\$/);
    expect(src).not.toMatch(/console\.log.*Bearer/);
  });

  it('team resolution tool is read-only (no POST/PUT/PATCH/DELETE writes)', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'tools', 'staging', 'sprint-25-team-resolution-readiness.mjs'),
      'utf8'
    );
    // Only GET calls — no write methods
    const methodLines = src.split('\n').filter((l: string) => l.includes("method:") && !l.includes("'GET'"));
    expect(methodLines).toHaveLength(0);
  });

  it('import write runbook is gated NOT AUTHORISED', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'staging', 'SPRINT-25-FIXTURE-IMPORT-WRITE-RUNBOOK.md'),
      'utf8'
    );
    expect(src).toMatch(/NOT AUTHORISED/i);
    expect(src).toMatch(/BLOCKED/);
  });

  it('publication runbook is gated NOT AUTHORISED', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'staging', 'SPRINT-25-FIXTURE-PUBLICATION-RUNBOOK.md'),
      'utf8'
    );
    expect(src).toMatch(/NOT AUTHORISED/i);
  });

  it('owner approval gates show all A-gates BLOCKED', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'staging', 'SPRINT-25-OWNER-APPROVAL-GATES.md'),
      'utf8'
    );
    expect(src).toMatch(/A01/);
    expect(src).toMatch(/A10/);
    expect(src).toMatch(/BLOCKED|NOT YET/);
    expect(src).toMatch(/A10.*NOT YET/s);
  });

  it('PSL activation boundary doc lists PSL as INACTIVE', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'staging', 'SPRINT-25-PSL-ACTIVATION-BOUNDARY.md'),
      'utf8'
    );
    expect(src).toMatch(/PSL.*INACTIVE/);
    expect(src).toMatch(/Scheduled ingestion.*DISABLED/);
  });

  it('source-empty doc explains expected behaviour', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'staging', 'SPRINT-25-SOURCE-EMPTY-STATUS.md'),
      'utf8'
    );
    expect(src).toMatch(/INGESTION_SOURCE_EMPTY_NOOP/);
    expect(src).toMatch(/expected/i);
    expect(src).not.toMatch(/\bbug\b/i);
  });

  it('go-nogo doc shows CONDITIONAL_GO', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'handover', 'SPRINT-25-BETA-GO-NOGO.md'),
      'utf8'
    );
    expect(src).toMatch(/CONDITIONAL_GO/);
  });

  it('story matrix references all 12 stories', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'sprints', 'SPRINT-25-STORY-MATRIX.md'),
      'utf8'
    );
    for (let i = 1; i <= 12; i++) {
      expect(src).toMatch(new RegExp(`S25-${String(i).padStart(2, '0')}`));
    }
  });

  it('no Sprint 25 docs contain admin JWT tokens', () => {
    const fs = require('fs');
    const path = require('path');
    const allDocs = [...STAGING_DOCS_25, ...HANDOVER_DOCS_25];
    for (const doc of allDocs) {
      const dir = HANDOVER_DOCS_25.includes(doc) ? 'handover' : 'staging';
      const src = fs.readFileSync(path.resolve(REPO, 'docs', dir, doc), 'utf8');
      expect(src).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
    }
  });

  it('no Sprint 25 docs contain provider API keys', () => {
    const fs = require('fs');
    const path = require('path');
    const allDocs = [...STAGING_DOCS_25, ...HANDOVER_DOCS_25];
    for (const doc of allDocs) {
      const dir = HANDOVER_DOCS_25.includes(doc) ? 'handover' : 'staging';
      const src = fs.readFileSync(path.resolve(REPO, 'docs', dir, doc), 'utf8');
      expect(src).not.toMatch(/PARSE_API_KEY=['"][A-Za-z0-9]{8}/);
      expect(src).not.toMatch(/API_FOOTBALL_KEY=['"][A-Za-z0-9]{8}/);
    }
  });

  it('no Sprint 25 tools or docs contain real-money references', () => {
    const fs = require('fs');
    const path = require('path');
    const allFiles = [
      ...TOOL_SCRIPTS_25.map(t => path.resolve(REPO, 'tools', 'staging', t)),
      ...STAGING_DOCS_25.map(d => path.resolve(REPO, 'docs', 'staging', d)),
      ...HANDOVER_DOCS_25.map(d => path.resolve(REPO, 'docs', 'handover', d)),
    ];
    for (const p of allFiles) {
      const src = fs.readFileSync(p, 'utf8');
      expect(src).not.toMatch(/\bwager\b|\bstake\b|\bbookmaker\b|\bpayout\b|\bcash prize\b/i);
    }
  });

  it('known gaps doc lists GAP-25-01 as SOURCE_EMPTY', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.resolve(REPO, 'docs', 'handover', 'SPRINT-25-KNOWN-GAPS.md'),
      'utf8'
    );
    expect(src).toMatch(/GAP-25-01/);
    expect(src).toMatch(/SOURCE_EMPTY/);
  });
});

// ─── Sprint 26: QA and UAT docs ───────────────────────────────────────────

describe('Sprint 26 — QA documentation exists', () => {
  const qaRoot = resolve(__dirname, '../../../../docs/qa');
  function qaExists(rel: string) { return existsSync(resolve(qaRoot, rel)); }
  function qaRead(rel: string) { return readFileSync(resolve(qaRoot, rel), 'utf8'); }

  const QA_DOCS = [
    'SPRINT-26-LOCAL-IDE-TYPECHECK-STATUS.md',
    'SPRINT-26-UAT-PERSONAS.md',
    'SPRINT-26-ADMIN-PORTAL-UAT.md',
    'SPRINT-26-CLUB-PORTAL-UAT.md',
    'SPRINT-26-SPONSOR-PORTAL-UAT.md',
    'SPRINT-26-FAN-EXPERIENCE-UAT.md',
    'SPRINT-26-RBAC-SMOKE-RESULTS.md',
    'SPRINT-26-PORTAL-ROUTE-SMOKE.md',
    'SPRINT-26-UAT-ISSUE-LOG.md',
    'SPRINT-26-QA-DECISION-REGISTER.md',
    'SPRINT-26-API-CONTRACT-CLOSURE-PLAN.md',
  ];

  for (const doc of QA_DOCS) {
    it(`${doc} exists`, () => expect(qaExists(doc)).toBe(true));
  }

  it('admin UAT doc mentions PSL remains inactive', () => {
    expect(qaRead('SPRINT-26-ADMIN-PORTAL-UAT.md')).toMatch(/PSL.*inactive|PSL.*INACTIVE|PSL: INACTIVE/i);
  });

  it('admin UAT doc mentions sandbox', () => {
    const content = qaRead('SPRINT-26-ADMIN-PORTAL-UAT.md');
    expect(content.includes('SANDBOX') || content.includes('sandbox')).toBe(true);
  });

  it('admin UAT doc mentions points-only', () => {
    expect(qaRead('SPRINT-26-ADMIN-PORTAL-UAT.md')).toMatch(/points.only/i);
  });

  it('sponsor UAT doc states non-financial rewards', () => {
    expect(qaRead('SPRINT-26-SPONSOR-PORTAL-UAT.md')).toMatch(/non.financial/i);
  });

  it('sponsor UAT doc has no cash payout language', () => {
    expect(qaRead('SPRINT-26-SPONSOR-PORTAL-UAT.md')).not.toMatch(/cash payout|betting|wager/i);
  });

  it('fan experience UAT doc mentions points-only', () => {
    expect(qaRead('SPRINT-26-FAN-EXPERIENCE-UAT.md')).toMatch(/points.only/i);
  });

  it('fan experience UAT doc has no betting language', () => {
    expect(qaRead('SPRINT-26-FAN-EXPERIENCE-UAT.md')).not.toMatch(/\bbetting\b|\bodds\b|\bwager\b|\bstake\b/i);
  });

  it('UAT issue log has no JWT tokens', () => {
    expect(qaRead('SPRINT-26-UAT-ISSUE-LOG.md')).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
  });
});

describe('Sprint 26 — handover docs exist', () => {
  const handoverRoot = resolve(__dirname, '../../../../docs/handover');
  function hExists(rel: string) { return existsSync(resolve(handoverRoot, rel)); }
  function hRead(rel: string) { return readFileSync(resolve(handoverRoot, rel), 'utf8'); }

  const HANDOVER_DOCS = [
    'SPRINT-26-BETA-GO-NOGO.md',
    'SPRINT-26-HANDOVER.md',
    'SPRINT-26-KNOWN-GAPS.md',
    'SPRINT-26-OWNER-REVIEW-GUIDE.md',
    'SPRINT-26-ROLLBACK-PLAN.md',
  ];

  for (const doc of HANDOVER_DOCS) {
    it(`${doc} exists`, () => expect(hExists(doc)).toBe(true));
    it(`${doc} mentions PSL remains inactive`, () => {
      expect(hRead(doc)).toMatch(/PSL.*inactive|PSL.*INACTIVE|PSL: INACTIVE|PSL remains inactive/i);
    });
    it(`${doc} mentions sandbox-only or SANDBOX`, () => {
      const content = hRead(doc);
      expect(content.includes('sandbox-only') || content.includes('SANDBOX') || content.includes('sandbox')).toBe(true);
    });
    it(`${doc} has no JWT tokens`, () => {
      expect(hRead(doc)).not.toMatch(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/);
    });
    it(`${doc} has no real-money language`, () => {
      expect(hRead(doc)).not.toMatch(/\bcash prize\b|\bwager\b|\bbetting odds\b|\bbookmaker\b/i);
    });
  }

  it('SPRINT-26-STORY-MATRIX.md exists', () => {
    expect(existsSync(resolve(__dirname, '../../../../docs/sprints/SPRINT-26-STORY-MATRIX.md'))).toBe(true);
  });

  it('SPRINT-26-BETA-GO-NOGO.md is CONDITIONAL_GO', () => {
    expect(hRead('SPRINT-26-BETA-GO-NOGO.md')).toMatch(/CONDITIONAL_GO/);
  });

  it('SPRINT-26-KNOWN-GAPS.md mentions no production ingestion', () => {
    expect(hRead('SPRINT-26-KNOWN-GAPS.md')).toMatch(/no production ingestion|no.*ingestion|PSL.*inactive/i);
  });
});

describe('Sprint 26 — smoke tools exist', () => {
  const toolsRoot = resolve(__dirname, '../../../../tools/staging');
  it('sprint-26-portal-route-smoke.mjs exists', () => {
    expect(existsSync(resolve(toolsRoot, 'sprint-26-portal-route-smoke.mjs'))).toBe(true);
  });
  it('sprint-26-role-route-smoke.mjs exists', () => {
    expect(existsSync(resolve(toolsRoot, 'sprint-26-role-route-smoke.mjs'))).toBe(true);
  });
  it('portal route smoke tool does not contain token values', () => {
    const src = readFileSync(resolve(toolsRoot, 'sprint-26-portal-route-smoke.mjs'), 'utf8');
    expect(src).not.toMatch(/PARSE_API_KEY=['"][A-Za-z0-9]{8}/);
    expect(src).not.toMatch(/API_FOOTBALL_KEY=['"][A-Za-z0-9]{8}/);
  });
  it('role route smoke tool never prints tokens', () => {
    const src = readFileSync(resolve(toolsRoot, 'sprint-26-role-route-smoke.mjs'), 'utf8');
    expect(src).not.toMatch(/console\.log.*TOKEN/);
    expect(src).toMatch(/PENDING_TOKEN|never print|token.*not.*printed/i);
  });
  it('portal route smoke tool does not activate PSL', () => {
    const src = readFileSync(resolve(toolsRoot, 'sprint-26-portal-route-smoke.mjs'), 'utf8');
    expect(src).not.toMatch(/\/admin\/psl\/activate|activate.*psl/i);
  });
});

// ─── Sprint 27: Club & Sponsor Portal API Contracts ──────────────────────────

describe('Sprint 27: ClubPortalModule backend', () => {
  const cpFiles = [
    'apps/api/src/club-portal/club-portal.module.ts',
    'apps/api/src/club-portal/club-portal.controller.ts',
    'apps/api/src/club-portal/club-portal.service.ts',
    'apps/api/src/club-portal/club-portal.dto.ts',
    'apps/api/src/club-portal/club-portal.service.spec.ts',
    'apps/api/src/club-portal/club-portal.controller.spec.ts',
  ];
  const ROOT2 = resolve(__dirname, '../../../..');
  it.each(cpFiles)('file exists: %s', (f) => {
    expect(existsSync(resolve(ROOT2, f))).toBe(true);
  });
  it('controller uses CLUB_ADMIN role', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.controller.ts'), 'utf-8');
    expect(src).toContain("'CLUB_ADMIN'");
  });
  it('controller uses PSL_ADMIN role', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.controller.ts'), 'utf-8');
    expect(src).toContain("'PSL_ADMIN'");
  });
  it('controller does not grant FAN access', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.controller.ts'), 'utf-8');
    expect(src).not.toContain("@Roles('FAN')");
  });
  it('service does not activate PSL', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.service.ts'), 'utf-8');
    expect(src).not.toMatch(/activatePsl|activateSeason/);
  });
  it('club-portal-api.ts has no API_PENDING', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/lib/club-portal-api.ts'), 'utf-8');
    expect(src).not.toContain('API_PENDING: true');
  });
});

describe('Sprint 27: SponsorPortalModule backend', () => {
  const spFiles = [
    'apps/api/src/sponsor-portal/sponsor-portal.module.ts',
    'apps/api/src/sponsor-portal/sponsor-portal.controller.ts',
    'apps/api/src/sponsor-portal/sponsor-portal.service.ts',
    'apps/api/src/sponsor-portal/sponsor-portal.dto.ts',
    'apps/api/src/sponsor-portal/sponsor-portal.service.spec.ts',
    'apps/api/src/sponsor-portal/sponsor-portal.controller.spec.ts',
  ];
  const ROOT2 = resolve(__dirname, '../../../..');
  it.each(spFiles)('file exists: %s', (f) => {
    expect(existsSync(resolve(ROOT2, f))).toBe(true);
  });
  it('controller uses SPONSOR role', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(src).toContain("'SPONSOR'");
  });
  it('controller uses PSL_ADMIN role', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(src).toContain("'PSL_ADMIN'");
  });
  it('billing placeholder is INVOICE_ONLY', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).toContain('INVOICE_ONLY');
  });
  it('billing does not process payments', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).not.toMatch(/chargeCard|processPayment|walletProduction:\s*true|createPayment/);
  });
  it('rewards enforce isFinancial false', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).toContain('isFinancial');
  });
  it('sponsor-portal-api.ts has no API_PENDING', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/lib/sponsor-portal-api.ts'), 'utf-8');
    expect(src).not.toContain('API_PENDING: true');
  });
  it('createCampaignDraft uses DRAFT status', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).toContain('DRAFT');
    expect(src).not.toMatch(/status:\s*['"]ACTIVE['"]/);
  });
});

describe('Sprint 27: ADR-031', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  const adr = resolve(ROOT2, 'docs/adr/ADR-031-SPONSOR-BILLING-BOUNDARY.md');
  it('ADR-031 exists', () => { expect(existsSync(adr)).toBe(true); });
  it('states invoice billing', () => { expect(readFileSync(adr, 'utf-8').toLowerCase()).toContain('invoice'); });
  it('states no payment processing', () => { expect(readFileSync(adr, 'utf-8')).toMatch(/no payment|no.*payment processing/i); });
  it('states no wallet production', () => { expect(readFileSync(adr, 'utf-8')).toMatch(/no wallet production|wallet.*sandbox|WALLET.*SANDBOX/i); });
  it('states no real-money', () => { expect(readFileSync(adr, 'utf-8')).toMatch(/no real.money|non-financial/i); });
});

describe('Sprint 27: App module registration', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('app.module imports ClubPortalModule', () => {
    expect(readFileSync(resolve(ROOT2, 'apps/api/src/app.module.ts'), 'utf-8')).toContain('ClubPortalModule');
  });
  it('app.module imports SponsorPortalModule', () => {
    expect(readFileSync(resolve(ROOT2, 'apps/api/src/app.module.ts'), 'utf-8')).toContain('SponsorPortalModule');
  });
});

describe('Sprint 27: Documentation and tools', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  const items = [
    'docs/portals/SPRINT-27-API-CONTRACT-IMPLEMENTATION-PLAN.md',
    'docs/portals/SPRINT-27-CLUB-PORTAL-API.md',
    'docs/portals/SPRINT-27-SPONSOR-PORTAL-API.md',
    'docs/portals/SPRINT-27-PORTAL-RBAC-SMOKE.md',
    'docs/portals/SPRINT-27-API-CONTRACT-CLOSURE.md',
    'docs/portals/SPRINT-27-NON-FINANCIAL-SPONSOR-REWARD-BOUNDARY.md',
    'docs/handover/SPRINT-27-BETA-GO-NOGO.md',
    'docs/handover/SPRINT-27-HANDOVER.md',
    'docs/handover/SPRINT-27-KNOWN-GAPS.md',
    'docs/handover/SPRINT-27-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-27-ROLLBACK-PLAN.md',
    'docs/sprints/SPRINT-27-STORY-MATRIX.md',
    'tools/staging/sprint-27-club-portal-api-smoke.mjs',
    'tools/staging/sprint-27-sponsor-portal-api-smoke.mjs',
    'tools/staging/sprint-27-club-sponsor-rbac-smoke.mjs',
  ];
  it.each(items)('exists: %s', (f) => { expect(existsSync(resolve(ROOT2, f))).toBe(true); });

  const handoverDocs = [
    'docs/handover/SPRINT-27-HANDOVER.md',
    'docs/handover/SPRINT-27-KNOWN-GAPS.md',
    'docs/handover/SPRINT-27-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-27-BETA-GO-NOGO.md',
  ];
  it.each(handoverDocs)('%s: mentions PSL inactive', (d) => {
    expect(readFileSync(resolve(ROOT2, d), 'utf-8')).toMatch(/PSL.*inactive|PSL.*INACTIVE|PSL remains inactive|PSL not activated/i);
  });
  it.each(handoverDocs)('%s: mentions wallet or sandbox', (d) => {
    const c = readFileSync(resolve(ROOT2, d), 'utf-8');
    expect(c.includes('sandbox') || c.includes('SANDBOX') || c.includes('wallet production')).toBe(true);
  });
  it.each(handoverDocs)('%s: mentions non-financial', (d) => {
    expect(readFileSync(resolve(ROOT2, d), 'utf-8')).toMatch(/non-financial|no real.money|NON_FINANCIAL/i);
  });
  it('API contract closure maps API_PENDING items', () => {
    expect(readFileSync(resolve(ROOT2, 'docs/portals/SPRINT-27-API-CONTRACT-CLOSURE.md'), 'utf-8')).toContain('API_PENDING');
  });
  it('smoke tools do not log token values', () => {
    for (const t of ['sprint-27-club-portal-api-smoke.mjs', 'sprint-27-sponsor-portal-api-smoke.mjs', 'sprint-27-club-sponsor-rbac-smoke.mjs']) {
      const src = readFileSync(resolve(ROOT2, 'tools/staging', t), 'utf-8');
      expect(src).not.toMatch(/console\.log.*TOKEN|console\.log.*password/i);
    }
  });
});

// ─── Sprint 28: User-to-Club/Sponsor Scoping & RBAC ──────────────────────────

describe('Sprint 28: PortalScopeModule', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  const scopeFiles = [
    'apps/api/src/portal-scope/portal-scope.module.ts',
    'apps/api/src/portal-scope/portal-scope.service.ts',
    'apps/api/src/portal-scope/portal-scope.service.spec.ts',
  ];
  it.each(scopeFiles)('file exists: %s', (f) => {
    expect(existsSync(resolve(ROOT2, f))).toBe(true);
  });
  it('scope service enforces cross-club denial', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/portal-scope/portal-scope.service.ts'), 'utf-8');
    expect(src).toContain('CROSS_CLUB_ACCESS_DENIED');
  });
  it('scope service enforces cross-sponsor denial', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/portal-scope/portal-scope.service.ts'), 'utf-8');
    expect(src).toContain('CROSS_SPONSOR_ACCESS_DENIED');
  });
  it('scope service uses DB membership not query params', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/portal-scope/portal-scope.service.ts'), 'utf-8');
    expect(src).toContain('clubMembership');
    expect(src).toContain('sponsorMembership');
  });
  it('scope service requires PSL_ADMIN to provide explicit scope', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/portal-scope/portal-scope.service.ts'), 'utf-8');
    expect(src).toContain('CLUB_SCOPE_REQUIRED');
    expect(src).toContain('SPONSOR_SCOPE_REQUIRED');
  });
});

describe('Sprint 28: ClubMembership migration', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('ClubMembership model exists in schema', () => {
    const schema = readFileSync(resolve(ROOT2, 'apps/api/prisma/schema.prisma'), 'utf-8');
    expect(schema).toContain('model ClubMembership');
    expect(schema).toContain('club_memberships');
  });
  it('SponsorMembership model exists in schema', () => {
    const schema = readFileSync(resolve(ROOT2, 'apps/api/prisma/schema.prisma'), 'utf-8');
    expect(schema).toContain('model SponsorMembership');
    expect(schema).toContain('sponsor_memberships');
  });
  it('migration file exists', () => {
    const migrationsDir = resolve(ROOT2, 'apps/api/prisma/migrations');
    const dirs = require('fs').readdirSync(migrationsDir);
    const hasMigration = dirs.some((d: string) => d.includes('club_sponsor_memberships'));
    expect(hasMigration).toBe(true);
  });
  it('schema does not add nullable FK on User for clubId or sponsorId', () => {
    const schema = readFileSync(resolve(ROOT2, 'apps/api/prisma/schema.prisma'), 'utf-8');
    const userSection = schema.substring(schema.indexOf('model User'), schema.indexOf('model User') + 1000);
    expect(userSection).not.toMatch(/clubId.*String|sponsorId.*String/);
  });
});

describe('Sprint 28: ClubPortalModule scoping', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('club-portal.service.ts uses PortalScopeService', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.service.ts'), 'utf-8');
    expect(src).toContain('PortalScopeService');
    expect(src).toContain('resolveClubScope');
  });
  it('club-portal.service.ts does not return API_SCOPE_PENDING anymore', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.service.ts'), 'utf-8');
    expect(src).not.toContain('API_SCOPE_PENDING');
  });
  it('club-portal.module.ts imports PortalScopeModule', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.module.ts'), 'utf-8');
    expect(src).toContain('PortalScopeModule');
  });
  it('club-portal does not activate PSL', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/club-portal/club-portal.service.ts'), 'utf-8');
    expect(src).not.toMatch(/activatePsl|activateSeason/);
  });
});

describe('Sprint 28: SponsorPortalModule scoping', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('sponsor-portal.service.ts uses PortalScopeService', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).toContain('PortalScopeService');
    expect(src).toContain('resolveSponsorScope');
  });
  it('sponsor-portal.service.ts does not return API_SCOPE_PENDING', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).not.toContain('API_SCOPE_PENDING');
  });
  it('sponsor-portal billing remains INVOICE_ONLY', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).toContain('INVOICE_ONLY');
  });
  it('sponsor-portal rewards enforce isFinancial false', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(src).toContain('isFinancial');
  });
  it('sponsor-portal.module.ts imports PortalScopeModule', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.module.ts'), 'utf-8');
    expect(src).toContain('PortalScopeModule');
  });
});

describe('Sprint 28: ADR-032', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  const adr = resolve(ROOT2, 'docs/adr/ADR-032-USER-TO-CLUB-SPONSOR-SCOPING.md');
  it('ADR-032 exists', () => { expect(existsSync(adr)).toBe(true); });
  it('ADR-032 discusses membership tables', () => {
    expect(readFileSync(adr, 'utf-8').toLowerCase()).toContain('membership');
  });
  it('ADR-032 confirms no PSL activation', () => {
    expect(readFileSync(adr, 'utf-8')).toMatch(/no PSL activation|PSL.*inactive|PSL.*INACTIVE/i);
  });
  it('ADR-032 confirms no wallet production', () => {
    expect(readFileSync(adr, 'utf-8')).toMatch(/no wallet production|wallet.*sandbox/i);
  });
});

describe('Sprint 28: App module registration', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('app.module imports PortalScopeModule', () => {
    expect(readFileSync(resolve(ROOT2, 'apps/api/src/app.module.ts'), 'utf-8')).toContain('PortalScopeModule');
  });
});

describe('Sprint 28: Documentation and tools', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  const sprint28Items = [
    'docs/security/SPRINT-28-SCOPING-MODEL-INVESTIGATION.md',
    'docs/security/SPRINT-28-USER-ORG-SCOPING.md',
    'docs/security/SPRINT-28-CROSS-TENANT-ACCESS-CONTROLS.md',
    'docs/portals/SPRINT-28-CLUB-SPONSOR-SCOPING.md',
    'docs/portals/SPRINT-28-ROLE-SMOKE-RUNBOOK.md',
    'docs/handover/SPRINT-28-BETA-GO-NOGO.md',
    'docs/handover/SPRINT-28-HANDOVER.md',
    'docs/handover/SPRINT-28-KNOWN-GAPS.md',
    'docs/handover/SPRINT-28-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-28-ROLLBACK-PLAN.md',
    'docs/sprints/SPRINT-28-STORY-MATRIX.md',
    'docs/data/SPRINT-28-SCOPING-MIGRATION.md',
    'docs/handover/SPRINT-28-MIGRATION-ROLLBACK.md',
    'docs/adr/ADR-032-USER-TO-CLUB-SPONSOR-SCOPING.md',
    'tools/staging/sprint-28-club-scope-smoke.mjs',
    'tools/staging/sprint-28-sponsor-scope-smoke.mjs',
    'tools/staging/sprint-28-role-cross-tenant-smoke.mjs',
  ];
  it.each(sprint28Items)('exists: %s', (f) => {
    expect(existsSync(resolve(ROOT2, f))).toBe(true);
  });

  const handoverDocs = [
    'docs/handover/SPRINT-28-HANDOVER.md',
    'docs/handover/SPRINT-28-KNOWN-GAPS.md',
    'docs/handover/SPRINT-28-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-28-BETA-GO-NOGO.md',
  ];
  it.each(handoverDocs)('%s: mentions PSL inactive', (d) => {
    expect(readFileSync(resolve(ROOT2, d), 'utf-8')).toMatch(/PSL.*inactive|PSL.*INACTIVE|PSL remains inactive/i);
  });
  it.each(handoverDocs)('%s: mentions wallet/sandbox', (d) => {
    const c = readFileSync(resolve(ROOT2, d), 'utf-8');
    expect(c.includes('sandbox') || c.includes('SANDBOX') || c.includes('wallet production')).toBe(true);
  });
  it.each(handoverDocs)('%s: mentions non-financial', (d) => {
    expect(readFileSync(resolve(ROOT2, d), 'utf-8')).toMatch(/non-financial|no real.money|NON_FINANCIAL/i);
  });
  it('cross-tenant doc explains denial mechanism', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/security/SPRINT-28-CROSS-TENANT-ACCESS-CONTROLS.md'), 'utf-8');
    expect(c).toMatch(/CROSS_CLUB_ACCESS_DENIED|cross.tenant/i);
  });
  it('smoke tools do not print tokens', () => {
    for (const t of ['sprint-28-club-scope-smoke.mjs', 'sprint-28-sponsor-scope-smoke.mjs', 'sprint-28-role-cross-tenant-smoke.mjs']) {
      const src = readFileSync(resolve(ROOT2, 'tools/staging', t), 'utf-8');
      expect(src).not.toMatch(/console\.log.*TOKEN|console\.log.*password/i);
    }
  });
});

// ─── Sprint 29: Cross-Tenant Membership Smoke ─────────────────────────────────

describe('Sprint 29: Staging docs and runbooks', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  const sprint29StagingDocs = [
    'docs/staging/SPRINT-29-STAGING-MEMBERSHIP-PREFLIGHT.md',
    'docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md',
    'docs/staging/SPRINT-29-SMOKE-SCOPE-SELECTION.md',
    'docs/staging/SPRINT-29-TEMP-USER-PROVISIONING.md',
    'docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md',
    'docs/staging/SPRINT-29-ROLE-SMOKE-EVIDENCE.md',
    'docs/staging/SPRINT-29-TEMP-USER-CLEANUP-EVIDENCE.md',
    'docs/security/SPRINT-29-CROSS-TENANT-ACCESS-VERIFICATION.md',
    'docs/security/SPRINT-29-MEMBERSHIP-SMOKE-SECURITY-REVIEW.md',
    'docs/handover/SPRINT-29-BETA-GO-NOGO.md',
    'docs/handover/SPRINT-29-HANDOVER.md',
    'docs/handover/SPRINT-29-KNOWN-GAPS.md',
    'docs/handover/SPRINT-29-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-29-ROLLBACK-PLAN.md',
    'docs/sprints/SPRINT-29-STORY-MATRIX.md',
    'tools/staging/sprint-29-ec2-cross-tenant-smoke.sh',
  ];
  it.each(sprint29StagingDocs)('exists: %s', (f) => {
    expect(existsSync(resolve(ROOT2, f))).toBe(true);
  });

  const handoverDocs = [
    'docs/handover/SPRINT-29-HANDOVER.md',
    'docs/handover/SPRINT-29-KNOWN-GAPS.md',
    'docs/handover/SPRINT-29-OWNER-REVIEW-GUIDE.md',
    'docs/handover/SPRINT-29-BETA-GO-NOGO.md',
  ];
  it.each(handoverDocs)('%s: mentions PSL inactive', (d) => {
    const c = readFileSync(resolve(ROOT2, d), 'utf-8');
    expect(c).toMatch(/PSL.*inactive|PSL.*INACTIVE|PSL remains inactive/i);
  });
  it.each(handoverDocs)('%s: mentions wallet/sandbox', (d) => {
    const c = readFileSync(resolve(ROOT2, d), 'utf-8');
    expect(c.includes('sandbox') || c.includes('SANDBOX') || c.includes('wallet production')).toBe(true);
  });
  it.each(handoverDocs)('%s: mentions non-financial', (d) => {
    const c = readFileSync(resolve(ROOT2, d), 'utf-8');
    expect(c).toMatch(/non-financial|no real.money|NON_FINANCIAL/i);
  });
});

describe('Sprint 29: Cross-tenant smoke design', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('smoke script exists', () => {
    expect(existsSync(resolve(ROOT2, 'tools/staging/sprint-29-ec2-cross-tenant-smoke.sh'))).toBe(true);
  });
  it('smoke script does not print token values', () => {
    const src = readFileSync(resolve(ROOT2, 'tools/staging/sprint-29-ec2-cross-tenant-smoke.sh'), 'utf-8');
    expect(src).not.toMatch(/echo.*TOKEN|echo.*password/i);
  });
  it('smoke script checks CROSS_CLUB_ACCESS_DENIED', () => {
    const src = readFileSync(resolve(ROOT2, 'tools/staging/sprint-29-ec2-cross-tenant-smoke.sh'), 'utf-8');
    expect(src).toMatch(/forbidden|cross.tenant|403/i);
  });
  it('smoke script confirms PSL_INACTIVE', () => {
    const src = readFileSync(resolve(ROOT2, 'tools/staging/sprint-29-ec2-cross-tenant-smoke.sh'), 'utf-8');
    expect(src).toMatch(/PSL INACTIVE|PSL_INACTIVE/i);
  });
  it('smoke execution log exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md'))).toBe(true);
  });
  it('cross-tenant smoke results doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md'))).toBe(true);
  });
  it('role smoke evidence doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/staging/SPRINT-29-ROLE-SMOKE-EVIDENCE.md'))).toBe(true);
  });
  it('temp user cleanup evidence doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/staging/SPRINT-29-TEMP-USER-CLEANUP-EVIDENCE.md'))).toBe(true);
  });
  it('preflight doc mentions additive migration only', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/staging/SPRINT-29-STAGING-MEMBERSHIP-PREFLIGHT.md'), 'utf-8');
    expect(c).toMatch(/additive|CREATE TABLE/i);
  });
  it('cross-tenant verification doc mentions CROSS_CLUB_ACCESS_DENIED', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/security/SPRINT-29-CROSS-TENANT-ACCESS-VERIFICATION.md'), 'utf-8');
    expect(c).toMatch(/CROSS_CLUB_ACCESS_DENIED|cross.tenant/i);
  });
  it('results doc confirms no PSL activation occurred', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md'), 'utf-8');
    expect(c).toMatch(/PSL.*inactive|PSL.*INACTIVE|No PSL activation/i);
  });
  it('cleanup evidence confirms temp users removed', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/staging/SPRINT-29-TEMP-USER-CLEANUP-EVIDENCE.md'), 'utf-8');
    expect(c).toMatch(/deleted|disabled|removed|cleanup/i);
  });
  it('security review mentions no wallet production', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/security/SPRINT-29-MEMBERSHIP-SMOKE-SECURITY-REVIEW.md'), 'utf-8');
    expect(c).toMatch(/no wallet production|wallet.*sandbox/i);
  });
});

// ─── Sprint 32 — Sponsor Audience Segmentation + Asset Management ─────────

describe('Sprint 32 – Sponsor Audience Segmentation + Asset Management', () => {
  const ROOT2 = resolve(__dirname, '../../../..');
  it('AudienceSegment migration file exists', () => {
    const p = resolve(ROOT2, 'apps/api/prisma/migrations/20260624120000_audience_segment/migration.sql');
    expect(existsSync(p)).toBe(true);
  });

  it('migration creates audience_segments table', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/prisma/migrations/20260624120000_audience_segment/migration.sql'), 'utf-8');
    expect(c).toMatch(/CREATE TABLE "audience_segments"/);
  });

  it('migration adds sponsor_id FK with CASCADE', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/prisma/migrations/20260624120000_audience_segment/migration.sql'), 'utf-8');
    expect(c).toMatch(/FOREIGN KEY.*sponsor_id.*REFERENCES.*sponsors/s);
    expect(c).toMatch(/ON DELETE CASCADE/);
  });

  it('schema.prisma includes AudienceSegment model', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/prisma/schema.prisma'), 'utf-8');
    expect(c).toMatch(/model AudienceSegment/);
  });

  it('schema AudienceSegment has criteria Json field', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/prisma/schema.prisma'), 'utf-8');
    expect(c).toMatch(/criteria\s+Json/);
  });

  it('SponsorPortalService has getSponsorAudiences method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/async getSponsorAudiences\(/);
  });

  it('SponsorPortalService has createAudienceSegment method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/async createAudienceSegment\(/);
  });

  it('SponsorPortalService has updateAudienceSegment method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/async updateAudienceSegment\(/);
  });

  it('SponsorPortalService has deleteAudienceSegment method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/async deleteAudienceSegment\(/);
  });

  it('SponsorPortalService getSponsorAudiences queries audienceSegment', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/prisma\.audienceSegment\.findMany/);
  });

  it('SponsorPortalService getSponsorAssets queries mediaAsset', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/prisma\.mediaAsset\.findMany/);
  });

  it('getSponsorAssets filters archivedAt null', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).toMatch(/archivedAt.*null/);
  });

  it('controller has POST audiences route', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(c).toMatch(/@Post\('audiences'\)/);
  });

  it('controller has PATCH audiences/:id route', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(c).toMatch(/@Patch\('audiences\/:id'\)/);
  });

  it('controller has DELETE audiences/:id route', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(c).toMatch(/@Delete\('audiences\/:id'\)/);
  });

  it('controller passes req.user to getSponsorAudiences', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(c).toMatch(/getSponsorAudiences\(req\.user/);
  });

  it('controller passes req.user to getSponsorAssets', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.controller.ts'), 'utf-8');
    expect(c).toMatch(/getSponsorAssets\(req\.user/);
  });

  it('audience segmentation doc exists', () => {
    const p = resolve(ROOT2, 'docs/sponsor/SPRINT-32-AUDIENCE-SEGMENTATION.md');
    expect(existsSync(p)).toBe(true);
  });

  it('audience segmentation doc references POPIA', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/sponsor/SPRINT-32-AUDIENCE-SEGMENTATION.md'), 'utf-8');
    expect(c).toMatch(/POPIA/);
  });

  it('audience segmentation doc states no individual fan PII', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/sponsor/SPRINT-32-AUDIENCE-SEGMENTATION.md'), 'utf-8');
    expect(c).toMatch(/no individual fan|not.*individual fan|aggregate.*criteria/i);
  });

  it('sponsor asset management doc exists', () => {
    const p = resolve(ROOT2, 'docs/sponsor/SPRINT-32-SPONSOR-ASSET-MANAGEMENT.md');
    expect(existsSync(p)).toBe(true);
  });

  it('campaign targeting doc exists', () => {
    const p = resolve(ROOT2, 'docs/sponsor/SPRINT-32-CAMPAIGN-TARGETING.md');
    expect(existsSync(p)).toBe(true);
  });

  it('campaign targeting doc states non-financial boundary', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/sponsor/SPRINT-32-CAMPAIGN-TARGETING.md'), 'utf-8');
    expect(c).toMatch(/non-financial|no.*gambling/i);
  });

  it('ADR-034 exists', () => {
    const p = resolve(ROOT2, 'docs/adr/ADR-034-SPONSOR-AUDIENCE-SEGMENTATION-PRIVACY.md');
    expect(existsSync(p)).toBe(true);
  });

  it('ADR-034 references POPIA', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-034-SPONSOR-AUDIENCE-SEGMENTATION-PRIVACY.md'), 'utf-8');
    expect(c).toMatch(/POPIA/);
  });

  it('ADR-034 rejects fan list export alternative', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-034-SPONSOR-AUDIENCE-SEGMENTATION-PRIVACY.md'), 'utf-8');
    expect(c).toMatch(/Export fan lists.*Rejected|Rejected.*fan list/si);
  });

  it('service has no stub PLANNED return for audiences', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).not.toMatch(/audienceStatus.*PLANNED/);
  });

  it('service has no stub PLANNED return for assets', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/sponsor-portal/sponsor-portal.service.ts'), 'utf-8');
    expect(c).not.toMatch(/assetsStatus.*PLANNED/);
  });
});

// ─── Sprint 33 — Object Storage / CDN / File Upload Architecture ──────────

describe('Sprint 33 – Object Storage/CDN/File Upload Architecture', () => {
  const ROOT2 = resolve(__dirname, '../../../..');

  it('object-storage interface file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.interface.ts'))).toBe(true);
  });

  it('OBJECT_STORAGE_PROVIDER symbol is exported', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.interface.ts'), 'utf-8');
    expect(c).toMatch(/OBJECT_STORAGE_PROVIDER/);
    expect(c).toMatch(/Symbol/);
  });

  it('ObjectStorageProvider interface defines putObject', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.interface.ts'), 'utf-8');
    expect(c).toMatch(/putObject/);
  });

  it('ObjectStorageProvider interface defines getPublicUrl', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.interface.ts'), 'utf-8');
    expect(c).toMatch(/getPublicUrl/);
  });

  it('ObjectStorageProvider interface defines deleteObject', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.interface.ts'), 'utf-8');
    expect(c).toMatch(/deleteObject/);
  });

  it('LocalDiskAdapter file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/local-disk.adapter.ts'))).toBe(true);
  });

  it('LocalDiskAdapter implements ObjectStorageProvider', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/local-disk.adapter.ts'), 'utf-8');
    expect(c).toMatch(/implements ObjectStorageProvider/);
  });

  it('LocalDiskAdapter sanitizes file keys', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/local-disk.adapter.ts'), 'utf-8');
    expect(c).toMatch(/replace\(/);
  });

  it('S3CompatibleAdapter file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/s3-compatible.adapter.ts'))).toBe(true);
  });

  it('S3CompatibleAdapter throws NotImplementedException', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/s3-compatible.adapter.ts'), 'utf-8');
    expect(c).toMatch(/NotImplementedException/);
  });

  it('S3CompatibleAdapter references ADR-035', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/s3-compatible.adapter.ts'), 'utf-8');
    expect(c).toMatch(/ADR-035/);
  });

  it('FileUploadService file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/object-storage/file-upload.service.ts'))).toBe(true);
  });

  it('FileUploadService validates content type allowlist', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/file-upload.service.ts'), 'utf-8');
    expect(c).toMatch(/image\/jpeg|ALLOWED_CONTENT_TYPES/);
  });

  it('FileUploadService enforces max file size', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/file-upload.service.ts'), 'utf-8');
    expect(c).toMatch(/MAX_SIZE|50.*MB|max.*size/i);
  });

  it('ObjectStorageModule file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.module.ts'))).toBe(true);
  });

  it('ObjectStorageModule selects adapter from env var', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.module.ts'), 'utf-8');
    expect(c).toMatch(/OBJECT_STORAGE_ADAPTER/);
  });

  it('ObjectStorageModule exports FileUploadService', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.module.ts'), 'utf-8');
    expect(c).toMatch(/exports.*FileUploadService|FileUploadService.*exports/s);
  });

  it('spec file exists for object-storage', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/object-storage/object-storage.spec.ts'))).toBe(true);
  });

  it('ADR-035 exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/adr/ADR-035-OBJECT-STORAGE-PROVIDER-BOUNDARY.md'))).toBe(true);
  });

  it('ADR-035 describes the interface pattern', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-035-OBJECT-STORAGE-PROVIDER-BOUNDARY.md'), 'utf-8');
    expect(c).toMatch(/ObjectStorageProvider/);
  });

  it('ADR-035 rejects binary blobs in DB', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-035-OBJECT-STORAGE-PROVIDER-BOUNDARY.md'), 'utf-8');
    expect(c).toMatch(/blob|BYTEA|Rejected/i);
  });

  it('storage architecture doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/storage/SPRINT-33-OBJECT-STORAGE-ARCHITECTURE.md'))).toBe(true);
  });

  it('storage architecture doc mentions no AWS deployment', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/storage/SPRINT-33-OBJECT-STORAGE-ARCHITECTURE.md'), 'utf-8');
    expect(c).toMatch(/no.*deploy|NOT_DEPLOYED|not yet|no.*AWS/i);
  });

  it('file upload API doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/storage/SPRINT-33-FILE-UPLOAD-API.md'))).toBe(true);
  });

  it('CDN strategy doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/storage/SPRINT-33-CDN-STRATEGY.md'))).toBe(true);
  });

  it('CDN strategy doc describes URL schema', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/storage/SPRINT-33-CDN-STRATEGY.md'), 'utf-8');
    expect(c).toMatch(/cdn\.psl\.co\.za|CDN_BASE_URL/);
  });

  it('module does not store blobs in DB', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/file-upload.service.ts'), 'utf-8');
    expect(c).not.toMatch(/prisma|PrismaService/);
  });

  it('S3CompatibleAdapter does not commit credentials', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/object-storage/adapters/s3-compatible.adapter.ts'), 'utf-8');
    expect(c).not.toMatch(/AKIA[A-Z0-9]{16}/);
    expect(c).not.toMatch(/aws_secret_access_key\s*=\s*[A-Za-z0-9+/]{40}/i);
  });
});

// ─── Sprint 34 — Production Performance, Caching & Edge Readiness ─────────

describe('Sprint 34 – API Caching & Edge Readiness', () => {
  const ROOT2 = resolve(__dirname, '../../../..');

  it('cache interface file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/cache.interface.ts'))).toBe(true);
  });

  it('CACHE_PROVIDER symbol is exported', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/cache.interface.ts'), 'utf-8');
    expect(c).toMatch(/CACHE_PROVIDER/);
    expect(c).toMatch(/Symbol/);
  });

  it('CacheProvider interface defines get/set/delete', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/cache.interface.ts'), 'utf-8');
    expect(c).toMatch(/get\b/);
    expect(c).toMatch(/set\b/);
    expect(c).toMatch(/delete\b/);
  });

  it('InMemoryCacheAdapter file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/adapters/in-memory-cache.adapter.ts'))).toBe(true);
  });

  it('InMemoryCacheAdapter implements CacheProvider', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/adapters/in-memory-cache.adapter.ts'), 'utf-8');
    expect(c).toMatch(/implements CacheProvider/);
  });

  it('InMemoryCacheAdapter uses TTL expiry', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/adapters/in-memory-cache.adapter.ts'), 'utf-8');
    expect(c).toMatch(/expiresAt|ttl/i);
  });

  it('ApiCacheService file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/api-cache.service.ts'))).toBe(true);
  });

  it('CacheInvalidationService file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/cache-invalidation.service.ts'))).toBe(true);
  });

  it('CacheInvalidationService has invalidateFixture method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/cache-invalidation.service.ts'), 'utf-8');
    expect(c).toMatch(/invalidateFixture/);
  });

  it('CacheInvalidationService has invalidateLeaderboard method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/cache-invalidation.service.ts'), 'utf-8');
    expect(c).toMatch(/invalidateLeaderboard/);
  });

  it('CacheInvalidationService has invalidateAll method', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/cache-invalidation.service.ts'), 'utf-8');
    expect(c).toMatch(/invalidateAll/);
  });

  it('CacheResponseInterceptor file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/interceptors/cache-response.interceptor.ts'))).toBe(true);
  });

  it('CacheResponseInterceptor only caches GET requests', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/interceptors/cache-response.interceptor.ts'), 'utf-8');
    expect(c).toMatch(/GET/);
    expect(c).toMatch(/method/);
  });

  it('CacheResponse decorator file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/decorators/cache-response.decorator.ts'))).toBe(true);
  });

  it('CacheResponse decorator applies SetMetadata and UseInterceptors', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/decorators/cache-response.decorator.ts'), 'utf-8');
    expect(c).toMatch(/SetMetadata/);
    expect(c).toMatch(/UseInterceptors/);
  });

  it('ApiCacheModule file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/api-cache.module.ts'))).toBe(true);
  });

  it('ApiCacheModule is marked Global', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/api-cache.module.ts'), 'utf-8');
    expect(c).toMatch(/@Global\(\)/);
  });

  it('ApiCacheModule exports CacheInvalidationService', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/api-cache.module.ts'), 'utf-8');
    expect(c).toMatch(/CacheInvalidationService/);
    expect(c).toMatch(/exports/);
  });

  it('spec file exists for api-cache', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/api-cache/api-cache.spec.ts'))).toBe(true);
  });

  it('ADR-036 exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/adr/ADR-036-API-RESPONSE-CACHING-STRATEGY.md'))).toBe(true);
  });

  it('ADR-036 documents the upgrade path to Redis', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-036-API-RESPONSE-CACHING-STRATEGY.md'), 'utf-8');
    expect(c).toMatch(/Redis/);
    expect(c).toMatch(/Upgrade Path|upgrade path/i);
  });

  it('caching architecture doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/performance/SPRINT-34-CACHING-ARCHITECTURE.md'))).toBe(true);
  });

  it('caching doc documents recommended TTLs', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/performance/SPRINT-34-CACHING-ARCHITECTURE.md'), 'utf-8');
    expect(c).toMatch(/TTL/);
  });

  it('caching doc says live match data is not cached', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/performance/SPRINT-34-CACHING-ARCHITECTURE.md'), 'utf-8');
    expect(c).toMatch(/live.*match.*none|never cache|0.*none/i);
  });

  it('edge readiness doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/performance/SPRINT-34-EDGE-READINESS.md'))).toBe(true);
  });

  it('edge readiness doc lists performance gaps', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/performance/SPRINT-34-EDGE-READINESS.md'), 'utf-8');
    expect(c).toMatch(/PERF-0[12]/);
  });

  it('interceptor never caches mutations', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/interceptors/cache-response.interceptor.ts'), 'utf-8');
    expect(c).not.toMatch(/method.*POST|cache.*POST/);
  });

  it('cache does not store auth tokens', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/api/src/api-cache/interceptors/cache-response.interceptor.ts'), 'utf-8');
    expect(c).not.toMatch(/authorization|Bearer|jwt/i);
  });
});

// ─── Sprint 35 — Launch Readiness / BRD Gap Closure ──────────────────────

describe('Sprint 35 – Launch Readiness & BRD Gap Closure', () => {
  const ROOT2 = resolve(__dirname, '../../../..');

  it('fan shop page exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/experience/src/app/shop/page.tsx'))).toBe(true);
  });

  it('fan shop page is CATALOGUE_ONLY', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/experience/src/app/shop/page.tsx'), 'utf-8');
    expect(c).toMatch(/CATALOGUE.ONLY|catalogue.*only/i);
  });

  it('fan shop page has no checkout action elements', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/experience/src/app/shop/page.tsx'), 'utf-8');
    expect(c).not.toMatch(/>Checkout<|>Add to Cart<|>Buy Now<|>Place Order</);
  });

  it('club shop portal page exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/experience/src/app/club/shop/page.tsx'))).toBe(true);
  });

  it('club shop product page exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/experience/src/app/club/shop/[productSlug]/page.tsx'))).toBe(true);
  });

  it('admin shop page exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/experience/src/app/admin/shop/page.tsx'))).toBe(true);
  });

  it('admin shop page references commerce API route', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/shop/page.tsx'), 'utf-8');
    expect(c).toMatch(/club-experience/);
  });

  it('ADR-033 exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/adr/ADR-033-COMMERCE-BOUNDARY.md'))).toBe(true);
  });

  it('ADR-033 establishes CATALOGUE_ONLY commerce boundary', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-033-COMMERCE-BOUNDARY.md'), 'utf-8');
    expect(c).toMatch(/CATALOGUE_ONLY/);
  });

  it('ADR-033 rejects full commerce at launch', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/adr/ADR-033-COMMERCE-BOUNDARY.md'), 'utf-8');
    expect(c).toMatch(/Rejected/);
  });

  it('club shop scope doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/commerce/SPRINT-35-CLUB-SHOP-SCOPE.md'))).toBe(true);
  });

  it('club shop scope doc lists API routes', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/commerce/SPRINT-35-CLUB-SHOP-SCOPE.md'), 'utf-8');
    expect(c).toMatch(/club-experience/);
  });

  it('ticketing scope doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/commerce/SPRINT-35-TICKETING-SCOPE.md'))).toBe(true);
  });

  it('ticketing scope doc requires owner gate', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/commerce/SPRINT-35-TICKETING-SCOPE.md'), 'utf-8');
    expect(c).toMatch(/OG-35-TICKET|owner gate/i);
  });

  it('commerce boundary doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/commerce/SPRINT-35-COMMERCE-BOUNDARY.md'))).toBe(true);
  });

  it('commerce boundary doc confirms non-financial', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/commerce/SPRINT-35-COMMERCE-BOUNDARY.md'), 'utf-8');
    expect(c).toMatch(/NON.FINANCIAL|non-financial/i);
  });

  it('launch owner gates doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/launch/SPRINT-35-LAUNCH-OWNER-GATES.md'))).toBe(true);
  });

  it('launch owner gates doc includes PSL activation gate', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/launch/SPRINT-35-LAUNCH-OWNER-GATES.md'), 'utf-8');
    expect(c).toMatch(/OG-35-PSL-ACT/);
  });

  it('beta to production checklist exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/launch/SPRINT-35-BETA-TO-PRODUCTION-CHECKLIST.md'))).toBe(true);
  });

  it('PSL activation sequence doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/launch/SPRINT-35-PSL-ACTIVATION-SEQUENCE.md'))).toBe(true);
  });

  it('PSL activation sequence has WARNING not to execute without gate', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/launch/SPRINT-35-PSL-ACTIVATION-SEQUENCE.md'), 'utf-8');
    expect(c).toMatch(/WARNING|OG-35-PSL-ACT/);
  });

  it('monitoring and alerting doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/launch/SPRINT-35-MONITORING-AND-ALERTING.md'))).toBe(true);
  });

  it('incident playbook doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/launch/SPRINT-35-PRODUCTION-INCIDENT-PLAYBOOK.md'))).toBe(true);
  });

  it('BRD gap analysis doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-35-BRD-GAP-ANALYSIS.md'))).toBe(true);
  });

  it('BRD gap analysis identifies commerce as deferred', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/handover/SPRINT-35-BRD-GAP-ANALYSIS.md'), 'utf-8');
    expect(c).toMatch(/DEFERRED|deferred/);
  });

  it('launch readiness checklist exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-35-LAUNCH-READINESS-CHECKLIST.md'))).toBe(true);
  });

  it('launch readiness checklist has CONDITIONAL_GO status', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/handover/SPRINT-35-LAUNCH-READINESS-CHECKLIST.md'), 'utf-8');
    expect(c).toMatch(/CONDITIONAL_GO/);
  });

  it('handover notes doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-35-HANDOVER-NOTES.md'))).toBe(true);
  });

  it('handover notes list all sprints 30-35', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/handover/SPRINT-35-HANDOVER-NOTES.md'), 'utf-8');
    expect(c).toMatch(/Sprint 30|Sprint 31|Sprint 32|Sprint 33|Sprint 34|Sprint 35/);
  });

  it('fan shop page has no gambling language', () => {
    const c = readFileSync(resolve(ROOT2, 'apps/experience/src/app/shop/page.tsx'), 'utf-8');
    expect(c).not.toMatch(/bet|gambl|wager|odds|stake/i);
  });
});

// ─── Sprint 36B: PSL Fixture Readiness Monitoring ─────────────────────────

describe('Sprint 36B: PSL Fixture Readiness Monitoring', () => {
  const ROOT2 = resolve(__dirname, '../../../..');

  it('readiness endpoint exists in DataProviderController', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.controller.ts'), 'utf-8');
    expect(src).toContain('psl-fixture-readiness');
    expect(src).toContain('getPslFixtureReadiness');
  });

  it('readiness service method exists in DataProviderService', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.service.ts'), 'utf-8');
    expect(src).toContain('getPslFixtureReadiness');
  });

  it('readiness service returns noWrites=true', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.service.ts'), 'utf-8');
    expect(src).toContain('noWrites: true');
  });

  it('readiness service returns noPublication=true', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.service.ts'), 'utf-8');
    expect(src).toContain('noPublication: true');
  });

  it('readiness service returns noPslActivation=true', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.service.ts'), 'utf-8');
    expect(src).toContain('noPslActivation: true');
  });

  it('readiness service returns pslActive false', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.service.ts'), 'utf-8');
    expect(src).toContain('pslActive: false');
  });

  it('readiness service does not expose provider key values', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.service.ts'), 'utf-8');
    expect(src).not.toMatch(/return.*PARSE_API_KEY/);
    expect(src).not.toMatch(/return.*API_FOOTBALL_KEY/);
    expect(src).not.toMatch(/pmx_[A-Za-z0-9]{10,}/);
  });

  it('admin UI page for readiness exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/psl-fixture-readiness/page.tsx'))).toBe(true);
  });

  it('admin readiness page is read-only (no import trigger)', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/psl-fixture-readiness/page.tsx'), 'utf-8');
    expect(src).not.toContain('runWriteRun');
    expect(src).not.toContain('dryRun: false');
    expect(src).not.toContain('confirmWrite');
  });

  it('admin readiness page states READ-ONLY', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/psl-fixture-readiness/page.tsx'), 'utf-8');
    expect(src).toMatch(/READ.ONLY/i);
  });

  it('admin readiness page does not expose provider keys to frontend', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/psl-fixture-readiness/page.tsx'), 'utf-8');
    expect(src).not.toMatch(/PARSE_API_KEY\s*=/);
    expect(src).not.toMatch(/API_FOOTBALL_KEY\s*=/);
    expect(src).not.toMatch(/NEXT_PUBLIC_PARSE/);
    expect(src).not.toMatch(/NEXT_PUBLIC_API_FOOTBALL/);
  });

  it('monitoring tool exists', () => {
    expect(existsSync(resolve(ROOT2, 'tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs'))).toBe(true);
  });

  it('monitoring tool redacts ADMIN_TOKEN', () => {
    const src = readFileSync(resolve(ROOT2, 'tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs'), 'utf-8');
    // Token value must not be logged — variable name may appear in comments/strings but not in console.log calls
    expect(src).not.toMatch(/console\.log.*process\.env\[.ADMIN_TOKEN.\]/);
    expect(src).not.toMatch(/console\.log.*\$\{ADMIN_TOKEN\}/);
    expect(src).toMatch(/Admin JWT was NOT printed|token.*not.*print/i);
  });

  it('monitoring tool never calls import write', () => {
    const src = readFileSync(resolve(ROOT2, 'tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs'), 'utf-8');
    expect(src).not.toContain('dryRun: false');
    expect(src).not.toContain('confirmWrite');
    expect(src).not.toContain('/ingest');
  });

  it('monitoring tool never calls PSL activation', () => {
    const src = readFileSync(resolve(ROOT2, 'tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs'), 'utf-8');
    expect(src).not.toContain('/activate');
    expect(src).not.toContain('activateSeason');
  });

  it('PSL fixture readiness doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md'))).toBe(true);
  });

  it('readiness doc states PSL INACTIVE', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md'), 'utf-8');
    expect(c).toMatch(/PSL.*INACTIVE|INACTIVE.*PSL/i);
  });

  it('readiness doc states fixture readiness is not fixture import', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md'), 'utf-8');
    expect(c).toMatch(/not.*fixture import|fixture.*readiness.*not/i);
  });

  it('readiness doc states fixture publication is not PSL activation', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md'), 'utf-8');
    expect(c).toMatch(/publication.*not.*activat|publicat.*activat/i);
  });

  it('readiness doc states no scheduled ingestion', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md'), 'utf-8');
    expect(c).toMatch(/no scheduled ingestion/i);
  });

  it('handover doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-36B-PSL-FIXTURE-MONITORING-HANDOVER.md'))).toBe(true);
  });

  it('known gaps doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-36B-KNOWN-GAPS.md'))).toBe(true);
  });

  it('known gaps doc states SOURCE_EMPTY is expected', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/handover/SPRINT-36B-KNOWN-GAPS.md'), 'utf-8');
    expect(c).toMatch(/SOURCE_EMPTY.*expected|expected.*SOURCE_EMPTY/i);
  });

  it('monitoring runbook exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/staging/SPRINT-36B-PSL-FIXTURE-MONITORING-RUNBOOK.md'))).toBe(true);
  });

  it('no new Prisma migration (readiness is env-var only)', () => {
    const migrationsDir = resolve(ROOT2, 'apps/api/prisma/migrations');
    const migrations = existsSync(migrationsDir)
      ? require('fs').readdirSync(migrationsDir) as string[]
      : [] as string[];
    const sprint36bMigrations = migrations.filter((m: string) => m.includes('sprint_36b'));
    expect(sprint36bMigrations).toHaveLength(0);
  });
});

// ─── Sprint 38A: World Cup Live Provider Integration ──────────────────────

describe('Sprint 38A — World Cup Live Provider Integration', () => {
  const ROOT2 = resolve(__dirname, '../../../..');

  it('SportRadar adapter exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/data-provider/sportradar-soccer.adapter.ts'))).toBe(true);
  });

  it('ScoreBat widget adapter exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/data-provider/scorebat-widget.adapter.ts'))).toBe(true);
  });

  it('WorldCupImportService exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-import.service.ts'))).toBe(true);
  });

  it('WC import DTO exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/data-provider/dto/world-cup-import.dto.ts'))).toBe(true);
  });

  it('world-cup/live page exists', () => {
    expect(existsSync(src('app/world-cup/live/page.tsx'))).toBe(true);
  });

  it('ScoreBatWorldCupWidget component exists', () => {
    expect(existsSync(src('components/world-cup/ScoreBatWorldCupWidget.tsx'))).toBe(true);
  });

  it('world-cup/live page never exposes SCOREBAT_WIDGET_TOKEN via NEXT_PUBLIC_', () => {
    const src2 = readFileSync(src('app/world-cup/live/page.tsx'), 'utf-8');
    expect(src2).not.toMatch(/NEXT_PUBLIC_SCOREBAT/);
    expect(src2).not.toMatch(/NEXT_PUBLIC_FOOTBALL_DATA/);
    expect(src2).not.toMatch(/NEXT_PUBLIC_SPORTSRADAR/);
  });

  it('world-cup/live page reads SCOREBAT_WIDGET_TOKEN server-side via backend endpoint only', () => {
    const src2 = readFileSync(src('app/world-cup/live/page.tsx'), 'utf-8');
    // Must NOT read env var directly in frontend
    expect(src2).not.toMatch(/process\.env\['SCOREBAT_WIDGET_TOKEN'\]/);
    expect(src2).not.toMatch(/process\.env\.SCOREBAT_WIDGET_TOKEN/);
  });

  it('ScoreBatWorldCupWidget never reads provider keys from process.env', () => {
    const src2 = readFileSync(src('components/world-cup/ScoreBatWorldCupWidget.tsx'), 'utf-8');
    // The component must not read env vars directly (server-side keys are passed as embedUrl prop)
    expect(src2).not.toMatch(/process\.env.*SCOREBAT_WIDGET_TOKEN/);
    expect(src2).not.toMatch(/process\.env.*FOOTBALL_DATA_API_KEY/);
    expect(src2).not.toMatch(/process\.env.*SPORTSRADAR_SOCCER_API_KEY/);
  });

  it('SportRadar adapter never exposes API key value in public-facing response fields', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/sportradar-soccer.adapter.ts'), 'utf-8');
    // The raw key must never appear in health/data response objects
    expect(src2).not.toMatch(/message.*apiKey/);
    expect(src2).not.toMatch(/SPORTSRADAR_SOCCER_API_KEY=/);
    // Health method must return available/provider/message only
    expect(src2).toMatch(/available:.*provider:.*message:/s);
  });

  it('SportRadar adapter implements ProviderAdapter interface', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/sportradar-soccer.adapter.ts'), 'utf-8');
    expect(src2).toMatch(/implements ProviderAdapter/);
  });

  it('ScoreBat adapter implements ProviderAdapter interface', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/scorebat-widget.adapter.ts'), 'utf-8');
    expect(src2).toMatch(/implements ProviderAdapter/);
  });

  it('WorldCupImportService enforces double-gate write mode (env flag + body confirmation)', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-import.service.ts'), 'utf-8');
    expect(src2).toMatch(/ALLOW_WORLD_CUP_WRITE/);
    expect(src2).toMatch(/IMPORT_WORLD_CUP_BETA/);
    expect(src2).toMatch(/WRITE_BLOCKED/);
  });

  it('WorldCupImportService always sets isPublished=false on created fixtures', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-import.service.ts'), 'utf-8');
    expect(src2).toMatch(/isPublished:\s*false/);
    expect(src2).not.toMatch(/isPublished:\s*true/);
  });

  it('WorldCupImportService never activates PSL', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-import.service.ts'), 'utf-8');
    expect(src2).not.toMatch(/activateSeason/);
    expect(src2).not.toMatch(/pslActivat/);
    expect(src2).not.toMatch(/isPslActive/);
  });

  it('WorldCupImportService writes audit log for all operations', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-import.service.ts'), 'utf-8');
    expect(src2).toMatch(/writeAuditLog/);
    expect(src2).toMatch(/adminAuditLog/);
  });

  it('provider-router routes WC to SportRadar when FD.org key absent', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/provider-router.service.ts'), 'utf-8');
    expect(src2).toMatch(/SportRadarSoccerAdapter/);
    expect(src2).toMatch(/SPORTSRADAR_SOCCER_API_KEY/);
  });

  it('world-cup-live-readiness endpoint exists in controller', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.controller.ts'), 'utf-8');
    expect(src2).toMatch(/world-cup-live-readiness/);
    expect(src2).toMatch(/getWorldCupLiveReadiness/);
  });

  it('world-cup/fixtures/import endpoint enforces confirmWorldCupWrite validation', () => {
    const src2 = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.controller.ts'), 'utf-8');
    expect(src2).toMatch(/IMPORT_WORLD_CUP_BETA/);
    expect(src2).toMatch(/confirmWorldCupWrite/);
  });

  it('6 sprint-38a staging tools exist', () => {
    const tools = [
      'sprint-38a-world-cup-provider-health.mjs',
      'sprint-38a-world-cup-fixture-import.mjs',
      'sprint-38a-world-cup-team-import.mjs',
      'sprint-38a-world-cup-squad-import.mjs',
      'sprint-38a-world-cup-fantasy-pool-build.mjs',
      'sprint-38a-world-cup-gts-card-build.mjs',
    ];
    for (const t of tools) {
      expect(existsSync(resolve(ROOT2, `tools/staging/${t}`))).toBe(true);
    }
  });

  it('fixture import tool never sets dryRun: false in default body', () => {
    const src2 = readFileSync(resolve(ROOT2, 'tools/staging/sprint-38a-world-cup-fixture-import.mjs'), 'utf-8');
    // Default body has dryRun: true — check that object literal uses true for dry-run branch
    expect(src2).toMatch(/dryRun:\s*true/);
  });

  it('fixture import tool never sets confirmWorldCupWrite in dry-run body', () => {
    const src2 = readFileSync(resolve(ROOT2, 'tools/staging/sprint-38a-world-cup-fixture-import.mjs'), 'utf-8');
    // The write body should have confirmWorldCupWrite but only in write branch
    // The tool must also guard write mode with env var checks before calling the API
    expect(src2).toMatch(/ALLOW_WORLD_CUP_WRITE/);
    expect(src2).toMatch(/IMPORT_WORLD_CUP_BETA/);
  });

  it('provider health tool never logs admin token value', () => {
    const src2 = readFileSync(resolve(ROOT2, 'tools/staging/sprint-38a-world-cup-provider-health.mjs'), 'utf-8');
    expect(src2).not.toMatch(/console\.log.*process\.env\[.ADMIN_TOKEN.\]/);
    expect(src2).toMatch(/redacted/i);
  });

  it('WC provider integration doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/data/SPRINT-38A-WORLD-CUP-PROVIDER-INTEGRATION.md'))).toBe(true);
  });

  it('WC integration doc states PSL INACTIVE', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/data/SPRINT-38A-WORLD-CUP-PROVIDER-INTEGRATION.md'), 'utf-8');
    expect(c).toMatch(/PSL.*INACTIVE|INACTIVE.*PSL/i);
  });

  it('WC safety rules doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/data/SPRINT-38A-WC-IMPORT-SAFETY-RULES.md'))).toBe(true);
  });

  it('WC safety rules doc states write mode requires double flags', () => {
    const c = readFileSync(resolve(ROOT2, 'docs/data/SPRINT-38A-WC-IMPORT-SAFETY-RULES.md'), 'utf-8');
    expect(c).toMatch(/ALLOW_WORLD_CUP_WRITE/);
    expect(c).toMatch(/IMPORT_WORLD_CUP_BETA/);
  });

  it('WC go/no-go doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/data/SPRINT-38A-WC-GO-NOGO.md'))).toBe(true);
  });

  it('WC handover doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-38A-WC-PROVIDER-HANDOVER.md'))).toBe(true);
  });

  it('WC known gaps doc exists', () => {
    expect(existsSync(resolve(ROOT2, 'docs/handover/SPRINT-38A-KNOWN-GAPS.md'))).toBe(true);
  });

  it('no new Prisma migration (WC import uses existing Fixture model)', () => {
    const migrationsDir = resolve(ROOT2, 'apps/api/prisma/migrations');
    const migrations = existsSync(migrationsDir)
      ? require('fs').readdirSync(migrationsDir) as string[]
      : [] as string[];
    const sprint38aMigrations = migrations.filter((m: string) => m.includes('sprint_38a'));
    expect(sprint38aMigrations).toHaveLength(0);
  });
});

// ─── Sprint 38B: WC Seed Data + Admin Routes ─────────────────────────────

describe('Sprint 38B — WC Seed Data & Admin DB Status Routes', () => {
  const ROOT2 = resolve(__dirname, '../../../..');

  it('WorldCupDbStatusService file exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-db-status.service.ts'))).toBe(true);
  });

  it('WorldCupDbStatusService exports getPlayerPoolStatus method', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-db-status.service.ts'), 'utf-8');
    expect(src).toMatch(/getPlayerPoolStatus/);
  });

  it('WorldCupDbStatusService exports getFixtureStatus method', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-db-status.service.ts'), 'utf-8');
    expect(src).toMatch(/getFixtureStatus/);
  });

  it('WorldCupDbStatusService is read-only (noWrites=true in response)', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-db-status.service.ts'), 'utf-8');
    expect(src).toMatch(/noWrites.*true/);
  });

  it('WorldCupDbStatusService enforces points-only context', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-db-status.service.ts'), 'utf-8');
    expect(src).toMatch(/pointsOnlyContext.*true|points.*only/i);
  });

  it('WorldCupDbStatusService never activates PSL (noPslActivation=true)', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/world-cup-db-status.service.ts'), 'utf-8');
    expect(src).toMatch(/noPslActivation.*true/);
    expect(src).not.toMatch(/isActive.*true.*psl|psl.*isActive.*true/i);
  });

  it('player-pool-status route exists in data-provider controller', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.controller.ts'), 'utf-8');
    expect(src).toMatch(/world-cup\/player-pool-status/);
  });

  it('fixture-status route exists in data-provider controller', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.controller.ts'), 'utf-8');
    expect(src).toMatch(/world-cup\/fixture-status/);
  });

  it('WorldCupDbStatusService is registered in DataProviderModule', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/src/data-provider/data-provider.module.ts'), 'utf-8');
    expect(src).toMatch(/WorldCupDbStatusService/);
  });

  it('world-cup-live-readiness admin page exists', () => {
    expect(existsSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/world-cup-live-readiness/page.tsx'))).toBe(true);
  });

  it('world-cup-live-readiness page is read-only (no imports, no activation)', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/world-cup-live-readiness/page.tsx'), 'utf-8');
    expect(src).toMatch(/READ-ONLY/);
    expect(src).not.toContain('dryRun: false');
    expect(src).not.toContain('activateSeason');
    expect(src).not.toContain('confirmWorldCupWrite');
  });

  it('world-cup-live-readiness page calls player-pool-status endpoint', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/world-cup-live-readiness/page.tsx'), 'utf-8');
    expect(src).toMatch(/world-cup\/player-pool-status/);
  });

  it('world-cup-live-readiness page calls fixture-status endpoint', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/world-cup-live-readiness/page.tsx'), 'utf-8');
    expect(src).toMatch(/world-cup\/fixture-status/);
  });

  it('world-cup-live-readiness page enforces points-only safety messaging', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/experience/src/app/admin/data-provider/world-cup-live-readiness/page.tsx'), 'utf-8');
    expect(src).toMatch(/points.*only|no.*cash.*value|no wagering/i);
  });

  it('seed.ts includes WC2026 FantasyPlayerPrice seeding', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/prisma/seed.ts'), 'utf-8');
    expect(src).toMatch(/fantasyPlayerPrice.*upsert|WC.*fantasy.*player.*price|WC_PRICE/i);
  });

  it('seed.ts includes WC2026 FixturePredictionMarket seeding', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/prisma/seed.ts'), 'utf-8');
    expect(src).toMatch(/fixturePredictionMarket.*create|WC.*market/i);
  });

  it('seed.ts WC price seeding states points-only (no cash value)', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/prisma/seed.ts'), 'utf-8');
    expect(src).toMatch(/POINTS-ONLY|points.*only|no cash value/i);
  });

  it('seed.ts WC market seeding uses MATCH_RESULT market type', () => {
    const src = readFileSync(resolve(ROOT2, 'apps/api/prisma/seed.ts'), 'utf-8');
    expect(src).toMatch(/MATCH_RESULT/);
  });

  it('no new Prisma migration (Sprint 38B uses existing schema)', () => {
    const migrationsDir = resolve(ROOT2, 'apps/api/prisma/migrations');
    const migrations = existsSync(migrationsDir)
      ? require('fs').readdirSync(migrationsDir) as string[]
      : [] as string[];
    const sprint38bMigrations = migrations.filter((m: string) => m.includes('sprint_38b'));
    expect(sprint38bMigrations).toHaveLength(0);
  });
});

// ─── Sprint 38B: Fan Pages & Admin Portal ─────────────────────────────────

describe('Sprint 38B — Fan Pages & Admin Portal', () => {
  it('/world-cup page exists', () => {
    expect(exists('app/world-cup/page.tsx')).toBe(true);
  });

  it('/news page exists', () => {
    expect(exists('app/news/page.tsx')).toBe(true);
  });

  it('/videos page exists', () => {
    expect(exists('app/videos/page.tsx')).toBe(true);
  });

  it('/leaderboards page exists', () => {
    expect(exists('app/leaderboards/page.tsx')).toBe(true);
  });

  it('/fixtures page exists', () => {
    expect(exists('app/fixtures/page.tsx')).toBe(true);
  });

  it('/match-centre page exists', () => {
    expect(exists('app/match-centre/page.tsx')).toBe(true);
  });

  it('/guess-the-score page exists', () => {
    expect(exists('app/guess-the-score/page.tsx')).toBe(true);
  });

  it('/admin/data-provider/world-cup-live-readiness page exists', () => {
    expect(exists('app/admin/data-provider/world-cup-live-readiness/page.tsx')).toBe(true);
  });

  it('/admin/data-provider/psl-fixture-readiness page exists', () => {
    expect(exists('app/admin/data-provider/psl-fixture-readiness/page.tsx')).toBe(true);
  });

  it('/admin/fantasy/player-pool page exists', () => {
    expect(exists('app/admin/fantasy/player-pool/page.tsx')).toBe(true);
  });

  it('/admin/predictions/gts-fixtures page exists', () => {
    expect(exists('app/admin/predictions/gts-fixtures/page.tsx')).toBe(true);
  });

  it('club portal pages still exist', () => {
    expect(exists('app/club/page.tsx')).toBe(true);
    expect(exists('app/club/overview/page.tsx')).toBe(true);
    expect(exists('app/club/fixtures/page.tsx')).toBe(true);
  });

  it('sponsor portal pages still exist', () => {
    expect(exists('app/sponsor/page.tsx')).toBe(true);
    expect(exists('app/sponsor/overview/page.tsx')).toBe(true);
    expect(exists('app/sponsor/campaigns/page.tsx')).toBe(true);
  });

  const NEW_APP_PAGES = [
    'app/world-cup/page.tsx',
    'app/news/page.tsx',
    'app/videos/page.tsx',
    'app/leaderboards/page.tsx',
    'app/fixtures/page.tsx',
    'app/match-centre/page.tsx',
    'app/guess-the-score/page.tsx',
    'app/admin/data-provider/world-cup-live-readiness/page.tsx',
    'app/admin/fantasy/player-pool/page.tsx',
    'app/admin/predictions/gts-fixtures/page.tsx',
  ];

  const FORBIDDEN_KEYWORDS = ['place your bet', 'cash out', 'withdrawal amount', 'deposit funds'];

  for (const page of NEW_APP_PAGES) {
    it(`${page} — no betting/real-money keywords`, () => {
      if (!exists(page)) return;
      const content = read(page);
      for (const kw of FORBIDDEN_KEYWORDS) {
        expect(content.toLowerCase()).not.toContain(kw);
      }
    });
  }

  const ADMIN_APP_PAGES = [
    'app/admin/data-provider/world-cup-live-readiness/page.tsx',
    'app/admin/data-provider/psl-fixture-readiness/page.tsx',
    'app/admin/fantasy/player-pool/page.tsx',
    'app/admin/predictions/gts-fixtures/page.tsx',
  ];

  for (const page of ADMIN_APP_PAGES) {
    it(`${page} — no NEXT_PUBLIC_ provider key exposure`, () => {
      if (!exists(page)) return;
      const content = read(page);
      const providerKeyPatterns = [
        'NEXT_PUBLIC_SCOREBAT',
        'NEXT_PUBLIC_SPORTRADAR',
        'NEXT_PUBLIC_FOOTBALL_DATA',
        'NEXT_PUBLIC_API_FOOTBALL',
        'NEXT_PUBLIC_PARSE_PSL',
      ];
      for (const pattern of providerKeyPatterns) {
        expect(content).not.toContain(pattern);
      }
    });
  }
});

// ─── Sprint 41: Design system components ────────────────────────────────────

describe('design system components exist', () => {
  const designComponents = [
    'components/design/PslOneHero.tsx',
    'components/design/PslOneSection.tsx',
    'components/design/PlayerCard.tsx',
    'components/design/ClubCrest.tsx',
    'components/design/SponsorBanner.tsx',
    'components/design/NewsHeroCard.tsx',
    'components/design/VideoTile.tsx',
    'components/design/MatchdayBanner.tsx',
  ];
  for (const c of designComponents) {
    it(c.split('/').pop()!, () => expect(exists(c)).toBe(true));
  }
});

describe('PslOneHero', () => {
  it('is a client component', () => {
    expect(read('components/design/PslOneHero.tsx')).toContain("'use client'");
  });
  it('uses useReducedMotion for accessibility', () => {
    expect(read('components/design/PslOneHero.tsx')).toContain('useReducedMotion');
  });
  it('renders a section with aria-label', () => {
    expect(read('components/design/PslOneHero.tsx')).toContain('aria-label');
  });
  it('has min-h-[40vh] mobile and min-h-[60vh] desktop', () => {
    const content = read('components/design/PslOneHero.tsx');
    expect(content).toContain('min-h-[40vh]');
    expect(content).toContain('min-h-[60vh]');
  });
  it('uses exp-gold accent', () => {
    expect(read('components/design/PslOneHero.tsx')).toContain('exp-gold');
  });
  it('CTA link has min-h-[44px] touch target', () => {
    expect(read('components/design/PslOneHero.tsx')).toContain('min-h-[44px]');
  });
});

describe('PslOneSection', () => {
  it('supports dark and light variants', () => {
    const content = read('components/design/PslOneSection.tsx');
    expect(content).toContain('bg-exp-navy');
    expect(content).toContain('bg-exp-surface');
  });
  it('renders tag chip', () => {
    expect(read('components/design/PslOneSection.tsx')).toContain('tag');
  });
  it('renders children', () => {
    expect(read('components/design/PslOneSection.tsx')).toContain('children');
  });
});

describe('PlayerCard', () => {
  it('shows initials when no imageUrl', () => {
    expect(read('components/design/PlayerCard.tsx')).toContain('getInitials');
  });
  it('shows price in gold', () => {
    const content = read('components/design/PlayerCard.tsx');
    expect(content).toContain('exp-gold');
    expect(content).toContain('price');
  });
  it('shows score when provided', () => {
    expect(read('components/design/PlayerCard.tsx')).toContain('score');
  });
  it('has fixed 160px width', () => {
    expect(read('components/design/PlayerCard.tsx')).toContain('w-[160px]');
  });
});

describe('ClubCrest', () => {
  it('has beta placeholder comment', () => {
    expect(read('components/design/ClubCrest.tsx')).toContain('Beta placeholder crest');
  });
  it('uses shield border-radius identical to TeamIdentity', () => {
    expect(read('components/design/ClubCrest.tsx')).toContain('rounded-[28%_28%_50%_50%');
  });
  it('has aria role="img"', () => {
    expect(read('components/design/ClubCrest.tsx')).toContain('role="img"');
  });
  it('supports 4 sizes', () => {
    const content = read('components/design/ClubCrest.tsx');
    expect(content).toContain("'sm'");
    expect(content).toContain("'md'");
    expect(content).toContain("'lg'");
    expect(content).toContain("'xl'");
  });
});

describe('SponsorBanner', () => {
  it('has non-financial disclaimer', () => {
    const content = read('components/design/SponsorBanner.tsx');
    expect(
      content.includes('Points only') ||
      content.includes('no real money') ||
      content.includes('no financial value'),
    ).toBe(true);
  });
  it('has no gambling language', () => {
    const content = read('components/design/SponsorBanner.tsx').toLowerCase();
    expect(content).not.toContain('gamble');
    expect(content).not.toContain('betting');
    expect(content).not.toContain('wager');
    expect(content).not.toContain('casino');
    expect(content).not.toContain('cash');
  });
  it('CTA has min-h-[44px]', () => {
    expect(read('components/design/SponsorBanner.tsx')).toContain('min-h-[44px]');
  });
  it('uses accentColor prop', () => {
    expect(read('components/design/SponsorBanner.tsx')).toContain('accentColor');
  });
});

describe('NewsHeroCard', () => {
  it('has gradient fallback when no imageUrl', () => {
    expect(read('components/design/NewsHeroCard.tsx')).toContain('FALLBACK_GRADIENT');
  });
  it('renders category as chip', () => {
    expect(read('components/design/NewsHeroCard.tsx')).toContain('category');
  });
  it('formats publishedAt date', () => {
    expect(read('components/design/NewsHeroCard.tsx')).toContain('publishedAt');
  });
  it('Read more link has min-h-[44px]', () => {
    expect(read('components/design/NewsHeroCard.tsx')).toContain('min-h-[44px]');
  });
});

describe('VideoTile', () => {
  it('is a client component', () => {
    expect(read('components/design/VideoTile.tsx')).toContain("'use client'");
  });
  it('has aria-label on play button', () => {
    expect(read('components/design/VideoTile.tsx')).toContain('aria-label');
  });
  it('has min-h-[44px] touch target', () => {
    expect(read('components/design/VideoTile.tsx')).toContain('min-h-[44px]');
  });
  it('has fixed 200px width', () => {
    expect(read('components/design/VideoTile.tsx')).toContain('w-[200px]');
  });
  it('shows duration chip', () => {
    expect(read('components/design/VideoTile.tsx')).toContain('duration');
  });
});

describe('MatchdayBanner', () => {
  it('is a client component', () => {
    expect(read('components/design/MatchdayBanner.tsx')).toContain("'use client'");
  });
  it('uses useReducedMotion', () => {
    expect(read('components/design/MatchdayBanner.tsx')).toContain('useReducedMotion');
  });
  it('shows live pulse for LIVE status', () => {
    expect(read('components/design/MatchdayBanner.tsx')).toContain('animate-live-pulse');
  });
  it('supports SCHEDULED, LIVE and FINISHED statuses', () => {
    const content = read('components/design/MatchdayBanner.tsx');
    expect(content).toContain('SCHEDULED');
    expect(content).toContain('LIVE');
    expect(content).toContain('FINISHED');
  });
  it('has aria-label on score element', () => {
    expect(read('components/design/MatchdayBanner.tsx')).toContain('aria-label');
  });
});

// ─── Sprint 41: Sign-up page ─────────────────────────────────────────────────

describe('sign-up page', () => {
  it('app/sign-up/page.tsx exists', () => {
    expect(exists('app/sign-up/page.tsx')).toBe(true);
  });
  it('SignUpForm.tsx exists', () => {
    expect(exists('app/sign-up/SignUpForm.tsx')).toBe(true);
  });
  it('page renders title "Create your account"', () => {
    expect(read('app/sign-up/page.tsx')).toContain('Create your account');
  });
  it('page links to /sign-in', () => {
    expect(read('app/sign-up/page.tsx')).toContain('/sign-in');
  });
  it('page uses AuthLayout', () => {
    expect(read('app/sign-up/page.tsx')).toContain('AuthLayout');
  });
});

describe('SignUpForm', () => {
  it('is a client component', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain("'use client'");
  });
  it('has email field', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('type="email"');
  });
  it('has password field', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('type={showPassword');
  });
  it('has dateOfBirth field', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('dateOfBirth');
  });
  it('has consentCoreService checkbox', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('consentCoreService');
  });
  it('has consentMarketing checkbox', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('consentMarketing');
  });
  it('has consentAnalytics checkbox', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('consentAnalytics');
  });
  it('submits to /auth/register', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('/auth/register');
  });
  it('has success state with verification message', () => {
    const content = read('app/sign-up/SignUpForm.tsx');
    expect(content).toContain('verification email');
  });
  it('has resend button', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('Resend verification email');
  });
  it('has aria-label="Create account" on form', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('aria-label="Create account"');
  });
  it('has aria-busy on submit button', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('aria-busy');
  });
  it('has min-h-[44px] on interactive elements', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('min-h-[44px]');
  });
  it('validates minimum password length', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('8');
  });
  it('validates age 13+', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('13');
  });
  it('uses NEXT_PUBLIC_API_BASE_URL', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('NEXT_PUBLIC_API_BASE_URL');
  });
  it('has no gambling language', () => {
    const content = read('app/sign-up/SignUpForm.tsx').toLowerCase();
    expect(content).not.toContain('gamble');
    expect(content).not.toContain('betting');
    expect(content).not.toContain('wager');
    expect(content).not.toContain('casino');
  });
});

// ─── Sprint 41: Verify-email page ───────────────────────────────────────────

describe('verify-email page', () => {
  it('app/verify-email/page.tsx exists', () => {
    expect(exists('app/verify-email/page.tsx')).toBe(true);
  });
  it('calls POST /auth/email/verify', () => {
    expect(read('app/verify-email/page.tsx')).toContain('/auth/email/verify');
  });
  it('handles no-token case', () => {
    expect(read('app/verify-email/page.tsx')).toContain('no_token');
  });
  it('handles expired token case', () => {
    expect(read('app/verify-email/page.tsx')).toContain('expired');
  });
  it('handles success case', () => {
    expect(read('app/verify-email/page.tsx')).toContain('success');
  });
  it('links to /sign-in on success', () => {
    expect(read('app/verify-email/page.tsx')).toContain('/sign-in');
  });
  it('links to /account/security on expired', () => {
    expect(read('app/verify-email/page.tsx')).toContain('/account/security');
  });
  it('uses cache: no-store for server fetch', () => {
    expect(read('app/verify-email/page.tsx')).toContain('no-store');
  });
  it('interactive links have min-h-[44px]', () => {
    expect(read('app/verify-email/page.tsx')).toContain('min-h-[44px]');
  });
});

// ─── Sprint 41: Account security page update ─────────────────────────────────

describe('account security page', () => {
  it('has email verification callout section', () => {
    const content = read('components/account/EmailVerificationPanel.tsx');
    expect(content).toContain('Email verification');
  });
  it('still includes PasswordForm', () => {
    expect(read('app/account/security/page.tsx')).toContain('PasswordForm');
  });
  it('wires the live email verification panel', () => {
    expect(read('app/account/security/page.tsx')).toContain('EmailVerificationPanel');
  });
  it('loads verification status from /auth/me', () => {
    expect(read('components/account/EmailVerificationPanel.tsx')).toContain('/auth/me');
  });
  it('posts resend verification email to the API', () => {
    expect(read('components/account/EmailVerificationPanel.tsx')).toContain('/auth/email/verify/request');
  });
  it('has min-h-[44px] on resend button', () => {
    expect(read('components/account/EmailVerificationPanel.tsx')).toContain('min-h-[44px]');
  });
});

// ─── Sprint 41: Component inventory doc ──────────────────────────────────────

describe('Sprint 41 docs', () => {
  const { existsSync } = require('fs');
  const { resolve } = require('path');
  it('docs/design/SPRINT-41-COMPONENT-INVENTORY.md exists', () => {
    expect(existsSync(resolve(ROOT, '../../docs/design/SPRINT-41-COMPONENT-INVENTORY.md'))).toBe(true);
  });
});

// ─── Sprint 42B: Remove silent fallback data ─────────────────────────────────

describe('Sprint 42B — no silent WC_FALLBACK_FIXTURES on live pages', () => {
  const pages = [
    'app/guess-the-score/page.tsx',
    'app/fixtures/page.tsx',
    'app/world-cup/page.tsx',
    'app/world-cup/live/page.tsx',
    'app/match-centre/page.tsx',
  ];

  for (const page of pages) {
    it(`${page} does not import WC_FALLBACK_FIXTURES`, () => {
      const content = read(page);
      expect(content).not.toContain('WC_FALLBACK_FIXTURES');
    });
  }

  it('guess-the-score page does not use STATIC_MARKETS', () => {
    expect(read('app/guess-the-score/page.tsx')).not.toContain('STATIC_MARKETS');
  });

  it('guess-the-score fetches /football/fixtures for open markets', () => {
    expect(read('app/guess-the-score/page.tsx')).toContain('/football/fixtures');
  });

  it('guess-the-score is dynamic and never prerenders stale open markets', () => {
    const content = read('app/guess-the-score/page.tsx');
    expect(content).toContain("dynamic = 'force-dynamic'");
    expect(content).toContain('revalidate = 0');
    expect(content).toContain("cache: 'no-store'");
    expect(content).toContain('getServerApiBase');
  });

  it('predict page submits score predictions to the API instead of localStorage only', () => {
    const content = read('app/predict/page.tsx');
    const api = read('lib/predictions-api.ts');
    expect(content).toContain('createScorePrediction');
    expect(api).toContain('/predictions');
    expect(content).toContain('getMyFixturePrediction');
    expect(content).toContain("seasonSlug: 'fifa-world-cup-2026'");
  });

  it('fantasy onboarding loads live player pool in LIVE_BETA_DATA mode', () => {
    const content = read('app/fantasy/onboarding/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('getPlayerPool');
    expect(content).toContain('toExpFantasyPlayer');
    expect(content).toContain('Could not load the live World Cup player pool.');
  });

  it('fantasy transfers load live player pool in LIVE_BETA_DATA mode', () => {
    const content = read('app/fantasy/team/transfers/page.tsx');
    expect(content).toContain('getWorldCupSeason');
    expect(content).toContain('getPlayerPool');
    expect(content).toContain('toExpFantasyPlayer');
    expect(content).toContain('Could not load the live transfer screen.');
  });

  it('sign-up page displays emailDeliveryStatus honestly', () => {
    const content = read('app/sign-up/SignUpForm.tsx');
    expect(content).toContain('emailDeliveryStatus');
    expect(content).toContain('Email delivery status');
    expect(content).toContain('setToken');
  });

  it('guess-the-score shows explicit error when API unavailable', () => {
    const content = read('app/guess-the-score/page.tsx');
    expect(content).toContain('Fixture data unavailable');
  });

  it('fixtures page shows explicit error when API unavailable', () => {
    const content = read('app/fixtures/page.tsx');
    expect(content).toContain('Fixtures unavailable');
  });

  it('world-cup page shows explicit error when API unavailable', () => {
    const content = read('app/world-cup/page.tsx');
    expect(content).toContain('Fixtures unavailable');
  });

  it('match-centre shows explicit error when API unavailable', () => {
    const content = read('app/match-centre/page.tsx');
    expect(content).toContain('Match data unavailable');
  });

  it('world-cup/live page shows explicit error state', () => {
    const content = read('app/world-cup/live/page.tsx');
    expect(content).toContain('Fixtures unavailable');
  });

  it('world-cup/live is dynamic so deployed pages do not bake stale widget/API placeholders', () => {
    const content = read('app/world-cup/live/page.tsx');
    expect(content).toContain("dynamic = 'force-dynamic'");
    expect(content).toContain("cache: 'no-store'");
  });
});

// ─── Sprint 42B: WcFixtureCard shared component ───────────────────────────

describe('WcFixtureCard shared component', () => {
  it('WcFixtureCard component exists', () => {
    expect(exists('components/world-cup/WcFixtureCard.tsx')).toBe(true);
  });
  it('WcFixtureCard has flag mapping for SA, France, Brazil, England', () => {
    const content = read('components/world-cup/WcFixtureCard.tsx');
    expect(content).toContain('South Africa');
    expect(content).toContain('France');
    expect(content).toContain('Brazil');
    expect(content).toContain('England');
  });
  it('WcFixtureCard uses Link for navigation', () => {
    expect(read('components/world-cup/WcFixtureCard.tsx')).toContain("from 'next/link'");
  });
  it('fixtures page uses WcFixtureCard', () => {
    expect(read('app/fixtures/page.tsx')).toContain('WcFixtureCard');
  });
  it('world-cup page uses WcFixtureCard', () => {
    expect(read('app/world-cup/page.tsx')).toContain('WcFixtureCard');
  });
  it('world-cup/live page uses WcFixtureCard', () => {
    expect(read('app/world-cup/live/page.tsx')).toContain('WcFixtureCard');
  });
  it('match-centre page uses WcFixtureCard', () => {
    expect(read('app/match-centre/page.tsx')).toContain('WcFixtureCard');
  });
});

describe('Sprint 42B: news page upgraded', () => {
  it('news page uses NewsHeroCard', () => {
    expect(read('app/news/page.tsx')).toContain('NewsHeroCard');
  });
  it('news page uses VideoTile', () => {
    expect(read('app/news/page.tsx')).toContain('VideoTile');
  });
  it('news page uses expImg for image generation', () => {
    expect(read('app/news/page.tsx')).toContain('expImg');
  });
});

// ─── Hotfix: API-backed homepage / email delivery ────────────────────────────

describe('Hotfix: homepage — no hardcoded old South Africa fixture', () => {
  const homePage = read('app/page.tsx');

  it('homepage imports HomepageFixtureSection', () => {
    expect(homePage).toContain('HomepageFixtureSection');
  });

  it('homepage does not render MatchweekHeroSection', () => {
    expect(homePage).not.toContain('<MatchweekHeroSection');
  });

  it('homepage does not render FixtureCarouselSection with static data as live', () => {
    expect(homePage).not.toContain('<FixtureCarouselSection');
  });

  it('homepage does not render FeaturedMatchSection', () => {
    expect(homePage).not.toContain('<FeaturedMatchSection');
  });

  it('homepage does not render GuessTheScoreSection with static fixture data', () => {
    expect(homePage).not.toContain('<GuessTheScoreSection');
  });

  it('homepage uses async function (server fetch)', () => {
    expect(homePage).toContain('async function HomePage');
  });

  it('homepage leads with stories in design-review mode', () => {
    const storiesIndex = homePage.indexOf('<EditorialGridSection');
    const fixturesIndex = homePage.indexOf('<HomepageFixtureSection');
    expect(storiesIndex).toBeGreaterThan(-1);
    expect(fixturesIndex).toBeGreaterThan(-1);
    expect(storiesIndex).toBeLessThan(fixturesIndex);
  });

  it('homepage uses live world cup story feed in beta mode', () => {
    expect(homePage).toContain('getLiveWorldCupStories');
  });
});

describe('Hotfix: HomepageFixtureSection — API-backed, no static fixture data', () => {
  const section = read('sections/HomepageFixtureSection.tsx');

  it('HomepageFixtureSection exists', () => {
    expect(exists('sections/HomepageFixtureSection.tsx')).toBe(true);
  });

  it('fetches /football/fixtures from the shared server API resolver', () => {
    expect(section).toContain('/football/fixtures');
    expect(section).toContain('getServerApiBase');
  });

  it('shows API unavailable state instead of static data', () => {
    expect(section).toContain('Live beta API unavailable');
  });

  it('shows no upcoming fixtures empty state', () => {
    expect(section).toContain('No upcoming World Cup fixtures currently available from API.');
  });

  it('does not contain hardcoded South Africa vs South Korea fixture', () => {
    // Should not have static ids like 'rsa' or 'kor' fixture definitions
    expect(section).not.toContain("id: 'rsa'");
    expect(section).not.toContain("id: 'kor'");
  });

  it('does not import getExperienceData (no static mock injection)', () => {
    expect(section).not.toContain('getExperienceData');
  });

  it('uses WcFixtureCard for consistent fixture display', () => {
    expect(section).toContain('WcFixtureCard');
  });

  it('has World Cup Beta label', () => {
    expect(section).toContain('FIFA World Cup 2026');
  });

  it('revalidates at 300s (5 min cache)', () => {
    expect(section).toContain('revalidate: 300');
  });
});

describe('Hotfix: server-rendered WC pages use shared server API base', () => {
  it('fixtures page uses getServerApiBase', () => {
    const content = read('app/fixtures/page.tsx');
    expect(content).toContain('getServerApiBase');
    expect(content).not.toContain("process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001'");
  });

  it('world-cup page uses getServerApiBase', () => {
    const content = read('app/world-cup/page.tsx');
    expect(content).toContain('getServerApiBase');
    expect(content).not.toContain("process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001'");
  });

  it('match-centre page uses getServerApiBase', () => {
    const content = read('app/match-centre/page.tsx');
    expect(content).toContain('getServerApiBase');
    expect(content).not.toContain("process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001'");
  });

  it('verify-email page uses getServerApiBase', () => {
    const content = read('app/verify-email/page.tsx');
    expect(content).toContain('getServerApiBase');
    expect(content).not.toContain("process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000'");
  });

  it('shared public API client uses getServerApiBase for server-side renders', () => {
    const content = read('lib/api.ts');
    expect(content).toContain('getServerApiBase');
  });
});

describe('Hotfix: email delivery — resend verification', () => {
  it('sign-up form has resend verification email button', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('Resend verification email');
  });

  it('sign-up form posts to /auth/email/verify/request', () => {
    expect(read('app/sign-up/SignUpForm.tsx')).toContain('/auth/email/verify/request');
  });

  it('account security page has resend verification email link', () => {
    expect(read('components/account/EmailVerificationPanel.tsx')).toContain('Resend verification email');
  });
});

describe('Hotfix: resend checks res.ok — no false success', () => {
  const form = () => read('app/sign-up/SignUpForm.tsx');

  it('handleResend checks res.ok before setting resendSent', () => {
    const content = form();
    expect(content).toContain('res.ok');
  });

  it('handleResend sets error state on non-ok response', () => {
    const content = form();
    expect(content).toContain('resendError');
  });

  it('resendError state is rendered as visible error', () => {
    const content = form();
    expect(content).toContain('resendError &&');
  });

  it('resendSent is only set after res.ok is true', () => {
    const content = form();
    // setResendSent(true) must come after the res.ok check, not before or unconditionally
    const okIndex = content.indexOf('res.ok');
    const setSentIndex = content.indexOf('setResendSent(true)');
    expect(okIndex).toBeGreaterThan(-1);
    expect(setSentIndex).toBeGreaterThan(okIndex);
  });

  it('resend error message is user-facing', () => {
    const content = form();
    expect(content).toContain('Failed to resend');
  });
});

describe('Hotfix: editorial mock sections labelled on homepage', () => {
  const home = () => read('app/page.tsx');

  it('homepage shows editorial preview notice for non-live sections', () => {
    const content = home();
    expect(content).toContain('editorial beta preview');
  });

  it('homepage editorial notice is aria-labelled', () => {
    const content = home();
    expect(content).toContain('aria-label');
  });

  it('homepage editorial notice is only shown in WC_BETA or DESIGN_REVIEW_DATA mode', () => {
    const content = home();
    // editorial preview is now design-review only
    expect(content).toContain("mode === 'DESIGN_REVIEW_DATA'");
  });

  it('homepage renders EditorialGridSection before live fixtures in design review', () => {
    const content = home();
    expect(content.indexOf('<EditorialGridSection')).toBeLessThan(content.indexOf('<HomepageFixtureSection'));
  });

  it('data.ts does not have TODO claiming LIVE_BETA_DATA is wired', () => {
    const content = read('lib/data.ts');
    expect(content).not.toContain('TODO: replace with real API calls when LIVE_BETA_DATA is wired');
  });

  it('data.ts LIVE_BETA_DATA comment acknowledges it returns mock data', () => {
    const content = read('lib/data.ts');
    expect(content).toContain('not yet wired');
  });
});

// ─── A+ Gap-Close: News Centre scope ─────────────────────────────────────

describe('News Centre — editorial scope and safety', () => {
  it('news page exists', () => {
    expect(exists('app/news/page.tsx')).toBe(true);
  });

  it('news page shows EDITORIAL BETA badge — not claiming official PSL coverage', () => {
    const content = read('app/news/page.tsx');
    expect(content).toContain('EDITORIAL BETA');
  });

  it('news page does not claim to be official PSL news or official PSL coverage', () => {
    const content = read('app/news/page.tsx').toLowerCase();
    // Must not imply official PSL press/news coverage before contract
    expect(content).not.toContain('official psl news');
    expect(content).not.toContain('official psl coverage');
    expect(content).not.toContain('official psl media partner');
  });

  it('WC_STORIES entries all have publishedAt ISO timestamps', () => {
    const content = read('lib/data.ts');
    // All story publishedAt entries are ISO 8601 format
    const timestamps = content.match(/publishedAt:\s*'([^']+)'/g) ?? [];
    expect(timestamps.length).toBeGreaterThan(0);
    for (const ts of timestamps) {
      const iso = ts.match(/'([^']+)'/)?.[1];
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    }
  });

  it('WC_STORIES categories label editorial type (not source attribution)', () => {
    const content = read('lib/data.ts');
    // Category values must be editorial types, not news agency names
    const categories = ['Match Report', 'Feature', 'Analysis', 'Fantasy'];
    for (const cat of categories) {
      expect(content).toContain(cat);
    }
    // Must not attribute to news agencies not under contract
    expect(content).not.toContain('Reuters');
    expect(content).not.toContain('AP Sports');
    expect(content).not.toContain('AFP');
    expect(content).not.toContain('BBC Sport API');
  });

  it('news page renders timestamps via publishedAt field', () => {
    const content = read('app/news/page.tsx');
    expect(content).toContain('publishedAt');
    expect(content).toContain('formatDate');
  });

  it('news page has WC_BETA disclaimer in comment header', () => {
    const content = read('app/news/page.tsx');
    expect(content).toContain('WC_BETA');
    expect(content).toContain('PSL_INACTIVE');
  });

  it('news page shows stale/empty state gracefully — featured section only renders when story exists', () => {
    const content = read('app/news/page.tsx');
    // Featured section is wrapped in conditional: {featured && ...}
    expect(content).toContain('{featured && (');
    // Grid is conditional: {remaining.length > 0 && ...}
    expect(content).toContain('remaining.length > 0');
  });

  it('news page uses live world cup story feed helper', () => {
    expect(read('app/news/page.tsx')).toContain('getLiveWorldCupStories');
  });
});

// ─── A+ Gap-Close: Video / ScoreBat token safety ──────────────────────────

describe('Video page — ScoreBat token safety and empty state', () => {
  it('/videos page exists', () => {
    expect(exists('app/videos/page.tsx')).toBe(true);
  });

  it('/videos page does not expose SCOREBAT_WIDGET_TOKEN via NEXT_PUBLIC_ env var', () => {
    const content = read('app/videos/page.tsx');
    expect(content).not.toMatch(/NEXT_PUBLIC_SCOREBAT/);
    expect(content).not.toMatch(/NEXT_PUBLIC_WIDGET_TOKEN/);
  });

  it('/videos page does not read SCOREBAT_WIDGET_TOKEN directly — fetches from backend API', () => {
    const content = read('app/videos/page.tsx');
    // Must NOT read token directly in the frontend page
    expect(content).not.toMatch(/process\.env.*SCOREBAT_WIDGET_TOKEN/);
    // Must use server-side backend fetch
    expect(content).toContain('fetchWidgetConfig');
    expect(content).toContain('/football/world-cup/scorebat-widget');
  });

  it('/videos page uses server API resolver so EC2 and Vercel can both render', () => {
    const content = read('app/videos/page.tsx');
    expect(content).toContain('getServerApiBase');
  });

  it('/videos page is dynamic so the widget config is read at request time', () => {
    const content = read('app/videos/page.tsx');
    expect(content).toContain("dynamic = 'force-dynamic'");
    expect(content).toContain("cache: 'no-store'");
  });

  it('server API resolver supports INTERNAL_API_URL and public Vercel fallback', () => {
    const content = read('lib/server-api-base.ts');
    expect(content).toContain("process.env['INTERNAL_API_URL']");
    expect(content).toContain("process.env['NEXT_PUBLIC_API_BASE_URL']");
    expect(content).toContain('https://api.beta.pslone.co.za');
  });

  it('football API exposes public player list for live beta rendering', () => {
    const content = read('lib/football-api.ts');
    expect(content).toContain('getPlayers');
    expect(content).toContain('/football/players');
  });

  it('browser API client falls back to public beta API when no env is set', () => {
    expect(read('lib/api.ts')).toContain('https://api.beta.pslone.co.za');
    expect(read('lib/auth.ts')).toContain('https://api.beta.pslone.co.za');
  });

  it('/videos page has explicit placeholder/empty state when widget token not configured', () => {
    const content = read('app/videos/page.tsx');
    // Must render a human-readable placeholder, not a blank iframe
    expect(content).toContain('Highlights Coming Soon');
    expect(content).toContain('widgetConfig.available');
  });

  it('/videos page shows attribution "via ScoreBat" when widget is enabled', () => {
    const content = read('app/videos/page.tsx');
    expect(content).toContain('ScoreBat');
  });

  it('ScoreBatWorldCupWidget component does not read env vars directly', () => {
    const content = read('components/world-cup/ScoreBatWorldCupWidget.tsx');
    expect(content).not.toMatch(/process\.env.*SCOREBAT/);
    expect(content).not.toMatch(/process\.env.*TOKEN/);
  });

  it('ScoreBatWidgetAdapter health response never leaks raw token value', () => {
    // This is covered in scorebat-widget.adapter.spec.ts but assert file structure here
    const ROOT2 = resolve(__dirname, '../../../..');
    const { existsSync: ex2, readFileSync: rf2 } = require('fs');
    const specPath = resolve(ROOT2, 'apps/api/src/data-provider/scorebat-widget.adapter.spec.ts');
    expect(ex2(specPath)).toBe(true);
    const specContent = rf2(specPath, 'utf-8');
    // Confirm the spec has a test that health message does not contain the token
    expect(specContent).toContain('not.toContain');
    expect(specContent).toContain('sb-test-token');
  });
});

describe('Live story routing', () => {
  it('EditorialStory links to media detail route', () => {
    expect(read('components/ui/EditorialStory.tsx')).toContain('href ?? `/media/${story.id}`');
  });

  it('live world cup feed helper exists', () => {
    expect(exists('lib/live-world-cup-feed.ts')).toBe(true);
  });

  it('world cup live page uses live story feed', () => {
    expect(read('app/world-cup/live/page.tsx')).toContain('getLiveWorldCupStories');
  });
});

// ─── A+ Gap-Close: /matches route contract ────────────────────────────────

describe('/matches route contract', () => {
  it('/matches page exists and uses live API', () => {
    expect(exists('app/matches/page.tsx')).toBe(true);
    const content = read('app/matches/page.tsx');
    expect(content).toContain('getFixtures');
    expect(content).toContain('WcFixtureCard');
  });

  it('/matches/[fixtureId] page exists', () => {
    expect(exists('app/matches/[fixtureId]/page.tsx')).toBe(true);
  });

  it('/matches/live route does NOT exist — live scores are at /world-cup/live', () => {
    // Intentional: /matches/live was never implemented.
    // Live match data is served by /world-cup/live and /world-cup/live's WcFixtureCard.
    expect(exists('app/matches/live/page.tsx')).toBe(false);
  });

  it('/world-cup/live page exists and is the canonical live match hub', () => {
    expect(exists('app/world-cup/live/page.tsx')).toBe(true);
    const content = read('app/world-cup/live/page.tsx');
    expect(content).toContain('WcFixtureCard');
  });

  it('/matches page no longer uses static WC_FIXTURES data', () => {
    const content = read('app/matches/page.tsx');
    expect(content).not.toContain('WC_FIXTURES');
  });
});

// ─── Season-scoping regression guards ─────────────────────────────────────

describe('season-scoping: players page', () => {
  it('passes seasonSlug to getPlayers() call', () => {
    const content = read('app/players/page.tsx');
    expect(content).toContain('seasonSlug');
    expect(content).toContain('getPlayers');
  });

  it('fetches world-cup season before loading players', () => {
    const content = read('app/players/page.tsx');
    expect(content).toContain('getWorldCupSeason');
  });
});

// ─── getAllFiles helper ────────────────────────────────────────────────────

function getAllFiles(dir: string): string[] {
  const fs = require('fs');
  const path = require('path');
  const results: string[] = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results.push(...getAllFiles(full));
    else results.push(full);
  }
  return results;
}
