import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/* ── File readers ──────────────────────────────────────────────── */
const read = (rel: string) => readFileSync(join(__dirname, rel), 'utf-8');
const exists = (rel: string) => existsSync(join(__dirname, rel));

const navSrc     = read('../components/navigation/PrimaryNav.tsx');
const mobileSrc  = read('../components/navigation/MobileBottomNav.tsx');
const wrapperSrc = read('../components/navigation/NavWrapper.tsx');
const teamSrc    = read('../components/ui/TeamCrest.tsx');
const mediaSrc   = read('../components/ui/MediaThumbnail.tsx');
const heroSrc    = read('../components/ui/CompetitionHero.tsx');
const homeSrc    = read('../app/page.tsx');

/* ── PrimaryNav ────────────────────────────────────────────────── */
describe('PrimaryNav', () => {
  it('links to home', ()         => { expect(navSrc).toContain("href: '/'"); });
  it('links to matches', ()      => { expect(navSrc).toContain('/matches'); });
  it('links to football table', () => { expect(navSrc).toContain('/football'); });
  it('links to fantasy', ()      => { expect(navSrc).toContain('/fantasy'); });
  it('links to predictions', ()  => { expect(navSrc).toContain('/predictions'); });
  it('links to leaderboards', () => { expect(navSrc).toContain('/leaderboards'); });
  it('links to clubs', ()        => { expect(navSrc).toContain('/clubs'); });
  it('links to players', ()      => { expect(navSrc).toContain('/players'); });
  it('links to media', ()        => { expect(navSrc).toContain('/media'); });
  it('has aria-current', ()      => { expect(navSrc).toContain('aria-current'); });
  it('uses usePathname', ()      => { expect(navSrc).toContain('usePathname'); });
  it('has Primary navigation aria-label', () => { expect(navSrc).toContain('Primary navigation'); });
  it('links to sign in', ()      => { expect(navSrc).toContain('/login'); });
  it('links to join beta', ()    => { expect(navSrc).toContain('/register'); });
  it('has keyboard accessible hamburger', () => { expect(navSrc).toContain('aria-expanded'); });
  it('has mobile menu aria-label',  () => { expect(navSrc).toContain('Mobile menu navigation'); });
  it('uses Next.js Link',          () => { expect(navSrc).toContain("from 'next/link'"); });
  it('has focus-visible ring',      () => { expect(navSrc).toContain('focus-visible'); });
});

/* ── MobileBottomNav ───────────────────────────────────────────── */
describe('MobileBottomNav', () => {
  it('links to home', ()         => { expect(mobileSrc).toContain("href: '/'"); });
  it('links to matches', ()      => { expect(mobileSrc).toContain('/matches'); });
  it('links to fantasy', ()      => { expect(mobileSrc).toContain('/fantasy'); });
  it('links to predictions', ()  => { expect(mobileSrc).toContain('/predictions'); });
  it('links to profile', ()      => { expect(mobileSrc).toContain('/profile'); });
  it('has aria-current', ()      => { expect(mobileSrc).toContain('aria-current'); });
  it('uses usePathname', ()      => { expect(mobileSrc).toContain('usePathname'); });
  it('has 44px min touch target', () => { expect(mobileSrc).toContain('44'); });
  it('has Mobile bottom navigation aria-label', () => { expect(mobileSrc).toContain('Mobile bottom navigation'); });
  it('supports safe-area-inset-bottom', () => { expect(mobileSrc).toContain('safe-area-inset-bottom'); });
  it('uses Next.js Link', ()     => { expect(mobileSrc).toContain("from 'next/link'"); });
  it('has filled/outlined icon states', () => { expect(mobileSrc).toContain('filled'); });
});

/* ── NavWrapper ────────────────────────────────────────────────── */
describe('NavWrapper', () => {
  it('excludes design-lab routes', () => { expect(wrapperSrc).toContain('/design-lab'); });
  it('renders PrimaryNav',    ()    => { expect(wrapperSrc).toContain('PrimaryNav'); });
  it('renders MobileBottomNav', ()  => { expect(wrapperSrc).toContain('MobileBottomNav'); });
  it('adds bottom padding for mobile nav clearance', () => { expect(wrapperSrc).toContain('pb-14'); });
  it('uses usePathname', ()         => { expect(wrapperSrc).toContain('usePathname'); });
});

/* ── Route file existence ──────────────────────────────────────── */
describe('Route files exist', () => {
  const appRoot = join(__dirname, '../app');
  const routeExists = (route: string) =>
    existsSync(route === '/' ? join(appRoot, 'page.tsx') : join(appRoot, route.slice(1), 'page.tsx'));

  it('home page exists',         () => { expect(routeExists('/')).toBe(true); });
  it('matches page exists',      () => { expect(routeExists('/matches')).toBe(true); });
  it('football page exists',     () => { expect(routeExists('/football')).toBe(true); });
  it('fantasy page exists',      () => { expect(routeExists('/fantasy')).toBe(true); });
  it('predictions page exists',  () => { expect(routeExists('/predictions')).toBe(true); });
  it('leaderboards page exists', () => { expect(routeExists('/leaderboards')).toBe(true); });
  it('clubs page exists',        () => { expect(routeExists('/clubs')).toBe(true); });
  it('players page exists',      () => { expect(routeExists('/players')).toBe(true); });
  it('media page exists',        () => { expect(routeExists('/media')).toBe(true); });
  it('profile page exists',      () => { expect(routeExists('/profile')).toBe(true); });
  it('login page exists',        () => { expect(routeExists('/login')).toBe(true); });
  it('register page exists',     () => { expect(routeExists('/register')).toBe(true); });
});

/* ── Image components ──────────────────────────────────────────── */
describe('TeamCrest', () => {
  it('uses Next.js Image',    () => { expect(teamSrc).toContain("from 'next/image'"); });
  it('has imgError fallback', () => { expect(teamSrc).toContain('imgError'); });
  it('has size variants',     () => { expect(teamSrc).toContain('SIZE'); });
  it('has accessible alt text', () => { expect(teamSrc).toContain('crest'); });
  it('has flag emoji support', () => { expect(teamSrc).toContain('FLAG'); });
  it('exports getCountryFlag', () => { expect(teamSrc).toContain('getCountryFlag'); });
});

describe('MediaThumbnail', () => {
  it('uses Next.js Image',    () => { expect(mediaSrc).toContain("from 'next/image'"); });
  it('has imgError fallback', () => { expect(mediaSrc).toContain('imgError'); });
  it('has media type gradients', () => { expect(mediaSrc).toContain('TYPE_GRADIENT'); });
  it('has accessible role',   () => { expect(mediaSrc).toContain('role="img"'); });
});

describe('CompetitionHero', () => {
  it('uses pitch texture',    () => { expect(heroSrc).toContain('pitch-dark'); });
  it('has loading state',     () => { expect(heroSrc).toContain('loading'); });
  it('has accessible banner', () => { expect(heroSrc).toContain('role="banner"'); });
  it('has live indicator',    () => { expect(heroSrc).toContain('Active'); });
});

/* ── Homepage ──────────────────────────────────────────────────── */
describe('Homepage', () => {
  it('uses TeamCrest',        () => { expect(homeSrc).toContain('TeamCrest'); });
  it('uses MediaThumbnail',   () => { expect(homeSrc).toContain('MediaThumbnail'); });
  it('uses CompetitionHero',  () => { expect(homeSrc).toContain('CompetitionHero'); });
  it('uses country flags',    () => { expect(homeSrc).toContain('getCountryFlag'); });
  it('has live strip',        () => { expect(homeSrc).toContain('liveFixtures'); });
  it('has pitch texture overlay', () => { expect(homeSrc).toContain('bg-pitch-dark'); });
  it('no inline header nav',  () => { expect(homeSrc).not.toContain('<header'); });
  it('no inline mobile nav footer', () => { expect(homeSrc).not.toContain('<nav'); });
  it('links to /football for table', () => { expect(homeSrc).toContain('/football'); });
});
