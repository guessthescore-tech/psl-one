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
    // Position filters
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

// ─── Non-financial disclaimers on football pages ───────────────────────────

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

// ─── Touch targets on football interactive elements ────────────────────────

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

// ─── LIVE pulse animation ──────────────────────────────────────────────────

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

// ─── design-review-only screens ───────────────────────────────────────────

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
