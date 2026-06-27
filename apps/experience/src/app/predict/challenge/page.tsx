'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sword, Trophy, ShareNetwork, WhatsappLogo, Copy, CheckCircle,
  ArrowLeft, Clock, Warning
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getDataMode, WC_FIXTURES, type ExpFixture } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { DesignReviewBanner } from '@/components/fantasy/shared/DesignReviewBanner';
import { apiPost } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { getFixture, type Fixture as ApiFixture } from '@/lib/football-api';
import { liveTeamToExpClub } from '@/lib/live-mappers';

// ── Types ─────────────────────────────────────────────────────────────────────

type ChallengeState = 'IDLE' | 'CREATING' | 'CREATED' | 'ERROR';

type ChallengeResponse = {
  id: string;
  token: string;
  status: string;
  creatorHomeScore: number;
  creatorAwayScore: number;
  expiresAt: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTokenLink(token: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/predict/challenge/accept?token=${token}`;
}

/** @deprecated Use buildTokenLink when authenticated. Kept for design-review fallback and backward compat. */
function buildChallengeLink(fixtureId: string, homeScore: number, awayScore: number): string {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin;
  const params = new URLSearchParams({ fixture: fixtureId, h: String(homeScore), a: String(awayScore) });
  return `${base}/predict/challenge/accept?${params.toString()}`;
}

// Alias for clarity in new code paths
const buildLegacyLink = buildChallengeLink;

function mapFixture(fixture: ApiFixture): ExpFixture {
  return {
    id: fixture.id,
    homeClub: liveTeamToExpClub(fixture.homeTeam),
    awayClub: liveTeamToExpClub(fixture.awayTeam),
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    status:
      fixture.status === 'LIVE' || fixture.status === 'HALF_TIME' || fixture.status === 'FINISHED'
        ? fixture.status
        : 'SCHEDULED',
    minute: fixture.currentMinute,
    kickoffAt: fixture.kickoffAt,
    venue: fixture.venue?.name ?? 'Venue TBD',
    competition: fixture.season.competition.name,
    group: fixture.group?.name ?? undefined,
  };
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) + ` ${time}`;
}

// ── Share sheet ───────────────────────────────────────────────────────────────

function ChallengeShareSheet({
  fixture,
  challengeLink,
  homeScore,
  awayScore,
  onClose,
}: {
  fixture: ExpFixture;
  challengeLink: string;
  homeScore: number;
  awayScore: number;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const shareText = `I'm challenging you! I predicted ${fixture.homeClub.shortName} ${homeScore} - ${awayScore} ${fixture.awayClub.shortName} on PSL One. Points only - no real money. Do you dare predict differently?`;

  function handleWhatsApp() {
    const encoded = encodeURIComponent(`${shareText} ${challengeLink}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PSL One Prediction Challenge',
          text: shareText,
          url: challengeLink,
        });
      } catch {
        // user cancelled
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(challengeLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // unavailable
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <>
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-exp-void/80"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Share challenge"
        initial={reduce ? false : { y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-exp-navy rounded-t-[20px] p-6 shadow-card-xl"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" aria-hidden />
        <h3 className="text-base font-bold text-white mb-1">Send the challenge</h3>
        <p className="text-label-sm text-white/50 mb-4">Share your link — whoever is closer wins bragging rights</p>

        {/* Challenge link preview */}
        <div className="bg-exp-void/60 border border-white/10 rounded-card-sm px-3 py-2.5 mb-5 flex items-center gap-2">
          <span className="text-label-xs text-white/40 flex-1 truncate">{challengeLink}</span>
        </div>

        <div className="flex gap-3 mb-4">
          {canNativeShare && (
            <button
              onClick={() => { void handleNativeShare(); }}
              className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-exp-gold/20 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
              aria-label="Share challenge"
            >
              <ShareNetwork size={24} className="text-exp-gold" aria-hidden />
              <span className="text-xs text-white/70">Share</span>
            </button>
          )}
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-[#25D366]/20 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
            aria-label="Send via WhatsApp"
          >
            <WhatsappLogo size={24} className="text-[#25D366]" aria-hidden />
            <span className="text-xs text-white/70">WhatsApp</span>
          </button>
          <button
            onClick={() => { void handleCopy(); }}
            className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-white/15 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
            aria-label={copied ? 'Link copied' : 'Copy link'}
          >
            {copied
              ? <CheckCircle size={24} className="text-exp-green" aria-hidden />
              : <Copy size={24} className="text-white" aria-hidden />
            }
            <span className="text-xs text-white/70">{copied ? 'Copied!' : 'Copy link'}</span>
          </button>
        </div>

        <p className="text-label-xs text-white/30 text-center mb-4">
          Points only · no real money · no financial value
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 text-sm text-white/50 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-card-sm min-h-[44px]"
        >
          Done
        </button>
      </motion.div>
    </>
  );
}

// ── Score stepper ─────────────────────────────────────────────────────────────

function ScoreStepper({
  value,
  onChange,
  label,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  disabled?: boolean;
}) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState<1 | -1>(1);

  function step(delta: 1 | -1) {
    if (disabled) return;
    setDir(delta);
    onChange(Math.max(0, value + delta));
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${disabled ? 'opacity-40' : ''}`} aria-label={`${label} score`}>
      <button
        onClick={() => step(1)}
        disabled={disabled}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/18 active:scale-[0.97] transition-colors duration-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
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
        disabled={disabled || value === 0}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center hover:bg-white/18 active:scale-[0.97] transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold"
        aria-label={`Decrease ${label} score`}
      >
        <span className="text-xl font-bold" aria-hidden>−</span>
      </button>
    </div>
  );
}

// ── Inner (uses useSearchParams) ──────────────────────────────────────────────

function ChallengePageInner() {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const mode = getDataMode();

  const fixtureId = params.get('fixture') ?? '';
  const [fixture, setFixture] = useState<ExpFixture | null>(null);
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(1);
  const [challengeState, setChallengeState] = useState<ChallengeState>('IDLE');
  const [challengeLink, setChallengeLink] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadFixture = useCallback(() => {
    if (!fixtureId) {
      setLoadError(true);
      return;
    }
    if (mode === 'DESIGN_REVIEW_DATA') {
      const found = WC_FIXTURES.find(f => f.id === fixtureId) ?? WC_FIXTURES[1] ?? null;
      setFixture(found);
      return;
    }
    void getFixture(fixtureId)
      .then((data) => setFixture(mapFixture(data)))
      .catch(() => {
        setLoadError(true);
      });
  }, [fixtureId, mode]);

  useEffect(() => { loadFixture(); }, [loadFixture]);

  const isLocked = fixture
    ? fixture.status === 'LIVE' || fixture.status === 'HALF_TIME' || fixture.status === 'FINISHED'
    : false;

  async function handleCreateChallenge() {
    if (!fixture) return;

    // Design review fallback — use legacy URL-param approach
    if (mode === 'DESIGN_REVIEW_DATA') {
      const link = buildLegacyLink(fixture.id, homeScore, awayScore);
      setChallengeLink(link);
      setChallengeState('CREATED');
      setShowShare(true);
      return;
    }

    // Check auth
    if (!isAuthenticated()) {
      setNeedsAuth(true);
      return;
    }

    setChallengeState('CREATING');
    setErrorMsg('');

    try {
      const data = await apiPost<ChallengeResponse>('/predictions/challenges', {
        fixtureId: fixture.id,
        homeScore,
        awayScore,
      });
      const link = buildTokenLink(data.token);
      setChallengeLink(link);
      setChallengeState('CREATED');
      setShowShare(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        setNeedsAuth(true);
        setChallengeState('IDLE');
      } else {
        // Fallback: use legacy link so UX does not break
        const link = buildLegacyLink(fixture.id, homeScore, awayScore);
        setChallengeLink(link);
        setChallengeState('CREATED');
        setShowShare(true);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setErrorMsg(msg);
      }
    }
  }

  if (loadError || (!fixture && !fixtureId)) {
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Warning size={40} className="text-white/20 mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Fixture not found</h1>
          <p className="text-body-sm text-white/50 mb-6">
            This challenge link may have expired or the fixture is no longer available.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to predictions
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

  // Auth prompt
  if (needsAuth) {
    const returnUrl = encodeURIComponent(`/predict/challenge?fixture=${fixtureId}&h=${homeScore}&a=${awayScore}`);
    return (
      <div className="min-h-screen bg-exp-void">
        <DesignReviewBanner />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Sword size={40} className="text-exp-gold mx-auto mb-4" aria-hidden />
          <h1 className="text-display-sm font-black text-white mb-2">Sign in to challenge</h1>
          <p className="text-body-sm text-white/50 mb-6">
            You need to be signed in to create a durable challenge link.
          </p>
          <Link
            href={`/auth/login?return=${returnUrl}`}
            className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-black px-6 py-3 rounded-pill hover:bg-exp-gold-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
          >
            Sign in
          </Link>
          <button
            onClick={() => setNeedsAuth(false)}
            className="block mt-4 text-label-sm text-white/40 hover:text-white/70 mx-auto"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-exp-void">
      <DesignReviewBanner />

      {/* Header */}
      <div className="bg-exp-navy border-b border-white/8">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Link
            href="/predict"
            className="inline-flex items-center gap-1.5 text-label-sm text-white/50 hover:text-white transition-colors duration-150 mb-4 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm"
          >
            <ArrowLeft size={14} aria-hidden />
            All predictions
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-exp-gold/20 border border-exp-gold/30 flex items-center justify-center">
              <Sword size={20} weight="bold" className="text-exp-gold" aria-hidden />
            </div>
            <div>
              <h1 className="text-display-sm font-black text-white">Challenge a Fan</h1>
              <p className="text-label-sm text-white/50">Points only · no real money</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Match card */}
        <div className="bg-white/5 border border-white/10 rounded-card overflow-hidden">
          <div className="flex h-0.5">
            <div className="flex-1" style={{ backgroundColor: fixture.homeClub.primaryColor }} aria-hidden />
            <div className="flex-1" style={{ backgroundColor: fixture.awayClub.primaryColor }} aria-hidden />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-label-xs text-white/40">{fixture.competition}</span>
              {isLocked ? (
                <div className="flex items-center gap-1 text-label-xs text-white/40">
                  <span>Locked — no new predictions</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-label-xs text-exp-gold">
                  <Clock size={11} aria-hidden />
                  <span>{formatKickoff(fixture.kickoffAt)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <TeamIdentity club={fixture.homeClub} size="lg" showName />
              <span className="text-label-sm text-white/30">vs</span>
              <TeamIdentity club={fixture.awayClub} size="lg" showName />
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-exp-gold/10 border border-exp-gold/20 rounded-card p-4">
          <h2 className="text-label-md font-bold text-exp-gold mb-2">How challenges work</h2>
          <ol className="space-y-1.5 text-label-sm text-white/70 list-none">
            <li className="flex gap-2"><span className="text-exp-gold font-bold w-4">1.</span> Pick your score prediction below</li>
            <li className="flex gap-2"><span className="text-exp-gold font-bold w-4">2.</span> Share the challenge link with a friend</li>
            <li className="flex gap-2"><span className="text-exp-gold font-bold w-4">3.</span> They predict a different score</li>
            <li className="flex gap-2"><span className="text-exp-gold font-bold w-4">4.</span> Whoever is closer earns bragging rights</li>
          </ol>
          <p className="text-label-xs text-white/35 mt-3">
            Points only · no real money · no stakes · no financial value
          </p>
        </div>

        {/* Error message (soft — still shows link) */}
        {errorMsg && (
          <div className="bg-white/5 border border-white/10 rounded-card-sm px-4 py-2 text-label-xs text-white/40">
            Note: challenge saved locally (backend unavailable)
          </div>
        )}

        {/* Score entry */}
        {isLocked ? (
          <div className="bg-white/5 border border-white/10 rounded-card p-6 text-center">
            <p className="text-body-sm text-white/50">
              This fixture is locked — challenges can no longer be created.
            </p>
            <Link
              href="/predict"
              className="mt-4 inline-flex items-center gap-2 text-label-md text-exp-gold underline hover:text-exp-gold-2 transition-colors duration-100"
            >
              Find an upcoming fixture
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {challengeState === 'CREATED' ? (
              <motion.div
                key="created"
                initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-exp-green/15 border border-exp-green/25 rounded-card p-6 text-center"
              >
                <CheckCircle size={40} weight="fill" className="text-exp-green mx-auto mb-3" aria-hidden />
                <h2 className="text-display-sm font-black text-white mb-1">Challenge created!</h2>
                <p className="text-body-sm text-white/60 mb-1">
                  Your prediction: {fixture.homeClub.shortName} {homeScore} - {awayScore} {fixture.awayClub.shortName}
                </p>
                <p className="text-label-xs text-white/30 mb-5">
                  Share the link so your friend can predict differently
                </p>
                <button
                  onClick={() => setShowShare(true)}
                  className="w-full flex items-center justify-center gap-2 bg-exp-gold text-exp-void font-black py-3.5 rounded-pill hover:bg-exp-gold-2 active:scale-[0.97] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] mb-3"
                >
                  <ShareNetwork size={18} aria-hidden />
                  Share challenge link
                </button>
                <button
                  onClick={() => { setChallengeState('IDLE'); }}
                  className="text-label-sm text-white/40 hover:text-white/70 transition-colors duration-100"
                >
                  Change prediction
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="entry"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-card p-6"
              >
                <h2 className="text-label-md font-bold text-white mb-5 text-center">Your prediction</h2>
                <div className="flex items-center justify-center gap-6 mb-6">
                  <ScoreStepper
                    value={homeScore}
                    onChange={setHomeScore}
                    label={fixture.homeClub.shortName}
                    disabled={challengeState === 'CREATING'}
                  />
                  <div className="text-display-xl font-black text-white/15 select-none">-</div>
                  <ScoreStepper
                    value={awayScore}
                    onChange={setAwayScore}
                    label={fixture.awayClub.shortName}
                    disabled={challengeState === 'CREATING'}
                  />
                </div>
                <button
                  onClick={() => { void handleCreateChallenge(); }}
                  disabled={challengeState === 'CREATING'}
                  className="w-full flex items-center justify-center gap-2 bg-exp-gold text-exp-void font-black py-3.5 rounded-pill hover:bg-exp-gold-2 active:scale-[0.97] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {challengeState === 'CREATING' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-exp-void border-t-transparent rounded-full animate-spin" aria-hidden />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sword size={18} weight="bold" aria-hidden />
                      Create challenge link
                    </>
                  )}
                </button>
                <p className="text-label-xs text-white/30 text-center mt-3">
                  Points only · no real money · no financial value
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Disclaimer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-label-xs text-white/30">
            <Trophy size={12} aria-hidden />
            <span>PSL One Prediction Games — for fun only, no real money or prizes</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showShare && fixture && (
          <ChallengeShareSheet
            fixture={fixture}
            challengeLink={challengeLink}
            homeScore={homeScore}
            awayScore={awayScore}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function ChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-exp-void flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-exp-gold border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        </div>
      }
    >
      <ChallengePageInner />
    </Suspense>
  );
}
