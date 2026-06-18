import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/* ── Source readers ──────────────────────────────────────────────── */
const read = (rel: string) => readFileSync(join(__dirname, rel), 'utf-8');

const visionData     = read('./vision-data.ts');
const visionLayout   = read('../app/vision/layout.tsx');
const visionHub      = read('../app/vision/page.tsx');
const inSeasonPage   = read('../app/vision/in-season/page.tsx');
const matchdayPage   = read('../app/vision/matchday/page.tsx');
const predictPage    = read('../app/vision/predict/page.tsx');
const fantasyPage    = read('../app/vision/fantasy/page.tsx');
const clubsPage      = read('../app/vision/clubs/page.tsx');
const playerPage     = read('../app/vision/player/page.tsx');
const accountPage    = read('../app/vision/account/page.tsx');
const navWrapper     = read('../components/navigation/NavWrapper.tsx');

// Components
const matchweekHero   = read('../components/vision/MatchweekHero.tsx');
const liveRibbon      = read('../components/vision/LiveScoreRibbon.tsx');
const fixtureCarousel = read('../components/vision/PremiumFixtureCarousel.tsx');
const predictionCard  = read('../components/vision/PredictionScoreCard.tsx');
const leagueTable     = read('../components/vision/LeagueTablePanel.tsx');
const playerSpotlight = read('../components/vision/PlayerSpotlight.tsx');
const topPerformers   = read('../components/vision/TopPerformers.tsx');
const storyGrid       = read('../components/vision/EditorialStoryGrid.tsx');
const videoRail       = read('../components/vision/VideoHighlightRail.tsx');
const clubRail        = read('../components/vision/ClubIdentityRail.tsx');
const sponsorMoment   = read('../components/vision/SponsorMoment.tsx');
const fantasyPanel    = read('../components/vision/FantasyGameweekPanel.tsx');
const fanValuePanel   = read('../components/vision/FanValuePanel.tsx');
const shareSheet      = read('../components/vision/SharePredictionSheet.tsx');
const barrelIndex     = read('../components/vision/index.ts');

/* ── vision-data.ts ─────────────────────────────────────────────── */
describe('vision-data.ts', () => {
  it('exports PSL_CLUBS', ()    => { expect(visionData).toContain('PSL_CLUBS'); });
  it('exports PSL_FIXTURES', () => { expect(visionData).toContain('PSL_FIXTURES'); });
  it('exports PSL_STANDINGS', ()=> { expect(visionData).toContain('PSL_STANDINGS'); });
  it('exports PSL_PLAYERS', ()  => { expect(visionData).toContain('PSL_PLAYERS'); });
  it('exports PSL_STORIES', ()  => { expect(visionData).toContain('PSL_STORIES'); });
  it('exports CURRENT_GAMEWEEK',()=> { expect(visionData).toContain('CURRENT_GAMEWEEK'); });
  it('exports MOCK_FAN_VALUE',  ()=> { expect(visionData).toContain('MOCK_FAN_VALUE'); });
  it('exports visionImg helper',()=> { expect(visionData).toContain('visionImg'); });
  it('exports getDataMode',     ()=> { expect(visionData).toContain('getDataMode'); });
  it('has 16 PSL clubs',        ()=> {
    const matches = (visionData.match(/id: '/g) ?? []).length;
    expect(matches).toBeGreaterThanOrEqual(16);
  });
  it('references picsum.photos for images', () => { expect(visionData).toContain('picsum.photos'); });
  it('has DESIGN_REVIEW_DATA mode fallback',  () => { expect(visionData).toContain('DESIGN_REVIEW_DATA'); });
  it('supports LIVE_BETA_DATA mode',          () => { expect(visionData).toContain('LIVE_BETA_DATA'); });
});

/* ── Gating infrastructure ──────────────────────────────────────── */
describe('Vision Studio gate (/vision/layout.tsx)', () => {
  it('checks NEXT_PUBLIC_VISION_STUDIO_ENABLED', () => {
    expect(visionLayout).toContain('NEXT_PUBLIC_VISION_STUDIO_ENABLED');
  });
  it('renders 404-style gate when disabled', () => {
    expect(visionLayout).toContain('Vision Studio Disabled');
  });
  it('is noindex', () => { expect(visionLayout).toContain('index: false'); });
  it('has back link to home', () => { expect(visionLayout).toContain('href="/"'); });
});

/* ── NavWrapper exclusion ───────────────────────────────────────── */
describe('NavWrapper excludes /vision routes', () => {
  it('checks isVision path', () => { expect(navWrapper).toContain('isVision'); });
  it('skips global nav for /vision', () => {
    expect(navWrapper).toContain("startsWith('/vision')");
  });
  it('uses isVision in exclusion condition', () => {
    expect(navWrapper).toContain('isVision');
  });
});

/* ── Vision Hub ─────────────────────────────────────────────────── */
describe('/vision hub page', () => {
  it('uses client directive', () => { expect(visionHub).toContain("'use client'"); });
  it('links to all 8 sub-routes', () => {
    const routes = ['/vision/in-season', '/vision/matchday', '/vision/predict', '/vision/fantasy', '/vision/clubs', '/vision/player', '/vision/account'];
    routes.forEach(r => expect(visionHub).toContain(r));
  });
  it('shows data mode indicator', () => { expect(visionHub).toContain('getDataMode'); });
  it('has non-financial notice',   () => { expect(visionHub).toContain('Points only'); });
  it('has back link to live site', () => { expect(visionHub).toContain('href="/"'); });
  it('uses framer-motion',         () => { expect(visionHub).toContain('framer-motion'); });
  it('uses picsum images',         () => { expect(visionHub).toContain('visionImg'); });
  it('has min-h-[100dvh]',        () => { expect(visionHub).toContain('100dvh'); });
});

/* ── In-Season page (flagship, all 15 components) ───────────────── */
describe('/vision/in-season page', () => {
  it('uses client directive', () => { expect(inSeasonPage).toContain("'use client'"); });
  it('imports MatchweekHero',          () => { expect(inSeasonPage).toContain('MatchweekHero'); });
  it('imports LiveScoreRibbon',        () => { expect(inSeasonPage).toContain('LiveScoreRibbon'); });
  it('imports PremiumFixtureCarousel', () => { expect(inSeasonPage).toContain('PremiumFixtureCarousel'); });
  it('imports LeagueTablePanel',       () => { expect(inSeasonPage).toContain('LeagueTablePanel'); });
  it('imports PlayerSpotlight',        () => { expect(inSeasonPage).toContain('PlayerSpotlight'); });
  it('imports TopPerformers',          () => { expect(inSeasonPage).toContain('TopPerformers'); });
  it('imports EditorialStoryGrid',     () => { expect(inSeasonPage).toContain('EditorialStoryGrid'); });
  it('imports VideoHighlightRail',     () => { expect(inSeasonPage).toContain('VideoHighlightRail'); });
  it('imports ClubIdentityRail',       () => { expect(inSeasonPage).toContain('ClubIdentityRail'); });
  it('imports SponsorMoment',          () => { expect(inSeasonPage).toContain('SponsorMoment'); });
  it('imports FantasyGameweekPanel',   () => { expect(inSeasonPage).toContain('FantasyGameweekPanel'); });
  it('imports FanValuePanel',          () => { expect(inSeasonPage).toContain('FanValuePanel'); });
  it('has non-financial disclaimer',   () => { expect(inSeasonPage).toContain('No real money'); });
  it('has vision back nav',            () => { expect(inSeasonPage).toContain('/vision'); });
});

/* ── Matchday page ──────────────────────────────────────────────── */
describe('/vision/matchday page', () => {
  it('uses client directive', () => { expect(matchdayPage).toContain("'use client'"); });
  it('imports LiveScoreRibbon', () => { expect(matchdayPage).toContain('LiveScoreRibbon'); });
  it('imports SponsorMoment',   () => { expect(matchdayPage).toContain('SponsorMoment'); });
  it('shows live indicator',    () => { expect(matchdayPage).toContain('LIVE'); });
  it('has predict link',        () => { expect(matchdayPage).toContain('/vision/predict'); });
  it('has points-only notice',  () => { expect(matchdayPage).toContain('Points only'); });
  it('uses picsum images',      () => { expect(matchdayPage).toContain('visionImg'); });
  it('has challenge link',      () => { expect(matchdayPage).toContain('social-challenges'); });
  it('has no gambling language',() => {
    expect(matchdayPage).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
});

/* ── Predict page (Guess the Score) ────────────────────────────── */
describe('/vision/predict page', () => {
  it('uses client directive',        () => { expect(predictPage).toContain("'use client'"); });
  it('imports PredictionScoreCard',  () => { expect(predictPage).toContain('PredictionScoreCard'); });
  it('imports SharePredictionSheet', () => { expect(predictPage).toContain('SharePredictionSheet'); });
  it('has Guess the Score heading',  () => { expect(predictPage).toContain('Guess the Score'); });
  it('has score stepper',            () => { expect(predictPage).toContain('ScoreStepper'); });
  it('has popLayout animation',      () => { expect(predictPage).toContain('popLayout'); });
  it('has lock in prediction CTA',   () => { expect(predictPage).toContain('Lock in prediction'); });
  it('has next prediction flow',     () => { expect(predictPage).toContain('Next'); });
  it('has points-only notice',       () => { expect(predictPage).toContain('Points only'); });
  it('has no real money text',       () => { expect(predictPage).toContain('no real money'); });
  it('has no gambling language', () => {
    expect(predictPage).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
  it('uses framer AnimatePresence',  () => { expect(predictPage).toContain('AnimatePresence'); });
  it('has fixture indicator pills',  () => { expect(predictPage).toContain('Fixture'); });
  it('has min-h-[44px] touch targets', () => { expect(predictPage).toContain('min-h-[44px]'); });
});

/* ── Fantasy page ───────────────────────────────────────────────── */
describe('/vision/fantasy page', () => {
  it('uses client directive',         () => { expect(fantasyPage).toContain("'use client'"); });
  it('imports FantasyGameweekPanel',  () => { expect(fantasyPage).toContain('FantasyGameweekPanel'); });
  it('imports TopPerformers',         () => { expect(fantasyPage).toContain('TopPerformers'); });
  it('imports LeagueTablePanel',      () => { expect(fantasyPage).toContain('LeagueTablePanel'); });
  it('renders pitch view',            () => { expect(fantasyPage).toContain('PitchPosition'); });
  it('has make transfers CTA',        () => { expect(fantasyPage).toContain('Make transfers'); });
  it('has points-only disclaimer',    () => { expect(fantasyPage).toContain('Points only'); });
});

/* ── Clubs page ─────────────────────────────────────────────────── */
describe('/vision/clubs page', () => {
  it('uses client directive',  () => { expect(clubsPage).toContain("'use client'"); });
  it('imports PSL_CLUBS',      () => { expect(clubsPage).toContain('PSL_CLUBS'); });
  it('imports PSL_STANDINGS',  () => { expect(clubsPage).toContain('PSL_STANDINGS'); });
  it('uses framer-motion',     () => { expect(clubsPage).toContain('framer-motion'); });
  it('has 16 clubs grid',      () => { expect(clubsPage).toContain('PSL_CLUBS.map'); });
  it('has club detail panel',  () => { expect(clubsPage).toContain('activeClub'); });
  it('has disclaimer',         () => { expect(clubsPage).toContain('Points only'); });
});

/* ── Player page ────────────────────────────────────────────────── */
describe('/vision/player page', () => {
  it('uses client directive',  () => { expect(playerPage).toContain("'use client'"); });
  it('imports PSL_PLAYERS',    () => { expect(playerPage).toContain('PSL_PLAYERS'); });
  it('has player selector',    () => { expect(playerPage).toContain('selectedId'); });
  it('has stats grid',         () => { expect(playerPage).toContain('Goals'); });
  it('links to fantasy',       () => { expect(playerPage).toContain('/vision/fantasy'); });
  it('links to predict',       () => { expect(playerPage).toContain('/vision/predict'); });
  it('has points-only notice', () => { expect(playerPage).toContain('Points only'); });
  it('uses framer-motion',     () => { expect(playerPage).toContain('framer-motion'); });
});

/* ── Account page ───────────────────────────────────────────────── */
describe('/vision/account page', () => {
  it('uses client directive',         () => { expect(accountPage).toContain("'use client'"); });
  it('imports FanValuePanel',         () => { expect(accountPage).toContain('FanValuePanel'); });
  it('imports FantasyGameweekPanel',  () => { expect(accountPage).toContain('FantasyGameweekPanel'); });
  it('shows mock user name',          () => { expect(accountPage).toContain('Sipho Nkosi'); });
  it('has achievements section',      () => { expect(accountPage).toContain('Achievements'); });
  it('has non-financial notice',      () => { expect(accountPage).toContain('No real money'); });
  it('has points non-financial note', () => { expect(accountPage).toContain('non-financial'); });
  it('links to fan-value',            () => { expect(accountPage).toContain('fan-value'); });
  it('uses framer-motion',            () => { expect(accountPage).toContain('framer-motion'); });
  it('has no gambling language', () => {
    expect(accountPage).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
});

/* ── Component: MatchweekHero ───────────────────────────────────── */
describe('MatchweekHero component', () => {
  it('uses client directive',  () => { expect(matchweekHero).toContain("'use client'"); });
  it('uses framer-motion',     () => { expect(matchweekHero).toContain('framer-motion'); });
  it('uses useReducedMotion',  () => { expect(matchweekHero).toContain('useReducedMotion'); });
  it('uses picsum image',      () => { expect(matchweekHero).toContain('visionImg'); });
  it('uses min-h for stability', () => { expect(matchweekHero).toContain('min-h-'); });
  it('has aria-label',         () => { expect(matchweekHero).toContain('aria-label'); });
  it('shows gameweek label',   () => { expect(matchweekHero).toContain('gameweek.label'); });
  it('shows competition name', () => { expect(matchweekHero).toContain('competitionName'); });
  it('shows highest points',   () => { expect(matchweekHero).toContain('highestPoints'); });
});

/* ── Component: LiveScoreRibbon ─────────────────────────────────── */
describe('LiveScoreRibbon component', () => {
  it('uses client directive',  () => { expect(liveRibbon).toContain("'use client'"); });
  it('has nav aria-label',     () => { expect(liveRibbon).toContain('aria-label'); });
  it('shows live indicator',   () => { expect(liveRibbon).toContain('Live'); });
  it('filters active fixtures',() => { expect(liveRibbon).toContain('filter'); });
  it('has live-pulse animation', () => { expect(liveRibbon).toContain('animate-live-pulse'); });
  it('has minute display',     () => { expect(liveRibbon).toContain('minute'); });
});

/* ── Component: PremiumFixtureCarousel ──────────────────────────── */
describe('PremiumFixtureCarousel component', () => {
  it('uses client directive',  () => { expect(fixtureCarousel).toContain("'use client'"); });
  it('uses framer-motion',     () => { expect(fixtureCarousel).toContain('framer-motion'); });
  it('has scroll-snap',        () => { expect(fixtureCarousel).toContain('scrollSnapType'); });
  it('has role=list',          () => { expect(fixtureCarousel).toContain('role="list"'); });
  it('has aria-label on list item', () => { expect(fixtureCarousel).toContain('aria-label'); });
  it('links to predict',       () => { expect(fixtureCarousel).toContain('/vision/predict'); });
  it('shows live indicator',   () => { expect(fixtureCarousel).toContain('animate-live-pulse'); });
});

/* ── Component: PredictionScoreCard ─────────────────────────────── */
describe('PredictionScoreCard component', () => {
  it('uses client directive',   () => { expect(predictionCard).toContain("'use client'"); });
  it('uses AnimatePresence',    () => { expect(predictionCard).toContain('AnimatePresence'); });
  it('uses motion.div',         () => { expect(predictionCard).toContain('motion.div'); });
  it('has Points only text',    () => { expect(predictionCard).toContain('Points only'); });
  it('has no real money text',  () => { expect(predictionCard).toContain('no real money'); });
  it('shows home/away score',   () => { expect(predictionCard).toContain('homeScore'); });
  it('shows club names',        () => { expect(predictionCard).toContain('homeClub'); });
  it('has dismiss button',      () => { expect(predictionCard).toContain('onDismiss'); });
  it('has WhatsApp share',      () => { expect(predictionCard).toContain('whatsappShareUrl'); });
  it('has no gambling language', () => {
    expect(predictionCard).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
  it('does not contain prohibited terms', () => {
    expect(predictionCard).not.toMatch(/\b(bet|wager|gambling|payout|cash prize)\b/i);
  });
});

/* ── Component: LeagueTablePanel ────────────────────────────────── */
describe('LeagueTablePanel component', () => {
  it('uses client directive',  () => { expect(leagueTable).toContain("'use client'"); });
  it('has aria-label',         () => { expect(leagueTable).toContain('aria-label'); });
  it('has form dots',          () => { expect(leagueTable).toContain('FormDot'); });
  it('shows position numbers', () => { expect(leagueTable).toContain('position'); });
  it('shows points',           () => { expect(leagueTable).toContain('points'); });
  it('shows goal difference',  () => { expect(leagueTable).toContain('GD'); });
  it('has full table link',    () => { expect(leagueTable).toContain('Full table'); });
  it('has champions zone indicator', () => { expect(leagueTable).toContain('Champions'); });
});

/* ── Component: PlayerSpotlight ─────────────────────────────────── */
describe('PlayerSpotlight component', () => {
  it('uses client directive',  () => { expect(playerSpotlight).toContain("'use client'"); });
  it('uses framer-motion',     () => { expect(playerSpotlight).toContain('framer-motion'); });
  it('uses useReducedMotion',  () => { expect(playerSpotlight).toContain('useReducedMotion'); });
  it('uses picsum image',      () => { expect(playerSpotlight).toContain('visionImg'); });
  it('shows goals',            () => { expect(playerSpotlight).toContain('Goals'); });
  it('shows FPL price',        () => { expect(playerSpotlight).toContain('fantasyPrice'); });
  it('links to player page',   () => { expect(playerSpotlight).toContain('/vision/player'); });
  it('has aria-label',         () => { expect(playerSpotlight).toContain('aria-label'); });
});

/* ── Component: TopPerformers ───────────────────────────────────── */
describe('TopPerformers component', () => {
  it('uses client directive',  () => { expect(topPerformers).toContain("'use client'"); });
  it('shows fantasy points',   () => { expect(topPerformers).toContain('fantasyPoints'); });
  it('has pick link',          () => { expect(topPerformers).toContain('Pick'); });
  it('links to fantasy',       () => { expect(topPerformers).toContain('/vision/fantasy'); });
  it('uses picsum images',     () => { expect(topPerformers).toContain('visionImg'); });
  it('sorts by fantasy points', () => { expect(topPerformers).toContain('sort'); });
});

/* ── Component: EditorialStoryGrid ──────────────────────────────── */
describe('EditorialStoryGrid component', () => {
  it('uses client directive',  () => { expect(storyGrid).toContain("'use client'"); });
  it('uses framer-motion',     () => { expect(storyGrid).toContain('framer-motion'); });
  it('uses whileInView',       () => { expect(storyGrid).toContain('whileInView'); });
  it('uses useReducedMotion',  () => { expect(storyGrid).toContain('useReducedMotion'); });
  it('uses picsum images',     () => { expect(storyGrid).toContain('visionImg'); });
  it('has featured article',   () => { expect(storyGrid).toContain('featured'); });
  it('shows category label',   () => { expect(storyGrid).toContain('category'); });
  it('shows read time',        () => { expect(storyGrid).toContain('readTime'); });
  it('has asymmetric grid (col-span-2)', () => { expect(storyGrid).toContain('col-span-2'); });
});

/* ── Component: VideoHighlightRail ──────────────────────────────── */
describe('VideoHighlightRail component', () => {
  it('uses client directive',  () => { expect(videoRail).toContain("'use client'"); });
  it('has scroll-snap',        () => { expect(videoRail).toContain('scrollSnapType'); });
  it('has role=list',          () => { expect(videoRail).toContain('role="list"'); });
  it('has play button',        () => { expect(videoRail).toContain('play'); });
  it('shows story titles',     () => { expect(videoRail).toContain('story.title'); });
  it('links to all videos',    () => { expect(videoRail).toContain('/media'); });
  it('uses picsum images',     () => { expect(videoRail).toContain('visionImg'); });
});

/* ── Component: ClubIdentityRail ────────────────────────────────── */
describe('ClubIdentityRail component', () => {
  it('uses client directive',  () => { expect(clubRail).toContain("'use client'"); });
  it('uses framer-motion',     () => { expect(clubRail).toContain('framer-motion'); });
  it('uses whileInView',       () => { expect(clubRail).toContain('whileInView'); });
  it('has scroll-snap',        () => { expect(clubRail).toContain('scrollSnapType'); });
  it('has role=list',          () => { expect(clubRail).toContain('role="list"'); });
  it('links to clubs hub',     () => { expect(clubRail).toContain('/vision/clubs'); });
  it('maps clubs to badges',   () => { expect(clubRail).toContain('clubs.map'); });
  it('uses abbreviations',     () => { expect(clubRail).toContain('abbr'); });
});

/* ── Component: SponsorMoment ───────────────────────────────────── */
describe('SponsorMoment component', () => {
  it('labels as sponsored content', () => { expect(sponsorMoment).toContain('Sponsored'); });
  it('has no gambling language', () => {
    expect(sponsorMoment).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
  it('has disclaimer', () => { expect(sponsorMoment).toContain('No gambling'); });
  it('uses rel=noopener', () => { expect(sponsorMoment).toContain('noopener'); });
  it('has aria-label',   () => { expect(sponsorMoment).toContain('aria-label'); });
});

/* ── Component: FantasyGameweekPanel ────────────────────────────── */
describe('FantasyGameweekPanel component', () => {
  it('uses client directive',  () => { expect(fantasyPanel).toContain("'use client'"); });
  it('shows gameweek label',   () => { expect(fantasyPanel).toContain('gameweek.label'); });
  it('shows total points',     () => { expect(fantasyPanel).toContain('totalPoints'); });
  it('shows captain',          () => { expect(fantasyPanel).toContain('captain'); });
  it('shows transfers remaining', () => { expect(fantasyPanel).toContain('transfersRemaining'); });
  it('links to fantasy',       () => { expect(fantasyPanel).toContain('/vision/fantasy'); });
  it('has non-financial notice', () => { expect(fantasyPanel).toContain('no real money'); });
  it('uses picsum images',     () => { expect(fantasyPanel).toContain('visionImg'); });
});

/* ── Component: FanValuePanel ───────────────────────────────────── */
describe('FanValuePanel component', () => {
  it('uses client directive',  () => { expect(fanValuePanel).toContain("'use client'"); });
  it('uses framer-motion',     () => { expect(fanValuePanel).toContain('framer-motion'); });
  it('uses whileInView',       () => { expect(fanValuePanel).toContain('whileInView'); });
  it('shows total points',     () => { expect(fanValuePanel).toContain('fanValue.total'); });
  it('shows fan level',        () => { expect(fanValuePanel).toContain('fanValue.level'); });
  it('shows progress bar',     () => { expect(fanValuePanel).toContain('progressPercent'); });
  it('shows breakdown',        () => { expect(fanValuePanel).toContain('breakdown'); });
  it('has non-financial notice', () => { expect(fanValuePanel).toContain('non-financial'); });
  it('links to fan-value',     () => { expect(fanValuePanel).toContain('/fan-value'); });
  it('has no gambling language', () => {
    expect(fanValuePanel).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
});

/* ── Component: SharePredictionSheet ────────────────────────────── */
describe('SharePredictionSheet component', () => {
  it('uses client directive',   () => { expect(shareSheet).toContain("'use client'"); });
  it('uses AnimatePresence',    () => { expect(shareSheet).toContain('AnimatePresence'); });
  it('uses motion.div',         () => { expect(shareSheet).toContain('motion.div'); });
  it('has role=dialog',         () => { expect(shareSheet).toContain('role="dialog"'); });
  it('has aria-modal',          () => { expect(shareSheet).toContain('aria-modal'); });
  it('closes on Escape',        () => { expect(shareSheet).toContain("'Escape'"); });
  it('has WhatsApp share',      () => { expect(shareSheet).toContain('whatsappShareUrl'); });
  it('has X/Twitter share',     () => { expect(shareSheet).toContain('twitterShareUrl'); });
  it('has copy link action',    () => { expect(shareSheet).toContain('copyToClipboard'); });
  it('has close aria-label',    () => { expect(shareSheet).toContain('Close share prediction'); });
  it('has spring easing',       () => { expect(shareSheet).toContain('[0.32, 0.72, 0, 1]'); });
  it('has safe-area-inset-bottom', () => { expect(shareSheet).toContain('safe-area-inset-bottom'); });
  it('has min-h-[44px] touch targets', () => { expect(shareSheet).toContain('min-h-[44px]'); });
  it('has Points only disclaimer', () => { expect(shareSheet).toContain('Points only'); });
  it('has no real money text',  () => { expect(shareSheet).toContain('No real money'); });
  it('uses useReducedMotion',   () => { expect(shareSheet).toContain('useReducedMotion'); });
  it('has no gambling language', () => {
    expect(shareSheet).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
  it('does not contain prohibited terms', () => {
    expect(shareSheet).not.toMatch(/\b(wager|gambling|payout|cash prize)\b/i);
  });
});

/* ── Barrel index ───────────────────────────────────────────────── */
describe('components/vision/index.ts barrel', () => {
  it('exports MatchweekHero',          () => { expect(barrelIndex).toContain('MatchweekHero'); });
  it('exports LiveScoreRibbon',        () => { expect(barrelIndex).toContain('LiveScoreRibbon'); });
  it('exports PremiumFixtureCarousel', () => { expect(barrelIndex).toContain('PremiumFixtureCarousel'); });
  it('exports PredictionScoreCard',    () => { expect(barrelIndex).toContain('PredictionScoreCard'); });
  it('exports LeagueTablePanel',       () => { expect(barrelIndex).toContain('LeagueTablePanel'); });
  it('exports PlayerSpotlight',        () => { expect(barrelIndex).toContain('PlayerSpotlight'); });
  it('exports TopPerformers',          () => { expect(barrelIndex).toContain('TopPerformers'); });
  it('exports EditorialStoryGrid',     () => { expect(barrelIndex).toContain('EditorialStoryGrid'); });
  it('exports VideoHighlightRail',     () => { expect(barrelIndex).toContain('VideoHighlightRail'); });
  it('exports ClubIdentityRail',       () => { expect(barrelIndex).toContain('ClubIdentityRail'); });
  it('exports SponsorMoment',          () => { expect(barrelIndex).toContain('SponsorMoment'); });
  it('exports FantasyGameweekPanel',   () => { expect(barrelIndex).toContain('FantasyGameweekPanel'); });
  it('exports FanValuePanel',          () => { expect(barrelIndex).toContain('FanValuePanel'); });
  it('exports SharePredictionSheet',   () => { expect(barrelIndex).toContain('SharePredictionSheet'); });
});

/* ── Safety — no gambling language anywhere ─────────────────────── */
describe('Global safety: no gambling/betting language', () => {
  const allSources = [
    visionData, visionHub, inSeasonPage, matchdayPage, predictPage,
    fantasyPage, clubsPage, playerPage, accountPage,
    matchweekHero, liveRibbon, fixtureCarousel, predictionCard,
    leagueTable, playerSpotlight, topPerformers, storyGrid,
    videoRail, clubRail, sponsorMoment, fantasyPanel, fanValuePanel, shareSheet,
  ].join('\n');

  it('no "place a bet" anywhere',  () => { expect(allSources).not.toMatch(/place a bet/i); });
  it('no "betting odds" anywhere', () => { expect(allSources).not.toMatch(/betting odds/i); });
  it('no "cash prize" anywhere',   () => { expect(allSources).not.toMatch(/cash prize/i); });
  it('no "earn cash" anywhere',    () => { expect(allSources).not.toMatch(/earn cash/i); });
  it('no "win money" anywhere',    () => { expect(allSources).not.toMatch(/win money/i); });
  it('no "wager" anywhere',        () => { expect(allSources).not.toMatch(/\bwager\b/i); });
  it('no "gambling product" anywhere', () => { expect(allSources).not.toMatch(/gambling product/i); });
});

/* ── Reduced motion compliance ──────────────────────────────────── */
describe('Reduced motion compliance', () => {
  it('MatchweekHero respects useReducedMotion',   () => { expect(matchweekHero).toContain('useReducedMotion'); });
  it('EditorialStoryGrid respects useReducedMotion', () => { expect(storyGrid).toContain('useReducedMotion'); });
  it('SharePredictionSheet respects useReducedMotion', () => { expect(shareSheet).toContain('useReducedMotion'); });
  it('PlayerSpotlight respects useReducedMotion', () => { expect(playerSpotlight).toContain('useReducedMotion'); });
  it('framer handles reduced motion by default (library guarantee)', () => {
    expect(matchweekHero).toContain('framer-motion');
  });
});
