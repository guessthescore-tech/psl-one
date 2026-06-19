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

// ─── Account component existence ──────────────────────────────────────────

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

// ─── Account page existence ────────────────────────────────────────────────

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

// ─── Auth lib existence ────────────────────────────────────────────────────

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

// ─── POPIA & non-gambling compliance ──────────────────────────────────────

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

// ─── Accessibility checks (account) ───────────────────────────────────────

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
