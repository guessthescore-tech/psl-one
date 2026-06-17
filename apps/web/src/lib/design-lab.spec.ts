import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  deriveSeasonMode,
  MODULE_ORDER,
  MODE_LABELS,
  ALL_MODES,
  type SeasonPresentationContext,
} from './season-presentation-state';

/* ── File readers ──────────────────────────────────────────────── */
const readFile = (rel: string) => readFileSync(join(__dirname, rel), 'utf-8');

const layoutSrc   = readFile('../app/design-lab/layout.tsx');
const indexSrc    = readFile('../app/design-lab/page.tsx');
const toolbarSrc  = readFile('../components/design-lab/DesignLabToolbar.tsx');
const inSeasonSrc = readFile('../app/design-lab/in-season-home/page.tsx');
const carouselSrc = readFile('../components/design-lab/FixturePredictionCarousel.tsx');
const b_pageSrc   = readFile('../app/design-lab/prediction-carousel/page.tsx');
const pitchSrc    = readFile('../components/design-lab/FantasyPitch.tsx');
const c_pageSrc   = readFile('../app/design-lab/fantasy-hub/page.tsx');
const d_pageSrc   = readFile('../app/design-lab/account/page.tsx');

/* ── Design Lab gate ───────────────────────────────────────────── */
describe('Design Lab gate', () => {
  it('layout checks NEXT_PUBLIC_DESIGN_LAB_ENABLED', () => {
    expect(layoutSrc).toContain('NEXT_PUBLIC_DESIGN_LAB_ENABLED');
    expect(layoutSrc).toContain("=== 'true'");
  });

  it('layout shows disabled page when env var is absent', () => {
    expect(layoutSrc).toContain('Design Lab Disabled');
    expect(layoutSrc).toContain('NEXT_PUBLIC_DESIGN_LAB_ENABLED=true');
  });

  it('layout has noindex robots meta', () => {
    expect(layoutSrc).toContain('robots');
    expect(layoutSrc).toContain('index: false');
  });

  it('design lab index is not linked from main navigation (not in root page)', () => {
    const rootSrc = readFile('../app/page.tsx');
    expect(rootSrc).not.toContain('/design-lab');
  });
});

/* ── Season presentation state model ──────────────────────────── */
describe('season-presentation-state', () => {
  const base: SeasonPresentationContext = {
    seasonStatus: 'ACTIVE',
    isActive: true,
    hasActiveFixture: false,
    hasRecentResult: false,
    nextFixtureMinutesAway: null,
  };

  it('returns OFF_SEASON when isActive=false', () => {
    expect(deriveSeasonMode({ ...base, isActive: false })).toBe('OFF_SEASON');
  });

  it('returns OFF_SEASON when seasonStatus=null', () => {
    expect(deriveSeasonMode({ ...base, seasonStatus: null })).toBe('OFF_SEASON');
  });

  it('returns PRE_SEASON for UPCOMING status', () => {
    expect(deriveSeasonMode({ ...base, seasonStatus: 'UPCOMING' })).toBe('PRE_SEASON');
  });

  it('returns PRE_SEASON for PRE_SEASON status', () => {
    expect(deriveSeasonMode({ ...base, seasonStatus: 'PRE_SEASON' })).toBe('PRE_SEASON');
  });

  it('returns MATCHDAY_LIVE when hasActiveFixture=true', () => {
    expect(deriveSeasonMode({ ...base, hasActiveFixture: true })).toBe('MATCHDAY_LIVE');
  });

  it('returns POST_MATCH when hasRecentResult=true and no active fixture', () => {
    expect(deriveSeasonMode({ ...base, hasRecentResult: true })).toBe('POST_MATCH');
  });

  it('returns IN_SEASON by default for active season', () => {
    expect(deriveSeasonMode(base)).toBe('IN_SEASON');
  });

  it('ALL_MODES contains all 5 modes', () => {
    expect(ALL_MODES).toHaveLength(5);
    expect(ALL_MODES).toContain('OFF_SEASON');
    expect(ALL_MODES).toContain('PRE_SEASON');
    expect(ALL_MODES).toContain('IN_SEASON');
    expect(ALL_MODES).toContain('MATCHDAY_LIVE');
    expect(ALL_MODES).toContain('POST_MATCH');
  });

  it('MODE_LABELS has a label for every mode', () => {
    for (const mode of ALL_MODES) {
      expect(MODE_LABELS[mode]).toBeTruthy();
    }
  });

  it('MODULE_ORDER defines module lists for every mode', () => {
    for (const mode of ALL_MODES) {
      expect(Array.isArray(MODULE_ORDER[mode])).toBe(true);
      expect(MODULE_ORDER[mode].length).toBeGreaterThan(0);
    }
  });

  it('IN_SEASON order puts fixtures first', () => {
    expect(MODULE_ORDER['IN_SEASON'][0]).toBe('fixtures');
  });

  it('MATCHDAY_LIVE order puts liveMatches first', () => {
    expect(MODULE_ORDER['MATCHDAY_LIVE'][0]).toBe('liveMatches');
  });
});

/* ── Toolbar component ─────────────────────────────────────────── */
describe('DesignLabToolbar', () => {
  it('exports DesignLabProvider', () => {
    expect(toolbarSrc).toContain('export function DesignLabProvider');
  });

  it('exports useDesignLab hook', () => {
    expect(toolbarSrc).toContain('export function useDesignLab');
  });

  it('has viewport controls (desktop/tablet/mobile)', () => {
    expect(toolbarSrc).toContain("'desktop'");
    expect(toolbarSrc).toContain("'tablet'");
    expect(toolbarSrc).toContain("'mobile'");
  });

  it('has season mode selector', () => {
    expect(toolbarSrc).toContain('seasonMode');
    expect(toolbarSrc).toContain('setSeasonMode');
  });

  it('has theme toggle (light/dark)', () => {
    expect(toolbarSrc).toContain("'light'");
    expect(toolbarSrc).toContain("'dark'");
  });

  it('has data state controls', () => {
    expect(toolbarSrc).toContain("'real'");
    expect(toolbarSrc).toContain("'loading'");
    expect(toolbarSrc).toContain("'empty'");
    expect(toolbarSrc).toContain("'error'");
  });

  it('constrains viewport width per mode', () => {
    expect(toolbarSrc).toContain('max-w-[1440px]');
    expect(toolbarSrc).toContain('max-w-[1024px]');
    expect(toolbarSrc).toContain('max-w-[390px]');
  });
});

/* ── Design Lab index page ─────────────────────────────────────── */
describe('Design Lab index', () => {
  it('lists all four demos', () => {
    expect(indexSrc).toContain('League Matchday');
    expect(indexSrc).toContain('Predict');
    expect(indexSrc).toContain('Fantasy Command Centre');
    expect(indexSrc).toContain('My PSL One');
  });

  it('links to all demo routes', () => {
    expect(indexSrc).toContain('/design-lab/in-season-home');
    expect(indexSrc).toContain('/design-lab/prediction-carousel');
    expect(indexSrc).toContain('/design-lab/fantasy-hub');
    expect(indexSrc).toContain('/design-lab/account');
  });

  it('has non-public notice', () => {
    expect(indexSrc).toContain('Not for public distribution');
    expect(indexSrc).toContain('Internal reference only');
  });

  it('discloses points-only framing prominently', () => {
    expect(indexSrc).toContain('points-only');
  });
});

/* ── Demo A: In-Season Home ────────────────────────────────────── */
describe('Demo A — in-season home', () => {
  it('uses DesignLabProvider', () => {
    expect(inSeasonSrc).toContain('DesignLabProvider');
  });

  it('has fixture rail', () => {
    expect(inSeasonSrc).toContain('Fixture rail');
    expect(inSeasonSrc).toContain('FixtureRailCard');
  });

  it('has league table section', () => {
    expect(inSeasonSrc).toContain('League standings');
  });

  it('has fantasy module', () => {
    expect(inSeasonSrc).toContain('FantasyCard');
  });

  it('has fan value module', () => {
    expect(inSeasonSrc).toContain('FanValueCard');
  });

  it('has mobile bottom navigation', () => {
    expect(inSeasonSrc).toContain('Mobile navigation');
  });

  it('uses real API clients', () => {
    expect(inSeasonSrc).toContain('footballClient');
    expect(inSeasonSrc).toContain('getActiveSeason');
  });

  it('has media rail', () => {
    expect(inSeasonSrc).toContain('Latest media');
  });

  it('uses scrollSnapType for fixture rail', () => {
    expect(inSeasonSrc).toContain('scrollSnapType');
  });
});

/* ── FixturePredictionCarousel component ───────────────────────── */
describe('FixturePredictionCarousel', () => {
  it('exports FixturePredictionCarousel', () => {
    expect(carouselSrc).toContain('export function FixturePredictionCarousel');
  });

  it('exports PredictionOutcome type', () => {
    expect(carouselSrc).toContain("PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY'");
  });

  it('exports CarouselFixture interface', () => {
    expect(carouselSrc).toContain('export interface CarouselFixture');
  });

  it('supports keyboard navigation (arrow keys)', () => {
    expect(carouselSrc).toContain("'ArrowRight'");
    expect(carouselSrc).toContain("'ArrowLeft'");
    expect(carouselSrc).toContain("'Home'");
    expect(carouselSrc).toContain("'End'");
  });

  it('supports mouse drag', () => {
    expect(carouselSrc).toContain('onMouseDown');
    expect(carouselSrc).toContain('onMouseMove');
    expect(carouselSrc).toContain('onMouseUp');
  });

  it('supports touch swipe', () => {
    expect(carouselSrc).toContain('onTouchStart');
    expect(carouselSrc).toContain('onTouchEnd');
  });

  it('uses scrollSnapType for carousel', () => {
    expect(carouselSrc).toContain('scrollSnapType');
  });

  it('has pagination dots', () => {
    expect(carouselSrc).toContain('tablist');
    expect(carouselSrc).toContain('Pagination dots');
  });

  it('has ARIA carousel semantics', () => {
    expect(carouselSrc).toContain('aria-roledescription="carousel"');
    expect(carouselSrc).toContain('aria-roledescription="slide"');
  });

  it('framing is points-only — no gambling mechanics', () => {
    expect(carouselSrc).toContain('Points only');
    expect(carouselSrc).toContain('no stakes');
    expect(carouselSrc).not.toContain('place a bet');
    expect(carouselSrc).not.toContain('win cash');
    expect(carouselSrc).not.toContain('gambling');
  });

  it('has outcome labels HOME/DRAW/AWAY (not bet-framed)', () => {
    expect(carouselSrc).toContain("'HOME'");
    expect(carouselSrc).toContain("'DRAW'");
    expect(carouselSrc).toContain("'AWAY'");
  });

  it('community stats use percentage framing — not odds', () => {
    expect(carouselSrc).toContain('Fan predictions');
    expect(carouselSrc).toContain('Pct');
    expect(carouselSrc).not.toContain('1/');
    expect(carouselSrc).not.toContain('2.0');
  });

  it('shows countdown timer', () => {
    expect(carouselSrc).toContain('Countdown');
    expect(carouselSrc).toContain('Locks in');
  });
});

/* ── Demo B: Prediction carousel page ──────────────────────────── */
describe('Demo B — prediction carousel page', () => {
  it('uses FixturePredictionCarousel', () => {
    expect(b_pageSrc).toContain('FixturePredictionCarousel');
  });

  it('loads real fixture data via footballClient', () => {
    expect(b_pageSrc).toContain('footballClient');
    expect(b_pageSrc).toContain('getActiveSeason');
  });

  it('has points-only notice', () => {
    expect(b_pageSrc).toContain('points-only');
    expect(b_pageSrc).toContain('no stakes');
    expect(b_pageSrc).toContain('no wagers');
  });

  it('does not use gambling mechanics language', () => {
    expect(b_pageSrc).not.toContain('place a bet');
    expect(b_pageSrc).not.toContain('win cash');
    expect(b_pageSrc).not.toContain('bet now');
  });
});

/* ── FantasyPitch component ────────────────────────────────────── */
describe('FantasyPitch', () => {
  it('exports FantasyPitch', () => {
    expect(pitchSrc).toContain('export function FantasyPitch');
  });

  it('renders pitch with formation rows', () => {
    expect(pitchSrc).toContain('PitchRow');
    expect(pitchSrc).toContain('BenchStrip');
  });

  it('has captain and vice-captain markers', () => {
    expect(pitchSrc).toContain('isCaptain');
    expect(pitchSrc).toContain('isViceCaptain');
  });

  it('supports position colours for all four positions', () => {
    expect(pitchSrc).toContain('GOALKEEPER');
    expect(pitchSrc).toContain('DEFENDER');
    expect(pitchSrc).toContain('MIDFIELDER');
    expect(pitchSrc).toContain('FORWARD');
  });

  it('has ARIA label for pitch', () => {
    expect(pitchSrc).toContain('Fantasy team pitch view');
  });

  it('parses formation string correctly', () => {
    expect(pitchSrc).toContain('parseFormation');
    expect(pitchSrc).toContain("split('-')");
  });
});

/* ── Demo C: Fantasy Hub page ───────────────────────────────────── */
describe('Demo C — fantasy hub page', () => {
  it('renders FantasyPitch', () => {
    expect(c_pageSrc).toContain('FantasyPitch');
  });

  it('has pitch/list/history tab UI', () => {
    expect(c_pageSrc).toContain("'pitch'");
    expect(c_pageSrc).toContain("'list'");
    expect(c_pageSrc).toContain("'history'");
  });

  it('loads real fantasy team data', () => {
    expect(c_pageSrc).toContain('fantasyClient');
    expect(c_pageSrc).toContain('getMyTeam');
  });

  it('loads gameweek deadline data', () => {
    expect(c_pageSrc).toContain('gameweeksClient');
    expect(c_pageSrc).toContain('getActive');
  });

  it('shows deadline countdown', () => {
    expect(c_pageSrc).toContain('Countdown');
    expect(c_pageSrc).toContain('transferDeadlineAt');
  });

  it('has non-financial notice', () => {
    expect(c_pageSrc).toContain('points only');
    expect(c_pageSrc).toContain('No entry fees');
  });

  it('does not use gambling mechanics language', () => {
    expect(c_pageSrc).not.toContain('place a bet');
    expect(c_pageSrc).not.toContain('win cash');
    expect(c_pageSrc).not.toContain('wager');
  });
});

/* ── Demo D: Account page ───────────────────────────────────────── */
describe('Demo D — account page', () => {
  it('has sign-in/join tab switcher', () => {
    expect(d_pageSrc).toContain("'join'");
    expect(d_pageSrc).toContain("'sign-in'");
    expect(d_pageSrc).toContain('Join Beta');
  });

  it('has club selector', () => {
    expect(d_pageSrc).toContain('ClubSelector');
    expect(d_pageSrc).toContain('Favourite Club');
  });

  it('has notification preferences panel', () => {
    expect(d_pageSrc).toContain('NotificationPrefsPanel');
    expect(d_pageSrc).toContain('matchReminders');
    expect(d_pageSrc).toContain('fantasyUpdates');
  });

  it('has fan identity card', () => {
    expect(d_pageSrc).toContain('FanIdentityCard');
    expect(d_pageSrc).toContain('Fan Identity');
  });

  it('has wallet notice with sandbox framing', () => {
    expect(d_pageSrc).toContain('WalletNotice');
    expect(d_pageSrc).toContain('sandbox mode');
    expect(d_pageSrc).toContain('No real money');
  });

  it('loads fan value summary', () => {
    expect(d_pageSrc).toContain('fanValueClient');
    expect(d_pageSrc).toContain('getSummary');
  });

  it('has social login placeholders marked as requiring configuration', () => {
    expect(d_pageSrc).toContain('Social login requires configuration');
  });

  it('has explicit points-only and non-financial declaration', () => {
    expect(d_pageSrc).toContain('points-only');
    expect(d_pageSrc).toContain('not a gambling');
  });
});

/* ── Cross-file: no real-money or gambling terminology ─────────── */
describe('Real-money and betting exclusions', () => {
  const allSources = [inSeasonSrc, carouselSrc, b_pageSrc, pitchSrc, c_pageSrc, d_pageSrc, toolbarSrc, indexSrc];

  it('no bet-placement language in any design lab file', () => {
    for (const s of allSources) {
      expect(s).not.toContain('place a bet');
      expect(s).not.toContain('place bets');
      expect(s).not.toContain('win cash');
    }
  });

  it('no gambling-as-feature language in any design lab file', () => {
    for (const s of allSources) {
      expect(s).not.toContain('gambling feature');
      expect(s).not.toContain('bet now');
    }
  });

  it('no production wallet activation in any design lab file', () => {
    for (const s of allSources) {
      expect(s).not.toContain('enableRealMoney');
      expect(s).not.toContain('activateProductionWallet');
    }
  });

  it('no PSL season activation in design lab', () => {
    for (const s of allSources) {
      expect(s).not.toContain('activatePslSeason');
      expect(s).not.toContain('PSL season active');
    }
  });

  it('WC 2026 context used in in-season home', () => {
    expect(inSeasonSrc).toContain('FIFA World Cup 2026');
  });
});

/* ── Route isolation — design lab not exposed from root ─────────── */
describe('Route isolation', () => {
  it('design-lab route not reachable from public navigation', () => {
    const rootSrc = readFile('../app/page.tsx');
    expect(rootSrc).not.toContain('/design-lab');
  });

  it('design-lab layout has noindex robots', () => {
    expect(layoutSrc).toContain('index: false');
    expect(layoutSrc).toContain('follow: false');
  });
});
