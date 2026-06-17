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
  userPrediction?: {
    homeScore: number;
    awayScore: number;
    outcome: PredictionOutcome;
    points?: number;
    isSettled: boolean;
  } | null;
  /** Community aggregates — percentage framing, not odds framing */
  community?: {
    totalPredictions: number;
    homePct: number;
    drawPct: number;
    awayPct: number;
  } | null;
}

/* ── Countdown ─────────────────────────────────────────────────── */
function Countdown({ to }: { to: string }) {
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

  const urgency = (() => {
    const diff = new Date(to).getTime() - Date.now();
    if (diff < 0) return 'locked';
    if (diff < 3_600_000) return 'urgent';
    if (diff < 86_400_000) return 'soon';
    return 'normal';
  })();

  const cls = {
    locked: 'text-psl-muted',
    urgent: 'text-psl-live motion-safe:animate-live-pulse',
    soon:   'text-amber-500',
    normal: 'text-psl-gold',
  }[urgency];

  return (
    <span className={`font-mono tabular-nums text-xs font-bold ${cls}`}>{label || '…'}</span>
  );
}

/* ── Animated community bar ────────────────────────────────────── */
function CommunityBar({ homePct, drawPct, awayPct, total, homeShort, awayShort }: {
  homePct: number; drawPct: number; awayPct: number;
  total: number; homeShort: string; awayShort: string;
}) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const h = animated ? homePct : 0;
  const d = animated ? drawPct : 0;
  const a = animated ? awayPct : 0;

  return (
    <div className="mt-4 pt-4 border-t border-[#f0f2f8]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-psl-muted mb-2.5">
        Fan predictions ({total.toLocaleString()})
      </p>
      <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-2.5">
        <div
          className="bg-psl-navy rounded-full motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out"
          style={{ width: `${h}%` }}
        />
        <div
          className="bg-psl-gold rounded-full motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-75"
          style={{ width: `${d}%` }}
        />
        <div
          className="bg-psl-green rounded-full motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out motion-safe:delay-150"
          style={{ width: `${a}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-psl-muted">
        <span>
          <span className="font-bold text-psl-navy">{homePct}%</span> {homeShort}
        </span>
        <span>
          <span className="font-bold text-psl-gold">{drawPct}%</span> Draw
        </span>
        <span>
          <span className="font-bold text-psl-green">{awayPct}%</span> {awayShort}
        </span>
      </div>
    </div>
  );
}

/* ── Prediction Card ───────────────────────────────────────────── */
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

  function btnCls(outcome: PredictionOutcome): string {
    const base = 'flex-1 py-3 rounded-card-sm text-sm font-bold border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 motion-safe:transition-all motion-safe:duration-150 ';
    if (selected === outcome) {
      const active: Record<PredictionOutcome, string> = {
        HOME: 'border-psl-navy bg-psl-navy text-white shadow-card-md motion-safe:scale-[1.03]',
        DRAW: 'border-psl-gold bg-psl-gold text-psl-navy shadow-card-md motion-safe:scale-[1.03]',
        AWAY: 'border-psl-green bg-psl-green text-white shadow-card-md motion-safe:scale-[1.03]',
      };
      return base + active[outcome];
    }
    return base + 'border-[#e8eaf0] text-psl-muted hover:border-psl-navy/30 hover:text-psl-navy';
  }

  return (
    <article
      className="w-full rounded-card border border-[#e8eaf0] bg-white shadow-card overflow-hidden"
      aria-label={`Fixture ${index + 1} of ${total}: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`}
    >
      {/* Match header */}
      <div className="bg-psl-midnight text-white px-5 pt-5 pb-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            {fixture.group && (
              <div className="text-label-sm text-white/40 mb-1">{fixture.group.name}</div>
            )}
            <div className="text-[11px] text-white/30">
              {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', {
                weekday: 'short', day: 'numeric', month: 'short',
              })}
            </div>
          </div>
          <div className="text-right">
            {!isLocked ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-white/30">Locks in</span>
                <Countdown to={fixture.kickoffAt} />
              </div>
            ) : (
              <span className={`text-xs font-bold ${fixture.status === 'LIVE' ? 'text-psl-live' : 'text-psl-muted'}`}>
                {fixture.status === 'LIVE' ? 'Live' : fixture.status === 'HALF_TIME' ? 'HT' : 'FT'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 text-right">
            <div className="text-display-sm text-white leading-tight">{fixture.homeTeam.name}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{fixture.homeTeam.shortName}</div>
          </div>
          <div className="text-center px-3 flex-shrink-0">
            {fixture.homeScore !== null ? (
              <div className="text-display-lg text-white tabular-nums">
                {fixture.homeScore}–{fixture.awayScore}
              </div>
            ) : (
              <div className="text-sm font-bold text-white/20">vs</div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-display-sm text-white leading-tight">{fixture.awayTeam.name}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{fixture.awayTeam.shortName}</div>
          </div>
        </div>

        {fixture.userPrediction?.isSettled && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs">
            <span className="text-white/40">Your prediction:</span>
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
          <div className="text-center py-6 text-sm text-psl-muted">
            Predictions closed · match {fixture.status.toLowerCase()}
          </div>
        ) : submitted ? (
          <div className="text-center py-6 motion-safe:animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-psl-green/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-psl-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="font-bold text-psl-green text-sm mb-1">Prediction saved</div>
            <div className="text-xs text-psl-muted">Points awarded after the match</div>
          </div>
        ) : (
          <>
            {/* Outcome selector */}
            <div className="mb-4">
              <p className="text-label-sm text-psl-muted mb-2.5">Result</p>
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
            <div className="mb-5">
              <p className="text-label-sm text-psl-muted mb-2.5">Exact Score <span className="text-psl-gold normal-case font-normal">(+5 pts bonus)</span></p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-psl-muted block mb-1.5">{fixture.homeTeam.shortName}</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={homeScore}
                    onChange={e => onHomeScore(e.target.value)}
                    className="w-full border border-[#e8eaf0] rounded-card-sm px-3 py-2.5 text-center text-lg font-black text-psl-navy focus:outline-none focus:border-psl-navy motion-safe:transition-colors"
                    aria-label={`${fixture.homeTeam.shortName} score`}
                  />
                </div>
                <span className="text-[#e8eaf0] text-2xl font-light mt-5 select-none">–</span>
                <div className="flex-1">
                  <label className="text-[10px] text-psl-muted block mb-1.5">{fixture.awayTeam.shortName}</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={awayScore}
                    onChange={e => onAwayScore(e.target.value)}
                    className="w-full border border-[#e8eaf0] rounded-card-sm px-3 py-2.5 text-center text-lg font-black text-psl-navy focus:outline-none focus:border-psl-navy motion-safe:transition-colors"
                    aria-label={`${fixture.awayTeam.shortName} score`}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={onSubmit}
              disabled={!selected || submitting}
              className="w-full py-3 rounded-card-sm font-bold text-sm motion-safe:transition-all bg-psl-navy text-white hover:bg-psl-navy/90 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1"
            >
              {submitting ? 'Saving…' : 'Confirm Prediction'}
            </button>

            <p className="text-[10px] text-psl-muted text-center mt-2">
              Points only · no wagers · no stakes
            </p>
          </>
        )}

        {community && community.totalPredictions > 0 && (
          <CommunityBar
            homePct={community.homePct}
            drawPct={community.drawPct}
            awayPct={community.awayPct}
            total={community.totalPredictions}
            homeShort={fixture.homeTeam.shortName}
            awayShort={fixture.awayTeam.shortName}
          />
        )}
      </div>

      <div className="px-5 pb-4 flex items-center justify-between text-[10px] text-psl-muted/50">
        <span>{index + 1} / {total}</span>
        <span>Points-only · not a betting product</span>
      </div>
    </article>
  );
}

/* ── Per-card state ────────────────────────────────────────────── */
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

/* ── Carousel ──────────────────────────────────────────────────── */
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
  const [cardStates, setCardStates] = useState<CardState[]>(() => fixtures.map(defaultCardState));

  useEffect(() => {
    setCardStates(prev => fixtures.map((_, i) => prev[i] ?? defaultCardState()));
  }, [fixtures.length]);

  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement | undefined;
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setCurrent(idx);
  }, []);

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

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollTo(Math.min(current + 1, fixtures.length - 1)); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollTo(Math.max(current - 1, 0)); }
      if (e.key === 'Home')       { e.preventDefault(); scrollTo(0); }
      if (e.key === 'End')        { e.preventDefault(); scrollTo(fixtures.length - 1); }
    },
    [current, fixtures.length, scrollTo],
  );

  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const onMouseDown = (e: RMouseEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: e.clientX, scrollLeft: trackRef.current?.scrollLeft ?? 0 };
  };
  const onMouseMove = (e: RMouseEvent<HTMLDivElement>) => {
    if (!drag.current.active || !trackRef.current) return;
    e.preventDefault();
    trackRef.current.scrollLeft = drag.current.scrollLeft - (e.clientX - drag.current.startX);
  };
  const onMouseUp = () => { drag.current.active = false; };

  const touch = useRef({ startX: 0 });
  const onTouchStart = (e: RTouchEvent<HTMLDivElement>) => { touch.current.startX = e.touches[0]!.clientX; };
  const onTouchEnd = (e: RTouchEvent<HTMLDivElement>) => {
    const dx = touch.current.startX - e.changedTouches[0]!.clientX;
    if (Math.abs(dx) > 50) {
      scrollTo(dx > 0 ? Math.min(current + 1, fixtures.length - 1) : Math.max(current - 1, 0));
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div
          className="w-full h-96 rounded-card bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] motion-safe:animate-shimmer"
        />
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-200 motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="rounded-card border border-[#e8eaf0] p-12 text-center text-psl-muted text-sm">
        No fixtures available for prediction
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* Track — card-peek: each card is ~92% wide so next card peeks in */}
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
        className="flex overflow-x-auto gap-4 pb-2 outline-none cursor-grab active:cursor-grabbing -mx-4 px-4"
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
              style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                minWidth: fixtures.length > 1 ? 'calc(100% - 24px)' : '100%',
                maxWidth: fixtures.length > 1 ? 'calc(100% - 24px)' : '100%',
              }}
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

      {/* Navigation */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={() => scrollTo(Math.max(current - 1, 0))}
          disabled={current === 0}
          aria-label="Previous fixture"
          className="w-9 h-9 rounded-full flex items-center justify-center text-psl-muted hover:text-psl-navy hover:bg-[#f0f2f8] disabled:opacity-30 disabled:cursor-not-allowed motion-safe:transition-all text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
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
              className={`rounded-full motion-safe:transition-all motion-safe:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy ${
                i === current
                  ? 'w-6 h-2 bg-psl-navy'
                  : 'w-2 h-2 bg-[#e8eaf0] hover:bg-[#c0c8d8]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(Math.min(current + 1, fixtures.length - 1))}
          disabled={current === fixtures.length - 1}
          aria-label="Next fixture"
          className="w-9 h-9 rounded-full flex items-center justify-center text-psl-muted hover:text-psl-navy hover:bg-[#f0f2f8] disabled:opacity-30 disabled:cursor-not-allowed motion-safe:transition-all text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
        >
          ›
        </button>
      </div>

      <p className="text-[10px] text-psl-muted text-center mt-2">
        Use arrow keys or swipe to navigate · {fixtures.length} fixtures
      </p>
    </div>
  );
}
