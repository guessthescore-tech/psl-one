'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sword, Trophy, CheckCircle, ArrowLeft, Warning, ShareNetwork, WhatsappLogo
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getDataMode, WC_FIXTURES, type ExpFixture } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { DesignReviewBanner } from '@/components/fantasy/shared/DesignReviewBanner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState<1 | -1>(1);

  function step(delta: 1 | -1) {
    setDir(delta);
    onChange(Math.max(0, value + delta));
  }

  return (
    <div className="flex flex-col items-center gap-3" aria-label={`${label} score`}>
      <button
        onClick={() => step(1)}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/18 active:scale-[0.97] transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
        aria-label={`Increase ${label} score`}
      >
        <span className="text-xl font-bold" aria-hidden>+</span>
      </button>
      <div className="relative h-16 w-14 flex items-center justify-center overflow-hidden" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduce ? false : { y: dir * -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? {} : { y: dir * 32, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-score-xl font-black text-white tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        onClick={() => step(-1)}
        disabled={value === 0}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/18 active:scale-[0.97] transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
        aria-label={`Decrease ${label} score`}
      >
        <span className="text-xl font-bold" aria-hidden>−</span>
      </button>
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────

function AcceptChallengePageInner() {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const mode = getDataMode();

  const fixtureId = params.get('fixture') ?? '';
  const challengerHomeScore = Number(params.get('h') ?? '0');
  const challengerAwayScore = Number(params.get('a') ?? '0');

  const [fixture, setFixture] = useState<ExpFixture | null>(null);
  const [myHomeScore, setMyHomeScore] = useState(2);
  const [myAwayScore, setMyAwayScore] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(() => {
    if (!fixtureId) { setLoadError(true); return; }
    if (mode === 'DESIGN_REVIEW_DATA') {
      const found = WC_FIXTURES.find(f => f.id === fixtureId) ?? WC_FIXTURES[1] ?? null;
      setFixture(found);
      return;
    }
    const found = WC_FIXTURES.find(f => f.id === fixtureId) ?? null;
    setFixture(found);
    if (!found) setLoadError(true);
  }, [fixtureId, mode]);

  useEffect(() => { load(); }, [load]);

  const isLocked = fixture
    ? fixture.status === 'LIVE' || fixture.status === 'HALF_TIME' || fixture.status === 'FINISHED'
    : false;

  const isSameScore = myHomeScore === challengerHomeScore && myAwayScore === challengerAwayScore;

  function handleAccept() {
    setAccepted(true);
  }

  function handleWhatsAppBack() {
    if (!fixture) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `I accepted your PSL One challenge! I predicted ${fixture.homeClub.shortName} ${myHomeScore} - ${myAwayScore} ${fixture.awayClub.shortName}. May the closest score win! Points only - no real money.`;
    const encoded = encodeURIComponent(`${text} ${shareUrl}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    if (!fixture) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `I accepted your PSL One challenge! I predicted ${fixture.homeClub.shortName} ${myHomeScore} - ${myAwayScore} ${fixture.awayClub.shortName}. Points only - no real money.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'PSL One Challenge Accepted', text, url: shareUrl }); }
      catch { /* cancelled */ }
    }
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Warning size={40} className="text-white/20 mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Challenge not found</h1>
          <p className="text-body-sm text-white/50 mb-6">
            This challenge link may have expired or the fixture is no longer available.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
          >
            View all predictions
          </Link>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="min-h-screen bg-exp-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-exp-gold border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-exp-void">
      <DesignReviewBanner />

      {/* Header */}
      <div className="bg-exp-navy border-b border-white/8">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-exp-gold/20 border border-exp-gold/30 flex items-center justify-center">
              <Sword size={20} weight="bold" className="text-exp-gold" aria-hidden />
            </div>
            <div>
              <h1 className="text-display-sm font-black text-white">You've been challenged!</h1>
              <p className="text-label-sm text-white/50">Points only · no real money</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Match */}
        <div className="bg-white/5 border border-white/10 rounded-card overflow-hidden">
          <div className="flex h-0.5">
            <div className="flex-1" style={{ backgroundColor: fixture.homeClub.primaryColor }} aria-hidden />
            <div className="flex-1" style={{ backgroundColor: fixture.awayClub.primaryColor }} aria-hidden />
          </div>
          <div className="p-5">
            <p className="text-label-xs text-white/40 mb-3">{fixture.competition}</p>
            <div className="flex items-center justify-between">
              <TeamIdentity club={fixture.homeClub} size="lg" showName />
              <span className="text-label-sm text-white/30">vs</span>
              <TeamIdentity club={fixture.awayClub} size="lg" showName />
            </div>
          </div>
        </div>

        {/* Challenger's prediction */}
        <div className="bg-white/5 border border-white/10 rounded-card p-5">
          <p className="text-label-xs text-white/40 mb-2">Their prediction</p>
          <div className="flex items-center gap-3">
            <span className="text-display-md font-black text-white tabular-nums">
              {challengerHomeScore} - {challengerAwayScore}
            </span>
            <span className="text-label-sm text-white/40">
              {fixture.homeClub.shortName} · {fixture.awayClub.shortName}
            </span>
          </div>
        </div>

        {/* Accept / accepted */}
        <AnimatePresence mode="wait">
          {accepted ? (
            <motion.div
              key="accepted"
              initial={reduce ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-exp-green/15 border border-exp-green/25 rounded-card p-6 text-center"
            >
              <CheckCircle size={40} weight="fill" className="text-exp-green mx-auto mb-3" aria-hidden />
              <h2 className="text-display-sm font-black text-white mb-1">Challenge accepted!</h2>
              <div className="flex items-center justify-center gap-6 my-4">
                <div className="text-center">
                  <p className="text-label-xs text-white/40 mb-1">Them</p>
                  <p className="text-display-sm font-black text-white/60">{challengerHomeScore} - {challengerAwayScore}</p>
                </div>
                <Sword size={20} className="text-exp-gold" aria-hidden />
                <div className="text-center">
                  <p className="text-label-xs text-white/40 mb-1">You</p>
                  <p className="text-display-sm font-black text-exp-gold">{myHomeScore} - {myAwayScore}</p>
                </div>
              </div>
              <p className="text-label-xs text-white/30 mb-5">Points only · no real money · no financial value</p>
              <div className="flex gap-3">
                {'share' in navigator && (
                  <button
                    onClick={() => { void handleNativeShare(); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-label-sm rounded-pill py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                  >
                    <ShareNetwork size={16} aria-hidden />
                    Share
                  </button>
                )}
                <button
                  onClick={handleWhatsAppBack}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-label-sm rounded-pill py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                >
                  <WhatsappLogo size={16} aria-hidden />
                  Reply on WhatsApp
                </button>
              </div>
            </motion.div>
          ) : isLocked ? (
            <div className="bg-white/5 border border-white/10 rounded-card p-6 text-center">
              <p className="text-body-sm text-white/50 mb-4">
                This fixture has started — predictions are now locked.
              </p>
              <Link
                href="/predict"
                className="inline-flex items-center gap-2 text-label-md text-exp-gold underline hover:text-exp-gold-2 transition-colors duration-100"
              >
                Find upcoming fixtures
              </Link>
            </div>
          ) : (
            <motion.div
              key="entry"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-card p-6"
            >
              <h2 className="text-label-md font-bold text-white mb-5 text-center">Your counter-prediction</h2>
              <div className="flex items-center justify-center gap-6 mb-5">
                <ScoreStepper value={myHomeScore} onChange={setMyHomeScore} label={fixture.homeClub.shortName} />
                <div className="text-display-xl font-black text-white/15 select-none">-</div>
                <ScoreStepper value={myAwayScore} onChange={setMyAwayScore} label={fixture.awayClub.shortName} />
              </div>

              {isSameScore && (
                <p className="text-center text-label-sm text-exp-gold/70 mb-3">
                  Same score as the challenger — try a different prediction!
                </p>
              )}

              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center gap-2 bg-exp-gold text-exp-void font-black py-3.5 rounded-pill hover:bg-exp-gold-2 active:scale-[0.97] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
              >
                <Sword size={18} weight="bold" aria-hidden />
                Accept challenge
              </button>
              <p className="text-label-xs text-white/30 text-center mt-3">
                Points only · no real money · no financial value
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <Link
            href="/predict"
            className="inline-flex items-center gap-1.5 text-label-sm text-white/40 hover:text-white/70 transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm"
          >
            <ArrowLeft size={14} aria-hidden />
            All predictions
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-label-xs text-white/20">
            <Trophy size={12} aria-hidden />
            <span>PSL One Prediction Games — for fun only, no real money or prizes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-exp-void flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-exp-gold border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      }
    >
      <AcceptChallengePageInner />
    </Suspense>
  );
}
