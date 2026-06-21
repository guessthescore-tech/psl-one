'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sword, Trophy, CheckCircle, ArrowLeft, Warning, ShareNetwork, WhatsappLogo, Clock
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getDataMode, WC_FIXTURES, type ExpFixture } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { DesignReviewBanner } from '@/components/fantasy/shared/DesignReviewBanner';
import { apiFetch, apiPost } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

type TokenChallengeStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED' | 'LOCKED';

type TokenChallenge = {
  id: string;
  token: string;
  status: TokenChallengeStatus;
  creatorHomeScore: number;
  creatorAwayScore: number;
  acceptorHomeScore?: number | null;
  acceptorAwayScore?: number | null;
  expiresAt: string;
  acceptedAt?: string | null;
  fixture: {
    id: string;
    kickoffAt: string;
    status: string;
    homeTeam: { id: string; name: string; shortName: string; slug: string };
    awayTeam: { id: string; name: string; shortName: string; slug: string };
  };
};

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

// ── Token-based accept inner ──────────────────────────────────────────────────

function TokenChallengeInner({ token }: { token: string }) {
  const reduce = useReducedMotion();

  const [challenge, setChallenge] = useState<TokenChallenge | null>(null);
  const [myHomeScore, setMyHomeScore] = useState(2);
  const [myAwayScore, setMyAwayScore] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<'not_found' | 'self_challenge' | 'expired' | 'already_accepted' | 'locked' | 'needs_auth' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadChallenge = useCallback(async () => {
    try {
      const data = await apiFetch<TokenChallenge>(`/predictions/challenges/${token}`);
      setChallenge(data);
      setLoading(false);
    } catch {
      setErrorState('not_found');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadChallenge(); }, [loadChallenge]);

  async function handleAccept() {
    if (!challenge) return;

    if (!isAuthenticated()) {
      setErrorState('needs_auth');
      return;
    }

    setAccepting(true);
    setErrorMsg('');

    try {
      await apiPost(`/predictions/challenges/${token}/accept`, {
        homeScore: myHomeScore,
        awayScore: myAwayScore,
      });
      setAccepted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg === 'UNAUTHORIZED') {
        setErrorState('needs_auth');
      } else if (msg.toLowerCase().includes('own challenge') || msg.toLowerCase().includes('cannot accept your own')) {
        setErrorState('self_challenge');
      } else if (msg.toLowerCase().includes('expired')) {
        setErrorState('expired');
      } else if (msg.toLowerCase().includes('accepted') || msg.toLowerCase().includes('cannot be accepted')) {
        setErrorState('already_accepted');
      } else if (msg.toLowerCase().includes('started') || msg.toLowerCase().includes('finished')) {
        setErrorState('locked');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setAccepting(false);
    }
  }

  function handleWhatsAppBack() {
    if (!challenge) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `I accepted your PSL One challenge! I predicted ${challenge.fixture.homeTeam.shortName} ${myHomeScore} - ${myAwayScore} ${challenge.fixture.awayTeam.shortName}. May the closest score win! Points only - no real money.`;
    const encoded = encodeURIComponent(`${text} ${shareUrl}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    if (!challenge) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `I accepted your PSL One challenge! Points only - no real money.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'PSL One Challenge Accepted', text, url: shareUrl }); }
      catch { /* cancelled */ }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-exp-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-exp-gold border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (errorState === 'needs_auth') {
    const returnUrl = encodeURIComponent(`/predict/challenge/accept?token=${token}`);
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Sword size={40} className="text-exp-gold mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Sign in to accept</h1>
          <p className="text-body-sm text-white/50 mb-6">
            You need to be signed in to accept this challenge.
          </p>
          <Link
            href={`/auth/login?return=${returnUrl}`}
            className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (errorState === 'not_found') {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Warning size={40} className="text-white/20 mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Challenge not found</h1>
          <p className="text-body-sm text-white/50 mb-6">
            This challenge link may have expired or is no longer valid.
          </p>
          <Link href="/predict" className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]">
            View all predictions
          </Link>
        </div>
      </div>
    );
  }

  if (errorState === 'self_challenge') {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Warning size={40} className="text-exp-gold/50 mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">You cannot accept your own challenge</h1>
          <p className="text-body-sm text-white/50 mb-6">
            Share the link with a friend to get a real challenger!
          </p>
          <Link href="/predict" className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]">
            Back to predictions
          </Link>
        </div>
      </div>
    );
  }

  if (errorState === 'expired' || challenge?.status === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Clock size={40} className="text-white/20 mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Challenge EXPIRED</h1>
          <p className="text-body-sm text-white/50 mb-6">
            This challenge has passed its 72-hour window.
          </p>
          <Link href="/predict" className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]">
            Find a new fixture
          </Link>
        </div>
      </div>
    );
  }

  if (errorState === 'already_accepted' || challenge?.status === 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <CheckCircle size={40} weight="fill" className="text-exp-green mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Challenge already accepted</h1>
          <p className="text-body-sm text-white/50 mb-6">
            This challenge has already been accepted. Check the results after the match!
          </p>
          <Link href="/predict" className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]">
            All predictions
          </Link>
        </div>
      </div>
    );
  }

  if (errorState === 'locked' || challenge?.status === 'LOCKED') {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Warning size={40} className="text-white/20 mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Fixture already started</h1>
          <p className="text-body-sm text-white/50 mb-6">
            The match has started — predictions are now locked.
          </p>
          <Link href="/predict" className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]">
            Find upcoming fixtures
          </Link>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-exp-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-exp-gold border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  const isFixtureLocked = challenge.fixture.status === 'LIVE' || challenge.fixture.status === 'HALF_TIME' || challenge.fixture.status === 'FINISHED';
  const isSameScore = myHomeScore === challenge.creatorHomeScore && myAwayScore === challenge.creatorAwayScore;

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
          <div className="p-5">
            <p className="text-label-xs text-white/40 mb-3">{challenge.fixture.homeTeam.name} vs {challenge.fixture.awayTeam.name}</p>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-label-md font-bold text-white">{challenge.fixture.homeTeam.shortName}</p>
              </div>
              <span className="text-label-sm text-white/30">vs</span>
              <div className="text-center">
                <p className="text-label-md font-bold text-white">{challenge.fixture.awayTeam.shortName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenger's prediction */}
        <div className="bg-white/5 border border-white/10 rounded-card p-5">
          <p className="text-label-xs text-white/40 mb-2">Their prediction</p>
          <div className="flex items-center gap-3">
            <span className="text-display-md font-black text-white tabular-nums">
              {challenge.creatorHomeScore} - {challenge.creatorAwayScore}
            </span>
            <span className="text-label-sm text-white/40">
              {challenge.fixture.homeTeam.shortName} · {challenge.fixture.awayTeam.shortName}
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
                  <p className="text-display-sm font-black text-white/60">{challenge.creatorHomeScore} - {challenge.creatorAwayScore}</p>
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
          ) : isFixtureLocked ? (
            <div className="bg-white/5 border border-white/10 rounded-card p-6 text-center">
              <p className="text-body-sm text-white/50 mb-4">
                This fixture has started — predictions are now locked.
              </p>
              <Link href="/predict" className="inline-flex items-center gap-2 text-label-md text-exp-gold underline hover:text-exp-gold-2 transition-colors duration-100">
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
                <ScoreStepper value={myHomeScore} onChange={setMyHomeScore} label={challenge.fixture.homeTeam.shortName} />
                <div className="text-display-xl font-black text-white/15 select-none">-</div>
                <ScoreStepper value={myAwayScore} onChange={setMyAwayScore} label={challenge.fixture.awayTeam.shortName} />
              </div>

              {isSameScore && (
                <p className="text-center text-label-sm text-exp-gold/70 mb-3">
                  Same score as the challenger — try a different prediction!
                </p>
              )}

              {errorMsg && (
                <p className="text-center text-label-sm text-red-400/80 mb-3">{errorMsg}</p>
              )}

              <button
                onClick={() => { void handleAccept(); }}
                disabled={accepting}
                className="w-full flex items-center justify-center gap-2 bg-exp-gold text-exp-void font-black py-3.5 rounded-pill hover:bg-exp-gold-2 active:scale-[0.97] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {accepting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-exp-void border-t-transparent rounded-full animate-spin" aria-hidden />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Sword size={18} weight="bold" aria-hidden />
                    Accept challenge
                  </>
                )}
              </button>
              <p className="text-label-xs text-white/30 text-center mt-3">
                Points only · no real money · no financial value
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <Link href="/predict" className="inline-flex items-center gap-1.5 text-label-sm text-white/40 hover:text-white/70 transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm">
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

// ── Legacy accept (URL params fallback) ──────────────────────────────────────

function LegacyAcceptInner() {
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
          <Link href="/predict" className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]">
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
              <Link href="/predict" className="inline-flex items-center gap-2 text-label-md text-exp-gold underline hover:text-exp-gold-2 transition-colors duration-100">
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
          <Link href="/predict" className="inline-flex items-center gap-1.5 text-label-sm text-white/40 hover:text-white/70 transition-colors duration-150 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm">
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

// ── Page router ───────────────────────────────────────────────────────────────

function AcceptChallengePageInner() {
  const params = useSearchParams();
  const token = params.get('token');

  if (token) {
    return <TokenChallengeInner token={token} />;
  }
  return <LegacyAcceptInner />;
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
