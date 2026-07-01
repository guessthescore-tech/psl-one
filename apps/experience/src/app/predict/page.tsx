'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Trophy, Minus, Plus, Lock, Clock, CheckCircle, Sword, ShareNetwork,
  WhatsappLogo, Copy, ArrowLeft
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { getDataMode, WC_FIXTURES, type ExpFixture } from '@/lib/data';
import { TeamIdentity } from '@/components/ui/TeamIdentity';
import { DesignReviewBanner } from '@/components/fantasy/shared/DesignReviewBanner';
import { getFixtures, type Fixture } from '@/lib/football-api';
import { validateSession } from '@/lib/use-session';
import { createScorePrediction, getMyFixturePrediction } from '@/lib/predictions-api';

function toExpFixture(f: Fixture): ExpFixture {
  return {
    id: f.id,
    homeClub: {
      id: f.homeTeam.id, name: f.homeTeam.name, shortName: f.homeTeam.shortName,
      abbr: f.homeTeam.shortName.slice(0, 3).toUpperCase(), city: '', country: 'ZA',
      primaryColor: '#1E3A5F', secondaryColor: '#C8A84B', textColor: '#FFFFFF', founded: 0,
    },
    awayClub: {
      id: f.awayTeam.id, name: f.awayTeam.name, shortName: f.awayTeam.shortName,
      abbr: f.awayTeam.shortName.slice(0, 3).toUpperCase(), city: '', country: 'ZA',
      primaryColor: '#8B1A1A', secondaryColor: '#FFD700', textColor: '#FFFFFF', founded: 0,
    },
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    status: f.status === 'HALF_TIME' ? 'HALF_TIME'
      : f.status === 'LIVE' ? 'LIVE'
      : f.status === 'FINISHED' ? 'FINISHED'
      : 'SCHEDULED',
    minute: f.currentMinute ?? null,
    kickoffAt: f.kickoffAt,
    venue: f.venue?.name ?? '',
    competition: f.season?.competition?.name ?? 'PSL One',
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredPrediction {
  fixtureId: string;
  homeScore: number;
  awayScore: number;
  submittedAt: string;
  predictionId?: string;
  status?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) + ` ${time}`;
}

const STORAGE_KEY = 'psl_predictions';

function loadPredictions(): StoredPrediction[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredPrediction[];
  } catch {
    return [];
  }
}

function savePrediction(p: StoredPrediction): void {
  if (typeof window === 'undefined') return;
  const existing = loadPredictions().filter(x => x.fixtureId !== p.fixtureId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, p]));
}

// ── Score stepper ─────────────────────────────────────────────────────────────

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
        <Plus size={20} weight="bold" aria-hidden />
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
        <Minus size={20} weight="bold" aria-hidden />
      </button>
    </div>
  );
}

// ── Share sheet ───────────────────────────────────────────────────────────────

function ShareSheet({
  fixture,
  homeScore,
  awayScore,
  onClose,
}: {
  fixture: ExpFixture;
  homeScore: number;
  awayScore: number;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const shareText = `I predicted ${fixture.homeClub.shortName} ${homeScore} - ${awayScore} ${fixture.awayClub.shortName} on PSL One! \u{1F3C6} Points only - no real money. Can you beat me?`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/predict/challenge?fixture=${fixture.id}` : '';

  async function handleWebShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'My PSL One Prediction', text: shareText, url: shareUrl });
        onClose();
      } catch {
        // user cancelled
      }
    }
  }

  function handleWhatsApp() {
    const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
    onClose();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <>
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-exp-void/80"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Share your prediction"
        initial={reduce ? false : { y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-exp-navy rounded-t-[20px] p-6 shadow-card-xl"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" aria-hidden />

        {/* Prediction preview card */}
        <div className="bg-exp-void/60 border border-white/10 rounded-card p-4 mb-5 text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-sm font-bold text-white">{fixture.homeClub.shortName}</span>
            <span className="text-2xl font-black text-exp-gold tabular-nums">{homeScore} - {awayScore}</span>
            <span className="text-sm font-bold text-white">{fixture.awayClub.shortName}</span>
          </div>
          <p className="text-xs text-white/40">{fixture.competition} · Points only - no real money</p>
        </div>

        <div className="flex gap-3 mb-4">
          {canNativeShare && (
            <button
              onClick={() => { void handleWebShare(); }}
              className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-exp-gold/20 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
              aria-label="Share"
            >
              <ShareNetwork size={24} className="text-exp-gold" aria-hidden />
              <span className="text-xs text-white/70">Share</span>
            </button>
          )}
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex flex-col items-center gap-2 bg-white/8 hover:bg-[#25D366]/20 rounded-card-sm py-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
            aria-label="Share on WhatsApp"
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

        <Link
          href={`/predict/challenge?fixture=${fixture.id}`}
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full border border-white/20 text-white bg-white/8 rounded-pill py-3 hover:bg-white/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold text-sm font-semibold min-h-[44px] mb-4"
        >
          <Sword size={18} weight="bold" aria-hidden />
          Challenge a fan
        </Link>

        <button
          onClick={onClose}
          className="w-full py-3 text-sm text-white/50 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-card-sm min-h-[44px]"
        >
          Cancel
        </button>
      </motion.div>
    </>
  );
}

// ── Fixture prediction card ───────────────────────────────────────────────────

function FixturePredictionCard({
  fixture,
  stored,
  liveMode,
  onPredicted,
}: {
  fixture: ExpFixture;
  stored: StoredPrediction | null;
  liveMode: boolean;
  onPredicted: (p: StoredPrediction) => void;
}) {
  const reduce = useReducedMotion();
  const isLocked = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME' || fixture.status === 'FINISHED';
  const [homeScore, setHomeScore] = useState(stored?.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(stored?.awayScore ?? 1);
  const [submitted, setSubmitted] = useState(!!stored);
  const [showShare, setShowShare] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!stored) return;
    setHomeScore(stored.homeScore);
    setAwayScore(stored.awayScore);
    setSubmitted(true);
  }, [stored]);

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      let prediction: StoredPrediction = {
        fixtureId: fixture.id,
        homeScore,
        awayScore,
        submittedAt: new Date().toISOString(),
      };

      if (liveMode) {
        const result = await createScorePrediction({
          fixtureId: fixture.id,
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
        });
        prediction = {
          fixtureId: result.fixtureId,
          homeScore: result.predictedHomeScore,
          awayScore: result.predictedAwayScore,
          submittedAt: result.createdAt,
          predictionId: result.id,
          status: result.status,
        };
      }

      savePrediction(prediction);
      setSubmitted(true);
      onPredicted(prediction);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Prediction failed';
      if (message === 'UNAUTHORIZED') {
        setSubmitError('Sign in to lock predictions to your account.');
      } else if (/already exists|already/i.test(message)) {
        setSubmitError('You already locked a prediction for this fixture.');
      } else {
        setSubmitError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 rounded-card overflow-hidden">
        <div className="flex h-0.5">
          <div className="flex-1" style={{ backgroundColor: fixture.homeClub.primaryColor }} aria-hidden />
          <div className="flex-1" style={{ backgroundColor: fixture.awayClub.primaryColor }} aria-hidden />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-label-xs text-white/40">{fixture.competition}</span>
            {isLocked ? (
              <div className="flex items-center gap-1 text-label-xs text-white/40">
                <Lock size={11} aria-hidden />
                <span>Locked</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-label-xs text-exp-gold">
                <Clock size={11} aria-hidden />
                <span>{formatKickoff(fixture.kickoffAt)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between my-4">
            <TeamIdentity club={fixture.homeClub} size="md" showName />
            {isLocked && fixture.homeScore !== null && fixture.awayScore !== null ? (
              <div className="text-center">
                <div className="text-display-md font-black text-white tabular-nums">
                  {fixture.homeScore} - {fixture.awayScore}
                </div>
                <div className="text-label-xs text-exp-live mt-0.5">
                  {fixture.status === 'FINISHED' ? 'FT' : fixture.status === 'HALF_TIME' ? 'HT' : `${fixture.minute ?? ''}′`}
                </div>
              </div>
            ) : (
              <span className="text-label-sm text-white/30">vs</span>
            )}
            <TeamIdentity club={fixture.awayClub} size="md" showName />
          </div>

          <AnimatePresence mode="wait">
            {isLocked ? (
              <motion.div
                key="locked"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 rounded-card-sm p-4 text-center"
              >
                {stored ? (
                  <>
                    <p className="text-label-sm text-white/60 mb-1">Your prediction</p>
                    <p className="text-display-sm font-black text-white">
                      {stored.homeScore} - {stored.awayScore}
                    </p>
                    {fixture.status === 'FINISHED' && (
                      <p className="text-label-xs text-white/40 mt-1">
                        {stored.homeScore === fixture.homeScore && stored.awayScore === fixture.awayScore
                          ? '✓ Exact score — bonus points!'
                          : 'Didn’t match — better luck next time'}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-white/40">
                    <Lock size={14} aria-hidden />
                    <span className="text-label-sm">Predictions closed</span>
                  </div>
                )}
              </motion.div>
            ) : submitted ? (
              <motion.div
                key="submitted"
                initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-exp-green/15 border border-exp-green/25 rounded-card-sm p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} weight="fill" className="text-exp-green" aria-hidden />
                  <p className="text-label-md font-bold text-white">Prediction locked in!</p>
                </div>
                <p className="text-body-sm text-white/60 mb-3">
                  {fixture.homeClub.shortName} {homeScore} - {awayScore} {fixture.awayClub.shortName}
                </p>
                <p className="text-label-xs text-white/30 mb-4">
                  Points only · no real money · no financial value
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowShare(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-label-sm rounded-pill py-2.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                    aria-label="Share prediction"
                  >
                    <ShareNetwork size={15} aria-hidden />
                    Share
                  </button>
                  <Link
                    href={`/predict/challenge?fixture=${fixture.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-white/20 text-white text-label-sm rounded-pill py-2.5 hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                  >
                    <Sword size={15} weight="bold" aria-hidden />
                    Challenge
                  </Link>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 w-full text-label-xs text-white/30 hover:text-white/60 transition-colors duration-100 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm"
                >
                  Edit prediction
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="entry"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-center gap-6 mb-5">
                  <ScoreStepper value={homeScore} onChange={setHomeScore} label={fixture.homeClub.shortName} />
                  <div className="text-display-xl font-black text-white/15 select-none">-</div>
                  <ScoreStepper value={awayScore} onChange={setAwayScore} label={fixture.awayClub.shortName} />
                </div>
                <button
                  onClick={() => { void handleSubmit(); }}
                  disabled={submitting}
                  className="w-full bg-exp-gold text-exp-void font-black py-3.5 rounded-pill hover:bg-exp-gold-2 active:scale-[0.97] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px]"
                >
                  {submitting ? 'Locking in...' : 'Lock in prediction'}
                </button>
                {submitError && (
                  <div className="mt-3 rounded-card-sm border border-exp-live/40 bg-exp-live/10 px-3 py-2 text-center">
                    <p role="alert" className="text-label-sm text-exp-live">{submitError}</p>
                    {submitError.includes('Sign in') && (
                      <Link
                        href={`/sign-in?redirect=${encodeURIComponent('/predict')}`}
                        className="mt-1 inline-block text-label-sm text-exp-gold underline"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>
                )}
                <p className="text-label-xs text-white/30 text-center mt-2">
                  Points only · no real money · no financial value
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showShare && (
          <ShareSheet
            fixture={fixture}
            homeScore={homeScore}
            awayScore={awayScore}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PredictPage() {
  const mode = getDataMode();
  const [fixtures, setFixtures] = useState<ExpFixture[]>([]);
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFixtures = useCallback(async () => {
    const requestedFixtureId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('fixtureId')
      : null;
    setSelectedFixtureId(requestedFixtureId);

    if (mode === 'DESIGN_REVIEW_DATA') {
      setFixtures(WC_FIXTURES);
      setPredictions(loadPredictions());
      setLoading(false);
      return;
    }

    try {
      const [data, sessionResult] = await Promise.all([
        getFixtures({ seasonSlug: 'fifa-world-cup-2026', status: 'SCHEDULED' }),
        validateSession(),
      ]);
      const mapped = data.map(toExpFixture).sort((a, b) => {
        if (a.id === requestedFixtureId) return -1;
        if (b.id === requestedFixtureId) return 1;
        return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
      });
      setFixtures(mapped);

      if (sessionResult.status === 'authenticated') {
        const settled = await Promise.allSettled(
          mapped.map(async f => {
            const p = await getMyFixturePrediction(f.id);
            return p
              ? {
                  fixtureId: p.fixtureId,
                  homeScore: p.predictedHomeScore,
                  awayScore: p.predictedAwayScore,
                  submittedAt: p.createdAt,
                  predictionId: p.id,
                  status: p.status,
                } satisfies StoredPrediction
              : null;
          }),
        );
        const serverPredictions = settled.flatMap(r => {
          if (r.status !== 'fulfilled' || !r.value) return [];
          return [r.value];
        });
        if (serverPredictions.length > 0) setPredictions(serverPredictions);
        else setPredictions(loadPredictions());
      } else {
        setPredictions(loadPredictions());
      }
    } catch {
      setError('Could not load fixtures. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { void loadFixtures(); }, [loadFixtures]);

  function handlePredicted(p: StoredPrediction) {
    setPredictions(prev => {
      const rest = prev.filter(x => x.fixtureId !== p.fixtureId);
      return [...rest, p];
    });
  }

  return (
    <div className="min-h-screen bg-exp-void">
      <DesignReviewBanner />

      <div className="bg-exp-navy border-b border-white/8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-label-sm text-white/50 hover:text-white transition-colors duration-150 mb-4 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold rounded-sm"
          >
            <ArrowLeft size={14} aria-hidden />
            Home
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-display-md font-black text-white">Guess the Score</h1>
              <p className="text-body-sm text-white/50 mt-1">
                Predict exact scorelines to earn bonus points
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-exp-gold/15 border border-exp-gold/25 rounded-pill px-3 py-1.5">
              <Trophy size={14} className="text-exp-gold" aria-hidden />
              <span className="text-label-sm text-exp-gold font-bold">Points only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-card p-5 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
                <div className="h-20 bg-white/8 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/25 rounded-card p-6 text-center">
            <p className="text-white/70 text-body-sm mb-3">{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); void loadFixtures(); }}
              className="text-label-md text-exp-gold underline hover:text-exp-gold-2 transition-colors duration-100"
            >
              Try again
            </button>
          </div>
        ) : fixtures.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={40} className="text-white/20 mx-auto mb-4" aria-hidden />
            <p className="text-body-md text-white/40">No upcoming fixtures to predict</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedFixtureId && (
              <p className="text-label-sm text-exp-gold text-center">
                Selected fixture is shown first.
              </p>
            )}
            <div className="flex gap-4 bg-white/5 border border-white/8 rounded-card-sm p-4">
              <div className="text-center flex-1">
                <p className="text-display-sm font-black text-exp-gold">
                  {predictions.length}
                </p>
                <p className="text-label-xs text-white/40">Predictions</p>
              </div>
              <div className="w-px bg-white/10" aria-hidden />
              <div className="text-center flex-1">
                <p className="text-display-sm font-black text-white">
                  {fixtures.filter(f => f.status === 'SCHEDULED').length}
                </p>
                <p className="text-label-xs text-white/40">Upcoming</p>
              </div>
              <div className="w-px bg-white/10" aria-hidden />
              <div className="text-center flex-1">
                <p className="text-display-sm font-black text-exp-green">
                  {fixtures.filter(f => f.status === 'LIVE' || f.status === 'HALF_TIME').length}
                </p>
                <p className="text-label-xs text-white/40">Live</p>
              </div>
            </div>

            {fixtures.map(fixture => (
              <FixturePredictionCard
                key={fixture.id}
                fixture={fixture}
                stored={predictions.find(p => p.fixtureId === fixture.id) ?? null}
                liveMode={mode !== 'DESIGN_REVIEW_DATA'}
                onPredicted={handlePredicted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
