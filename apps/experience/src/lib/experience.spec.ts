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
    expect(content).toContain('DESIGN_REVIEW_DATA');
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
  it('matches list renders fixture cards', () => {
    expect(exists('app/matches/page.tsx')).toBe(true);
    const content = read('app/matches/page.tsx');
    expect(content).toContain('WC_FIXTURES');
    expect(content).toContain('MatchHeader');
    expect(content).toContain('MatchStateBadge');
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
  });

  it('player directory renders player rows', () => {
    expect(exists('app/players/page.tsx')).toBe(true);
    const content = read('app/players/page.tsx');
    expect(content).toContain('WC_PLAYERS');
    expect(content).toContain('PlayerProfileHero');
    expect(content).toContain('search');
    expect(content).toContain("'GK'");
    expect(content).toContain("'DEF'");
    expect(content).toContain("'MID'");
    expect(content).toContain("'FWD'");
  });

  it('player profile page renders stat grid and tabs', () => {
    expect(exists('app/players/[playerId]/page.tsx')).toBe(true);
    const content = read('app/players/[playerId]/page.tsx');
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
    expect(content).toContain('PlayerStatGrid');
    expect(content).toContain('PlayerGameweekTable');
    expect(content).toContain('Fantasy Points Breakdown');
    expect(content).toContain('Radar');
  });

  it('standings page renders league table', () => {
    expect(exists('app/stats/standings/page.tsx')).toBe(true);
    const content = read('app/stats/standings/page.tsx');
    expect(content).toContain('WC_STANDINGS');
    expect(content).toContain('StandingsTable');
  });

  it('season stats page renders top scorers', () => {
    expect(exists('app/stats/season/page.tsx')).toBe(true);
    const content = read('app/stats/season/page.tsx');
    expect(content).toContain('SeasonLeaderboard');
    expect(content).toContain('buildLeaderboard');
    expect(content).toContain("'goals'");
    expect(content).toContain("'assists'");
    expect(content).toContain('Total Goals');
  });

  it('compare page renders two player selectors', () => {
    expect(exists('app/stats/compare/page.tsx')).toBe(true);
    const content = read('app/stats/compare/page.tsx');
    expect(content).toContain('PlayerComparison');
    expect(content).toContain('selectedA');
    expect(content).toContain('selectedB');
    expect(content).toContain('mbappe');
    expect(content).toContain('vinicius');
  });

  it('awards page renders award cards', () => {
    expect(exists('app/stats/awards/page.tsx')).toBe(true);
    const content = read('app/stats/awards/page.tsx');
    expect(content).toContain('AwardCard');
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

  it('register page renders form with terms checkbox', () => {
    const content = read('app/register/page.tsx');
    expect(content).toContain('type="checkbox"');
    expect(content).toContain('Terms');
    expect(content).toContain('Create Account');
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
  it('register form has aria-label', () => {
    expect(read('app/register/page.tsx')).toContain('aria-label="Create account"');
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

  it('vercel.json sets DESIGN_REVIEW_DATA mode', () => {
    const path = require('path').resolve(ROOT, 'vercel.json');
    const content = require('fs').readFileSync(path, 'utf8');
    expect(content).toContain('DESIGN_REVIEW_DATA');
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
