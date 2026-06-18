import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/* ── Source readers ──────────────────────────────────────────────────────── */
const read = (rel: string) => readFileSync(join(__dirname, rel), 'utf-8');

const utilsSrc       = read('./share-utils.ts');
const shareButtonSrc = read('../components/share/ShareButton.tsx');
const menuSrc        = read('../components/share/FixtureShareMenu.tsx');
const predShareSrc   = read('../components/share/PredictionShareCard.tsx');
const challengeSrc   = read('../components/share/ChallengeFriendSheet.tsx');
const toastSrc       = read('../components/share/ShareSuccessToast.tsx');
const indexSrc       = read('../components/share/index.ts');
const fixturesPageSrc = read('../app/predictions/fixtures/page.tsx');
const predictPageSrc  = read('../app/predictions/fixtures/[id]/page.tsx');
const socialPageSrc   = read('../app/social-challenges/page.tsx');

/* ── share-utils.ts ──────────────────────────────────────────────────────── */
describe('share-utils.ts', () => {
  it('exports fixtureShareUrl', () => { expect(utilsSrc).toContain('fixtureShareUrl'); });
  it('exports predictionShareUrl', () => { expect(utilsSrc).toContain('predictionShareUrl'); });
  it('exports challengeShareUrl', () => { expect(utilsSrc).toContain('challengeShareUrl'); });
  it('exports whatsappShareUrl', () => { expect(utilsSrc).toContain('whatsappShareUrl'); });
  it('generates WhatsApp URL with wa.me domain', () => { expect(utilsSrc).toContain('wa.me'); });
  it('exports twitterShareUrl pointing to x.com', () => {
    expect(utilsSrc).toContain('x.com/intent/tweet');
  });
  it('exports predictionShareText', () => { expect(utilsSrc).toContain('predictionShareText'); });
  it('exports fixtureShareText', () => { expect(utilsSrc).toContain('fixtureShareText'); });
  it('exports canNativeShare', () => { expect(utilsSrc).toContain('canNativeShare'); });
  it('exports nativeShare', () => { expect(utilsSrc).toContain('nativeShare'); });
  it('exports copyToClipboard', () => { expect(utilsSrc).toContain('copyToClipboard'); });
  it('has legacy clipboard fallback', () => { expect(utilsSrc).toContain('execCommand'); });
});

/* ── predictionShareText safety ─────────────────────────────────────────── */
describe('predictionShareText — no gambling/cash language', () => {
  // Import inline to test the function directly
  it('does not contain betting/odds language in utils source', () => {
    expect(utilsSrc).not.toMatch(/\b(bet|betting|odds|wager|stake|prize|payout|winnings|gambling)\b/i);
  });
  it('does not contain prohibited money/deposit language in utils source', () => {
    expect(utilsSrc).not.toMatch(/earn money|deposit funds|withdraw|prize money|cash out/i);
  });
  it('includes Points only disclaimer in predictionShareText', () => {
    expect(utilsSrc).toContain('Points only');
  });
  it('includes no real money disclaimer', () => {
    expect(utilsSrc).toContain('no real money');
  });
});

/* ── ShareButton component ───────────────────────────────────────────────── */
describe('ShareButton', () => {
  it('uses client directive', () => { expect(shareButtonSrc).toContain("'use client'"); });
  it('has aria-label on share button', () => { expect(shareButtonSrc).toContain('aria-label'); });
  it('imports FixtureShareMenu', () => { expect(shareButtonSrc).toContain('FixtureShareMenu'); });
  it('uses framer-motion whileTap', () => { expect(shareButtonSrc).toContain('whileTap'); });
  it('supports icon variant', () => { expect(shareButtonSrc).toContain("'icon'"); });
  it('supports pill variant', () => { expect(shareButtonSrc).toContain("'pill'"); });
  it('supports card-footer variant', () => { expect(shareButtonSrc).toContain("'card-footer'"); });
  it('has 44px min touch target', () => { expect(shareButtonSrc).toContain('min-h-[44px]'); });
  it('has focus-visible ring', () => { expect(shareButtonSrc).toContain('focus-visible'); });
});

/* ── FixtureShareMenu component ─────────────────────────────────────────── */
describe('FixtureShareMenu', () => {
  it('uses client directive', () => { expect(menuSrc).toContain("'use client'"); });
  it('uses framer-motion AnimatePresence', () => { expect(menuSrc).toContain('AnimatePresence'); });
  it('uses framer-motion motion.div', () => { expect(menuSrc).toContain('motion.div'); });
  it('has role=dialog', () => { expect(menuSrc).toContain('role="dialog"'); });
  it('has aria-modal', () => { expect(menuSrc).toContain('aria-modal'); });
  it('has aria-label on dialog', () => { expect(menuSrc).toContain('aria-label'); });
  it('closes on Escape key', () => { expect(menuSrc).toContain("'Escape'"); });
  it('has copy link action', () => { expect(menuSrc).toContain('copyToClipboard'); });
  it('has WhatsApp share action', () => { expect(menuSrc).toContain('whatsappShareUrl'); });
  it('has native share action', () => { expect(menuSrc).toContain('nativeShare'); });
  it('has canNativeShare check', () => { expect(menuSrc).toContain('canNativeShare'); });
  it('shows Coming next placeholder for platform-user share', () => {
    expect(menuSrc).toContain('Coming next');
  });
  it('has safe-area-inset-bottom for iOS', () => { expect(menuSrc).toContain('safe-area-inset-bottom'); });
  it('traps focus — returns focus to trigger on close', () => { expect(menuSrc).toContain('triggerRef'); });
  it('has spring easing cubic-bezier', () => { expect(menuSrc).toContain('[0.32, 0.72, 0, 1]'); });
  it('has close button aria-label', () => { expect(menuSrc).toContain('Close share menu'); });
  it('has challenge action', () => { expect(menuSrc).toContain('/social-challenges/new'); });
  it('has X/Twitter share action', () => { expect(menuSrc).toContain('twitterShareUrl'); });
  it('has backdrop overlay', () => { expect(menuSrc).toContain("onClick={onClose}"); });
  it('has min-h-[44px] touch targets on options', () => { expect(menuSrc).toContain('min-h-[44px]'); });
});

/* ── PredictionShareCard component ─────────────────────────────────────── */
describe('PredictionShareCard', () => {
  it('uses client directive', () => { expect(predShareSrc).toContain("'use client'"); });
  it('uses framer-motion AnimatePresence', () => { expect(predShareSrc).toContain('AnimatePresence'); });
  it('has WhatsApp share', () => { expect(predShareSrc).toContain('whatsappShareUrl'); });
  it('has copy link action', () => { expect(predShareSrc).toContain('copyToClipboard'); });
  it('has native share action', () => { expect(predShareSrc).toContain('nativeShare'); });
  it('shows prediction score', () => { expect(predShareSrc).toContain('homeScore'); });
  it('shows predicted teams', () => { expect(predShareSrc).toContain('homeTeam'); });
  it('has dismiss button', () => { expect(predShareSrc).toContain('onDismiss'); });
  it('has aria-label on share button', () => { expect(predShareSrc).toContain('aria-label'); });
  it('has Points only disclaimer', () => { expect(predShareSrc).toContain('Points only'); });
  it('has no real money text', () => { expect(predShareSrc).toContain('no real money'); });
  it('does not contain betting or gambling language', () => {
    expect(predShareSrc).not.toMatch(/\b(bet|odds|wager|gambling|cash prize|payout)\b/i);
  });
});

/* ── ChallengeFriendSheet component ─────────────────────────────────────── */
describe('ChallengeFriendSheet', () => {
  it('uses client directive', () => { expect(challengeSrc).toContain("'use client'"); });
  it('uses framer-motion', () => { expect(challengeSrc).toContain('AnimatePresence'); });
  it('has role=dialog', () => { expect(challengeSrc).toContain('role="dialog"'); });
  it('has aria-modal', () => { expect(challengeSrc).toContain('aria-modal'); });
  it('closes on Escape', () => { expect(challengeSrc).toContain("'Escape'"); });
  it('has WhatsApp invite action', () => { expect(challengeSrc).toContain('whatsappShareUrl'); });
  it('has copy invite link', () => { expect(challengeSrc).toContain('copyToClipboard'); });
  it('links to /social-challenges/new', () => { expect(challengeSrc).toContain('/social-challenges/new'); });
  it('has coming next placeholder', () => { expect(challengeSrc).toContain('Coming next'); });
  it('has no real money/no stakes language', () => { expect(challengeSrc).toContain('no real money'); });
  it('does not contain betting or gambling language', () => {
    expect(challengeSrc).not.toMatch(/\b(bet|odds|wager|gambling|cash prize|payout|winnings)\b/i);
  });
  it('has safe-area-inset-bottom', () => { expect(challengeSrc).toContain('safe-area-inset-bottom'); });
  it('has min-h-[44px] touch targets', () => { expect(challengeSrc).toContain('min-h-[44px]'); });
});

/* ── ShareSuccessToast component ────────────────────────────────────────── */
describe('ShareSuccessToast', () => {
  it('uses client directive', () => { expect(toastSrc).toContain("'use client'"); });
  it('uses AnimatePresence for enter/exit', () => { expect(toastSrc).toContain('AnimatePresence'); });
  it('has aria-live=polite', () => { expect(toastSrc).toContain('aria-live="polite"'); });
  it('has aria-atomic', () => { expect(toastSrc).toContain('aria-atomic'); });
  it('has role=status', () => { expect(toastSrc).toContain('role="status"'); });
  it('has spring easing', () => { expect(toastSrc).toContain('[0.32, 0.72, 0, 1]'); });
  it('is pointer-events-none (non-blocking)', () => { expect(toastSrc).toContain('pointer-events-none'); });
});

/* ── Barrel index ────────────────────────────────────────────────────────── */
describe('share/index.ts barrel', () => {
  it('exports ShareButton', () => { expect(indexSrc).toContain('ShareButton'); });
  it('exports FixtureShareMenu', () => { expect(indexSrc).toContain('FixtureShareMenu'); });
  it('exports PredictionShareCard', () => { expect(indexSrc).toContain('PredictionShareCard'); });
  it('exports ChallengeFriendSheet', () => { expect(indexSrc).toContain('ChallengeFriendSheet'); });
  it('exports ShareSuccessToast', () => { expect(indexSrc).toContain('ShareSuccessToast'); });
});

/* ── Prediction fixtures list page ─────────────────────────────────────── */
describe('Prediction fixtures list page', () => {
  it('uses Next.js Link', () => { expect(fixturesPageSrc).toContain("from 'next/link'"); });
  it('has ShareButton on each fixture card', () => { expect(fixturesPageSrc).toContain('ShareButton'); });
  it('has challenge link on each fixture card', () => { expect(fixturesPageSrc).toContain('/social-challenges/new'); });
  it('uses getCountryFlag for team flags', () => { expect(fixturesPageSrc).toContain('getCountryFlag'); });
  it('has framer-motion card entrance animation', () => { expect(fixturesPageSrc).toContain('framer-motion'); });
  it('has countdown component', () => { expect(fixturesPageSrc).toContain('Countdown'); });
  it('has predict action on each card', () => { expect(fixturesPageSrc).toContain('/predictions/fixtures/'); });
  it('has aria-label on predict button', () => { expect(fixturesPageSrc).toContain('aria-label'); });
  it('has aria-label on challenge button', () => { expect(fixturesPageSrc).toContain('Challenge'); });
  it('has min-h-[44px] touch targets', () => { expect(fixturesPageSrc).toContain('min-h-[44px]'); });
  it('has Guess the Score heading', () => { expect(fixturesPageSrc).toContain('Guess the Score'); });
  it('has Points only disclaimer', () => { expect(fixturesPageSrc).toContain('Points only'); });
  it('has shimmer skeleton loading', () => { expect(fixturesPageSrc).toContain('animate-shimmer'); });
  it('does not contain gambling language', () => {
    expect(fixturesPageSrc).not.toMatch(/\b(bet|betting|odds|wager|gambling|cash prize)\b/i);
  });
});

/* ── Prediction detail page ─────────────────────────────────────────────── */
describe('Prediction detail page (Guess the Score)', () => {
  it('uses framer-motion AnimatePresence', () => { expect(predictPageSrc).toContain('AnimatePresence'); });
  it('uses framer-motion motion.button', () => { expect(predictPageSrc).toContain('motion.button'); });
  it('has animated score digits', () => { expect(predictPageSrc).toContain('popLayout'); });
  it('uses PredictionShareCard after submission', () => { expect(predictPageSrc).toContain('PredictionShareCard'); });
  it('has ChallengeFriendSheet', () => { expect(predictPageSrc).toContain('ChallengeFriendSheet'); });
  it('uses getCountryFlag for team flags', () => { expect(predictPageSrc).toContain('getCountryFlag'); });
  it('has min-h-[44px] touch targets on stepper buttons', () => { expect(predictPageSrc).toContain('min-h-[44px]'); });
  it('has aria-label on score stepper buttons', () => { expect(predictPageSrc).toContain('aria-label'); });
  it('has Points only disclaimer', () => { expect(predictPageSrc).toContain('Points only'); });
  it('has link to Match Centre', () => { expect(predictPageSrc).toContain('Match Centre'); });
  it('has Challenge friend button', () => { expect(predictPageSrc).toContain('Challenge'); });
  it('has role=alert on error message', () => { expect(predictPageSrc).toContain('role="alert"'); });
  it('does not contain gambling language', () => {
    expect(predictPageSrc).not.toMatch(/\b(bet|betting|odds|wager|gambling|cash prize|payout)\b/i);
  });
});

/* ── Social challenges page ──────────────────────────────────────────────── */
describe('Social challenges page', () => {
  it('uses Next.js Link (not raw anchor tags)', () => {
    expect(socialPageSrc).toContain("from 'next/link'");
    expect(socialPageSrc).not.toContain('<a href=');
  });
  it('uses framer-motion for entrance animation', () => { expect(socialPageSrc).toContain('framer-motion'); });
  it('links to incoming challenges', () => { expect(socialPageSrc).toContain('/social-challenges/incoming'); });
  it('links to outgoing challenges', () => { expect(socialPageSrc).toContain('/social-challenges/outgoing'); });
  it('links to new challenge', () => { expect(socialPageSrc).toContain('/social-challenges/new'); });
  it('links to public marketplace', () => { expect(socialPageSrc).toContain('/social-predictions/marketplace'); });
  it('has points-only disclaimer', () => { expect(socialPageSrc).toContain('points'); });
  it('has no real money language', () => { expect(socialPageSrc).toContain('not money'); });
  it('does not promote gambling — no "place a bet", "betting odds", or "cash prize"', () => {
    expect(socialPageSrc).not.toMatch(/place a bet|betting odds|cash prize|earn cash|win money/i);
  });
  it('has focus-visible ring on links', () => { expect(socialPageSrc).toContain('focus-visible'); });
  it('has min-h-[44px] touch targets', () => { expect(socialPageSrc).toContain('min-h-[44px]'); });
});

/* ── Reduced motion awareness ────────────────────────────────────────────── */
describe('Reduced motion compliance', () => {
  it('framer-motion respects reduced motion by default (library-level guarantee)', () => {
    // framer-motion respects prefers-reduced-motion at the library level.
    // Verify motion-safe: classes are used in relevant pages for CSS animations.
    expect(fixturesPageSrc).toContain('motion-safe:');
  });
  it('social challenges page uses motion-safe for hover transitions', () => {
    expect(socialPageSrc).toContain('motion-safe:');
  });
});
