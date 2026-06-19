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
  it('exports getMyLeagues', () => expect(api).toContain('export async function getMyLeagues'));
  it('exports joinLeagueByCode', () => expect(api).toContain('export async function joinLeagueByCode'));
  it('exports createLeague', () => expect(api).toContain('export async function createLeague'));
  it('exports getHistory', () => expect(api).toContain('export async function getHistory'));
  it('exports League type', () => expect(api).toContain('export interface League'));
  it('exports ClassicStandingsRow type', () => expect(api).toContain('export interface ClassicStandingsRow'));
});

describe('auth lib', () => {
  const authLib = read('lib/auth.ts');
  it('exports isAuthenticated', () => expect(authLib).toContain('export function isAuthenticated'));
  it('exports getAuthToken', () => expect(authLib).toContain('export function getAuthToken'));
});
