'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { footballClient, type Fixture } from '@/lib/football-client';
import { predictionsClient, type Prediction } from '@/lib/predictions-client';
import { getCountryFlag } from '@/components/ui/TeamCrest';
import { PredictionShareCard } from '@/components/share';
import { ChallengeFriendSheet } from '@/components/share';

/* ── Score stepper ──────────────────────────────────────────────────────── */
function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-psl-muted">{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.1 }}
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Decrease ${label} score`}
          className="w-11 h-11 rounded-full bg-psl-surface border border-[#e8eaf0] text-psl-navy font-black text-xl flex items-center justify-center hover:bg-[#e8eaf0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy min-h-[44px]"
        >
          −
        </motion.button>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.8 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            className="w-10 text-center text-display-md text-psl-navy tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.1 }}
          onClick={() => onChange(Math.min(20, value + 1))}
          aria-label={`Increase ${label} score`}
          className="w-11 h-11 rounded-full bg-psl-surface border border-[#e8eaf0] text-psl-navy font-black text-xl flex items-center justify-center hover:bg-[#e8eaf0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy min-h-[44px]"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function PredictFixturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [existing, setExisting] = useState<Prediction | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      footballClient.getFixture(id),
      predictionsClient.getMyPredictionForFixture(id).catch(() => null),
    ])
      .then(([f, pred]) => {
        setFixture(f);
        if (pred) {
          setExisting(pred);
          setHomeScore(pred.predictedHomeScore);
          setAwayScore(pred.predictedAwayScore);
        }
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [id, router]);

  async function handleSubmit() {
    setError(null);
    setShareVisible(false);
    setSaving(true);
    try {
      if (existing) {
        const updated = await predictionsClient.updatePrediction(existing.id, {
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
        });
        setExisting(updated);
      } else {
        const created = await predictionsClient.createPrediction(id, homeScore, awayScore);
        setExisting(created);
      }
      setShareVisible(true);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to save prediction');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !fixture) {
    return (
      <main className="min-h-screen bg-psl-surface flex items-center justify-center">
        <div className="space-y-3 w-full max-w-sm mx-auto px-4">
          <div className="rounded-card border border-[#e8eaf0] bg-white shadow-card p-6">
            <div className="h-3 w-32 bg-gray-100 rounded mx-auto mb-6 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
            <div className="flex items-center justify-center gap-8">
              {[0, 1].map(i => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                  <div className="h-2.5 w-10 bg-gray-100 rounded motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isOpen = fixture.status === 'SCHEDULED' && new Date(fixture.kickoffAt).getTime() > Date.now();
  const homeFlag = getCountryFlag(fixture.homeTeam.shortName);
  const awayFlag = getCountryFlag(fixture.awayTeam.shortName);

  const kickoffLabel = new Date(fixture.kickoffAt).toLocaleString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  return (
    <main className="min-h-screen bg-psl-surface">
      {/* Header */}
      <div className="bg-white border-b border-[#e8eaf0]">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-1 text-xs text-psl-muted">
            <Link href="/predictions/fixtures" className="hover:text-psl-navy transition-colors focus-visible:underline">
              Guess the Score
            </Link>
            <span>/</span>
            <span className="text-psl-navy font-semibold truncate">
              {fixture.homeTeam.shortName} vs {fixture.awayTeam.shortName}
            </span>
          </div>
          <h1 className="text-display-sm text-psl-navy">Your Prediction</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Fixture card */}
        <div className="rounded-card border border-[#e8eaf0] bg-white shadow-card overflow-hidden">
          {/* Competition / date row */}
          <div className="px-5 py-3 border-b border-[#f0f2f7] text-center">
            <p className="text-[11px] text-psl-muted font-medium">{kickoffLabel}</p>
            {fixture.group && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-psl-muted mt-0.5">{fixture.group.name}</p>
            )}
          </div>

          {/* Teams */}
          <div className="px-5 py-6 flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col items-center gap-2 text-center">
              <div className="text-4xl leading-none" aria-hidden>
                {homeFlag || fixture.homeTeam.shortName.slice(0, 2)}
              </div>
              <span className="text-sm font-bold text-psl-navy">{fixture.homeTeam.shortName}</span>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-psl-muted">vs</span>
              {!isOpen && (
                <span className="text-[10px] text-psl-muted font-semibold">Closed</span>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center gap-2 text-center">
              <div className="text-4xl leading-none" aria-hidden>
                {awayFlag || fixture.awayTeam.shortName.slice(0, 2)}
              </div>
              <span className="text-sm font-bold text-psl-navy">{fixture.awayTeam.shortName}</span>
            </div>
          </div>
        </div>

        {/* Score prediction card */}
        <div className="rounded-card border border-[#e8eaf0] bg-white shadow-card p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-psl-muted text-center mb-5">
            {existing ? 'Update your prediction' : 'Enter your predicted score'}
          </p>

          <div className="flex items-center justify-center gap-8 mb-6">
            <ScoreStepper
              label={fixture.homeTeam.shortName}
              value={homeScore}
              onChange={setHomeScore}
            />
            <div className="text-display-lg text-[#d0d5e0] font-light select-none">–</div>
            <ScoreStepper
              label={fixture.awayTeam.shortName}
              value={awayScore}
              onChange={setAwayScore}
            />
          </div>

          {existing && (
            <p className="text-center text-xs text-psl-gold font-semibold mb-4">
              Current: {existing.predictedHomeScore}–{existing.predictedAwayScore}
            </p>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-xs text-red-500 mb-3"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {isOpen ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-psl-navy text-white font-black py-3.5 rounded-card-sm hover:bg-psl-navy/90 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-2 min-h-[44px]"
            >
              {saving ? 'Saving…' : existing ? 'Update Prediction' : 'Submit Prediction'}
            </motion.button>
          ) : (
            <p className="text-center text-sm text-psl-muted py-3 rounded-card-sm bg-psl-surface">
              Predictions are closed for this fixture.
            </p>
          )}

          <p className="text-center text-[11px] text-psl-muted mt-3">
            Points only · no real money · no deposits or withdrawals
          </p>
        </div>

        {/* Post-prediction share card */}
        {existing && (
          <PredictionShareCard
            fixtureId={id}
            homeTeam={fixture.homeTeam.shortName}
            awayTeam={fixture.awayTeam.shortName}
            homeScore={existing.predictedHomeScore}
            awayScore={existing.predictedAwayScore}
            visible={shareVisible}
            onDismiss={() => setShareVisible(false)}
          />
        )}

        {/* Action row — Challenge + Match Centre */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setChallengeOpen(true)}
            className="flex items-center justify-center gap-2 rounded-card border border-[#e8eaf0] bg-white shadow-card p-3 text-xs font-semibold text-psl-navy hover:bg-psl-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 min-h-[44px]"
            aria-label="Challenge a friend"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            Challenge friend
          </button>

          <Link
            href={`/matches/${fixture.id}`}
            className="flex items-center justify-center gap-2 rounded-card border border-[#e8eaf0] bg-white shadow-card p-3 text-xs font-semibold text-psl-muted hover:text-psl-navy hover:bg-psl-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 min-h-[44px]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            Match Centre
          </Link>
        </div>
      </div>

      <ChallengeFriendSheet
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        fixtureId={id}
        homeTeam={fixture.homeTeam.shortName}
        awayTeam={fixture.awayTeam.shortName}
      />
    </main>
  );
}
