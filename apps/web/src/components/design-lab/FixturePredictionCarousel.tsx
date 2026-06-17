'use client';

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type MouseEvent as RMouseEvent,
  type TouchEvent as RTouchEvent,
} from 'react';

export type PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY';

export interface CarouselFixture {
  id: string;
  homeTeam: { name: string; shortName: string };
  awayTeam: { name: string; shortName: string };
  kickoffAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  group?: { name: string } | null;
  /** Prediction the authenticated user has already made, if any */
  userPrediction?: {
    homeScore: number;
    awayScore: number;
    outcome: PredictionOutcome;
    points?: number;
    isSettled: boolean;
  } | null;
  /** Community aggregates for display — no odds framing */
  community?: {
    totalPredictions: number;
    homePct: number;
    drawPct: number;
    awayPct: number;
  } | null;
}

interface CountdownProps { to: string }

function Countdown({ to }: CountdownProps) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    function tick() {
      const diff = new Date(to).getTime() - Date.now();
      if (diff <= 0) { setLabel('Locked'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 24) setLabel(`${Math.floor(h / 24)}d ${h % 24}h`);
      else if (h > 0) setLabel(`${h}h ${m}m`);
      else setLabel(`${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [to]);

  return <span className="font-mono tabular-nums">{label}</span>;
}

interface PredictionCardProps {
  fixture: CarouselFixture;
  index: number;
  total: number;
  selected: PredictionOutcome | null;
  homeScore: string;
  awayScore: string;
  onSelect: (outcome: PredictionOutcome) => void;
  onHomeScore: (v: string) => void;
  onAwayScore: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitted: boolean;
}

function PredictionCard({
  fixture, index, total, selected,
  homeScore, awayScore,
  onSelect, onHomeScore, onAwayScore,
  onSubmit, submitting, submitted,
}: PredictionCardProps) {
  const isLocked = fixture.status !== 'SCHEDULED';
  const community = fixture.community;

  const btnCls = (outcome: PredictionOutcome) => {
    const base = 'flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ';
    if (selected === outcome) {
      const map: Record<PredictionOutcome, string> = {
        HOME: 'border-psl-navy bg-psl-navy text-white',
        DRAW: 'border-psl-gold bg-psl-gold text-psl-navy',
        AWAY: 'border-psl-green bg-psl-green text-white',
      };
      return base + map[outcome];
    }
    return base + 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700';
  };

  return (
    <article
      className="shrink-0 w-full rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
      aria-label={`Fixture ${index + 1} of ${total}: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`}
    >
      {/* Match header */}
      <div className="bg-psl-navy text-white px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            {fixture.group && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
                {fixture.group.name}
              </div>
            )}
            <div className="text-[10px] text-white/40">
              {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', {
                weekday: 'short', day: 'numeric', month: 'short',
              })}
            </div>
          </div>
          <div className="text-right">
            {!isLocked ? (
              <div className="text-xs text-psl-gold font-semibold">
                <span className="text-white/40 text-[10px] mr-1">Locks in</span>
                <Countdown to={fixture.kickoffAt} />
              </div>
            ) : (
              <div className="text-xs font-bold text-amber-400">
                {fixture.status === 'LIVE' ? '🔴 LIVE' : fixture.status === 'FINISHED' ? 'FT' : fixture.status}
              </div>
            )}
          </div>
        </div>

        {/* Teams & score */}
        <div className="flex items-center gap-4">
          <div className="flex-1 text-right">
            <div className="text-lg font-black leading-tight">{fixture.homeTeam.name}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">{fixture.homeTeam.shortName}</div>
          </div>
          <div className="text-center px-2">
            {fixture.homeScore !== null ? (
              <div className="text-3xl font-black tabular-nums">
                {fixture.homeScore}–{fixture.awayScore}
              </div>
            ) : (
              <div className="text-sm font-bold text-white/30">vs</div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-lg font-black leading-tight">{fixture.awayTeam.name}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">{fixture.awayTeam.shortName}</div>
          </div>
        </div>

        {/* User's previous prediction if settled */}
        {fixture.userPrediction?.isSettled && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs">
            <span className="text-white/50">Your prediction:</span>
            <span className="text-psl-gold font-bold">
              {fixture.userPrediction.homeScore}–{fixture.userPrediction.awayScore}
            </span>
            {fixture.userPrediction.points !== undefined && (
              <span className="ml-auto text-psl-gold font-black">+{fixture.userPrediction.points} pts</span>
            )}
          </div>
        )}
      </div>

      {/* Prediction body */}
      <div className="p-5">
        {isLocked ? (
          <div className="text-center py-4 text-sm text-gray-400">
            Predictions closed · match {fixture.status.toLowerCase()}
          </div>
        ) : submitted ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-1">✓</div>
            <div className="font-bold text-psl-green text-sm">Prediction saved</div>
            <div className="text-xs text-gray-400 mt-1">Points will be awarded after the match</div>
          </div>
        ) : (
          <>
            {/* Outcome selector */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">Result</p>
              <div className="flex gap-2" role="group" aria-label="Select match outcome">
                {(['HOME', 'DRAW', 'AWAY'] as PredictionOutcome[]).map(outcome => {
                  const labels: Record<PredictionOutcome, string> = {
                    HOME: fixture.homeTeam.shortName,
                    DRAW: 'Draw',
                    AWAY: fixture.awayTeam.shortName,
                  };
                  return (
                    <button
                      key={outcome}
                      onClick={() => onSelect(outcome)}
                      className={btnCls(outcome)}
                      aria-pressed={selected === outcome}
                    >
                      {labels[outcome]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Score prediction */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">Exact Score (bonus points)</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 block mb-1">{fixture.homeTeam.shortName}</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={homeScore}
                    onChange={e => onHomeScore(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-lg font-black text-psl-navy focus:outline-none focus:border-psl-navy"
                  />
                </div>
                <span className="text-gray-300 text-xl font-light mt-4">–</span>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 block mb-1">{fixture.awayTeam.shortName}</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={awayScore}
                    onChange={e => onAwayScore(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-lg font-black text-psl-navy focus:outline-none focus:border-psl-navy"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={onSubmit}
              disabled={!selected || submitting}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all bg-psl-navy text-white hover:bg-psl-navy/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving…' : 'Confirm Prediction'}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-2">
              Points only · no wagers · no stakes
            </p>
          </>
        )}

        {/* Community stats — percentage framing, not odds */}
        {community && community.totalPredictions > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Fan predictions ({community.totalPredictions.toLocaleString()})
            </p>
            <div className="flex gap-1 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-psl-navy rounded-full" style={{ width: `${community.homePct}%` }} />
              <div className="bg-psl-gold rounded-full" style={{ width: `${community.drawPct}%` }} />
              <div className="bg-psl-green rounded-full" style={{ width: `${community.awayPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span><span className="font-bold text-psl-navy">{community.homePct}%</span> {fixture.homeTeam.shortName}</span>
              <span><span className="font-bold text-psl-gold">{community.drawPct}%</span> Draw</span>
              <span><span className="font-bold text-psl-green">{community.awayPct}%</span> {fixture.awayTeam.shortName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="px-5 pb-4 flex items-center justify-between text-[10px] text-gray-300">
        <span>{index + 1} / {total}</span>
        <span>All gameplay is points-only. Not a betting product.</span>
      </div>
    </article>
  );
}

/* ─── Per-card state ─────────────────────────────────────────────── */
interface CardState {
  selected: PredictionOutcome | null;
  homeScore: string;
  awayScore: string;
  submitting: boolean;
  submitted: boolean;
}

function defaultCardState(): CardState {
  return { selected: null, homeScore: '', awayScore: '', submitting: false, submitted: false };
}

/* ─── Carousel ───────────────────────────────────────────────────── */
interface FixturePredictionCarouselProps {
  fixtures: CarouselFixture[];
  onSubmitPrediction?: (
    fixtureId: string,
    outcome: PredictionOutcome,
    homeScore: number | null,
    awayScore: number | null,
  ) => Promise<void>;
  loading?: boolean;
}

export function FixturePredictionCarousel({
  fixtures,
  onSubmitPrediction,
  loading = false,
}: FixturePredictionCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [cardStates, setCardStates] = useState<CardState[]>(() =>
    fixtures.map(defaultCardState),
  );

  /* Sync card states when fixtures array changes length */
  useEffect(() => {
    setCardStates(prev => {
      const next = fixtures.map((_, i) => prev[i] ?? defaultCardState());
      return next;
    });
  }, [fixtures.length]);

  /* ── Scroll to card ─────────────────────────────────────────────── */
  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement | undefined;
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setCurrent(idx);
  }, []);

  /* ── Scroll observer — keep current in sync with scroll ────────── */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Array.from(track.children).indexOf(e.target as Element);
            if (idx >= 0) setCurrent(idx);
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    Array.from(track.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [fixtures.length]);

  /* ── Keyboard navigation ─────────────────────────────────────────── */
  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollTo(Math.min(current + 1, fixtures.length - 1)); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollTo(Math.max(current - 1, 0)); }
      if (e.key === 'Home')       { e.preventDefault(); scrollTo(0); }
      if (e.key === 'End')        { e.preventDefault(); scrollTo(fixtures.length - 1); }
    },
    [current, fixtures.length, scrollTo],
  );

  /* ── Mouse drag ─────────────────────────────────────────────────── */
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e: RMouseEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: e.clientX, scrollLeft: trackRef.current?.scrollLeft ?? 0 };
  };
  const onMouseMove = (e: RMouseEvent<HTMLDivElement>) => {
    if (!drag.current.active || !trackRef.current) return;
    e.preventDefault();
    const dx = e.clientX - drag.current.startX;
    trackRef.current.scrollLeft = drag.current.scrollLeft - dx;
  };
  const onMouseUp = () => { drag.current.active = false; };

  /* ── Touch swipe ────────────────────────────────────────────────── */
  const touch = useRef({ startX: 0 });
  const onTouchStart = (e: RTouchEvent<HTMLDivElement>) => {
    touch.current.startX = e.touches[0]!.clientX;
  };
  const onTouchEnd = (e: RTouchEvent<HTMLDivElement>) => {
    const dx = touch.current.startX - e.changedTouches[0]!.clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) scrollTo(Math.min(current + 1, fixtures.length - 1));
      else scrollTo(Math.max(current - 1, 0));
    }
  };

  /* ── Card state helpers ─────────────────────────────────────────── */
  function patchCard(i: number, patch: Partial<CardState>) {
    setCardStates(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  async function handleSubmit(i: number) {
    const state = cardStates[i];
    if (!state?.selected) return;
    patchCard(i, { submitting: true });
    try {
      await onSubmitPrediction?.(
        fixtures[i]!.id,
        state.selected,
        state.homeScore !== '' ? parseInt(state.homeScore, 10) : null,
        state.awayScore !== '' ? parseInt(state.awayScore, 10) : null,
      );
      patchCard(i, { submitted: true, submitting: false });
    } catch {
      patchCard(i, { submitting: false });
    }
  }

  /* ── Skeleton ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full h-80 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
        No fixtures available for prediction
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* Track */}
      <div
        ref={trackRef}
        role="region"
        aria-label="Fixture prediction carousel"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKey}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="flex overflow-x-auto gap-4 pb-2 outline-none cursor-grab active:cursor-grabbing"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {fixtures.map((fixture, i) => {
          const state = cardStates[i] ?? defaultCardState();
          return (
            <div
              key={fixture.id}
              style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', minWidth: '100%' }}
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${fixtures.length}`}
            >
              <PredictionCard
                fixture={fixture}
                index={i}
                total={fixtures.length}
                selected={state.selected}
                homeScore={state.homeScore}
                awayScore={state.awayScore}
                onSelect={outcome => patchCard(i, { selected: outcome })}
                onHomeScore={v => patchCard(i, { homeScore: v })}
                onAwayScore={v => patchCard(i, { awayScore: v })}
                onSubmit={() => handleSubmit(i)}
                submitting={state.submitting}
                submitted={state.submitted}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => scrollTo(Math.max(current - 1, 0))}
          disabled={current === 0}
          aria-label="Previous fixture"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-psl-navy hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg"
        >
          ‹
        </button>

        {/* Pagination dots */}
        <div className="flex gap-1.5" role="tablist" aria-label="Fixture pagination">
          {fixtures.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to fixture ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-6 h-2 bg-psl-navy'
                  : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(Math.min(current + 1, fixtures.length - 1))}
          disabled={current === fixtures.length - 1}
          aria-label="Next fixture"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-psl-navy hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg"
        >
          ›
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-2">
        Use arrow keys or swipe to navigate · {fixtures.length} fixtures
      </p>
    </div>
  );
}
