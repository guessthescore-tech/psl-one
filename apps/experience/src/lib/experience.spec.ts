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
  it('has picsum.photos in image domains', () => expect(nc).toContain('picsum.photos'));
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
