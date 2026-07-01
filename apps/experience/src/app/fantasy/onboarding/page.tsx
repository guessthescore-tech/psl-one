'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyActionBar } from '@/components/fantasy/shared/FantasyActionBar';
import { FantasyBottomSheet } from '@/components/fantasy/shared/FantasyBottomSheet';
import { OnboardingStep } from '@/components/fantasy/core/OnboardingStep';
import { FormationSelector } from '@/components/fantasy/core/FormationSelector';
import { FantasyPitchView } from '@/components/fantasy/core/FantasyPitchView';
import { PlayerPool } from '@/components/fantasy/core/PlayerPool';
import { BenchPanel } from '@/components/fantasy/core/BenchPanel';
import { BudgetIndicator } from '@/components/fantasy/core/BudgetIndicator';
import { CaptainMarker } from '@/components/fantasy/core/CaptainMarker';
import { FANTASY_MOCK_PLAYERS, getDataMode } from '@/lib/data';
import type { ExpFantasyPlayer } from '@/lib/data';
import { getWorldCupSeason } from '@/lib/football-api';
import { getPlayerPool, getPlayerPrices } from '@/lib/fantasy-api';
import { toExpFantasyPlayer, toFantasySlot } from '@/lib/fantasy-player-mapper';

const TOTAL_BUDGET = 100;
const STEP_LABELS = ['Name Team', 'Formation', 'Build Squad', 'Review'];

type Step = 1 | 2 | 3 | 4;

interface SquadState {
  starters: (ExpFantasyPlayer | null)[];
  bench: (ExpFantasyPlayer | null)[];
}

function parseFormationRows(formation: string): number[] {
  return formation.split('-').map(Number);
}

function buildEmptySquad(formation: string): SquadState {
  const rows = parseFormationRows(formation);
  const starterCount = 1 + rows.reduce((a, b) => a + b, 0);
  return {
    starters: Array.from({ length: starterCount }, () => null),
    bench: [null, null, null, null],
  };
}

export default function OnboardingPage() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const mode = getDataMode();

  const [step, setStep] = useState<Step>(1);
  const [teamName, setTeamName] = useState('');
  const [nameError, setNameError] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [squad, setSquad] = useState<SquadState>(() => {
    // In design review, pre-fill squad
    if (mode === 'DESIGN_REVIEW_DATA') {
      const starters = FANTASY_MOCK_PLAYERS
        .filter(p => p.squadRole === 'STARTER')
        .slice(0, 11);
      const bench = FANTASY_MOCK_PLAYERS
        .filter(p => p.squadRole === 'SUBSTITUTE')
        .slice(0, 4);
      return { starters, bench };
    }
    return buildEmptySquad('4-3-3');
  });
  const [captainId, setCaptainId] = useState<string | null>(() => {
    if (mode === 'DESIGN_REVIEW_DATA') {
      return FANTASY_MOCK_PLAYERS.find(p => p.isCaptain)?.id ?? null;
    }
    return null;
  });
  const [viceCaptainId, setViceCaptainId] = useState<string | null>(() => {
    if (mode === 'DESIGN_REVIEW_DATA') {
      return FANTASY_MOCK_PLAYERS.find(p => p.isViceCaptain)?.id ?? null;
    }
    return null;
  });
  const [poolOpen, setPoolOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ isStarter: boolean; idx: number } | null>(null);
  const [playerPool, setPlayerPool] = useState<ExpFantasyPlayer[]>(
    mode === 'DESIGN_REVIEW_DATA' ? FANTASY_MOCK_PLAYERS : [],
  );
  const [poolLoading, setPoolLoading] = useState(mode !== 'DESIGN_REVIEW_DATA');
  const [poolError, setPoolError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'DESIGN_REVIEW_DATA') {
      setPlayerPool(FANTASY_MOCK_PLAYERS);
      setPoolLoading(false);
      return;
    }

    let cancelled = false;
    setPoolLoading(true);
    getWorldCupSeason()
      .then((season) =>
        Promise.all([
          getPlayerPool(undefined, season.id),
          getPlayerPrices(season.id).catch(() => []),
        ]),
      )
      .then(([players, prices]) => {
        if (cancelled) return;
        if (players.length === 0) {
          // Do NOT fall back to top-performers: that data includes players from
          // eliminated teams (historical stats). The player pool endpoint is the
          // authoritative source — if it is empty the tournament may not have
          // started yet or all fixtures are concluded.
          setPoolError('No eligible players found. The player pool will appear once fixtures are scheduled.');
          return;
        }
        const priceMap = new Map(prices.map((p) => [p.playerId, p.currentPrice]));
        setPlayerPool(players.map((p) => toExpFantasyPlayer(p, { fantasyPrice: priceMap.get(p.id) })));
      })
      .catch(() => {
        if (!cancelled) setPoolError('Could not load the live World Cup player pool.');
      })
      .finally(() => {
        if (!cancelled) setPoolLoading(false);
      });

    return () => { cancelled = true; };
  }, [mode]);

  const allPlayers = [...squad.starters, ...squad.bench].filter(Boolean) as ExpFantasyPlayer[];
  const pickedIds = allPlayers.map(p => p.id);
  const totalValue = allPlayers.reduce((sum, p) => sum + p.fantasyPrice, 0);
  const budgetRemaining = Math.max(0, TOTAL_BUDGET - totalValue);
  const squadComplete = squad.starters.every(Boolean) && squad.bench.every(Boolean);

  // Validate team name
  function validateName(val: string): string {
    if (val.trim().length < 3) return 'Team name must be at least 3 characters';
    if (val.trim().length > 20) return 'Team name must be 20 characters or less';
    return '';
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value);
    setNameError(validateName(e.target.value));
  };

  const handleSlotClick = useCallback((player: ExpFantasyPlayer | null, pos: string, idx: number) => {
    if (player) {
      // Remove player
      setSquad(prev => {
        const starters = [...prev.starters];
        const benchArr = [...prev.bench];
        const si = starters.indexOf(player);
        const bi = benchArr.indexOf(player);
        if (si !== -1) starters[si] = null;
        if (bi !== -1) benchArr[bi] = null;
        return { starters, bench: benchArr };
      });
    } else {
      setSelectedSlot({ isStarter: true, idx });
      setPoolOpen(true);
    }
  }, []);

  const handleBenchClick = useCallback((player: ExpFantasyPlayer, benchIdx: number) => {
    setSquad(prev => {
      const bench = [...prev.bench];
      bench[benchIdx] = null;
      return { ...prev, bench };
    });
  }, []);

  const handlePlayerSelect = useCallback((player: ExpFantasyPlayer) => {
    if (!selectedSlot) return;
    const selectedPlayer: ExpFantasyPlayer = {
      ...player,
      squadRole: selectedSlot.isStarter ? 'STARTER' : 'SUBSTITUTE',
      benchSlot: selectedSlot.isStarter ? null : selectedSlot.idx + 1,
      isCaptain: false,
      isViceCaptain: false,
    };
    setSquad(prev => {
      const starters = [...prev.starters];
      const bench = [...prev.bench];
      if (selectedSlot.isStarter) {
        starters[selectedSlot.idx] = selectedPlayer;
      } else {
        bench[selectedSlot.idx] = selectedPlayer;
      }
      return { starters, bench };
    });
    setPoolOpen(false);
    setSelectedSlot(null);
  }, [selectedSlot]);

  async function handleSubmit() {
    if (mode === 'DESIGN_REVIEW_DATA') {
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 800));
      router.push('/fantasy/team');
      return;
    }
    // LIVE_BETA_DATA: call createTeam API
    setSubmitting(true);
    try {
      const { createTeam } = await import('@/lib/fantasy-api');
      await createTeam({
        name: teamName,
        players: allPlayers.map((p, i) => toFantasySlot({
          ...p,
          isCaptain: p.id === captainId,
          isViceCaptain: p.id === viceCaptainId,
        }, i)),
      });
      router.push('/fantasy/team');
    } catch {
      setSubmitting(false);
    }
  }

  const pitchPlayers = squad.starters.map(p => {
    if (!p) return null;
    return {
      ...p,
      isCaptain: p.id === captainId,
      isViceCaptain: p.id === viceCaptainId,
    };
  });

  return (
    <FantasyShell
      title={step < 4 ? `Step ${step}: ${STEP_LABELS[step - 1]}` : 'Review & Submit'}
      back={step > 1 ? { href: '#', label: 'Back' } : { href: '/fantasy', label: 'Back to Fantasy' }}
      hideFantasyTabs
    >
      <div className="pb-32">
        <OnboardingStep currentStep={step} totalSteps={4} stepLabels={STEP_LABELS} />

        <AnimatePresence mode="wait">
          {/* ── Step 1: Team name ── */}
          {step === 1 && (
            <StepWrapper key="step1" reduce={reduce}>
              <div className="px-4 py-6 space-y-4">
                <h2 className="text-display-md text-white">Name your team</h2>
                <p className="text-body-md text-exp-muted">Choose a name that represents you (3-20 characters).</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={handleNameChange}
                    placeholder="e.g. Golden Lions FC"
                    maxLength={20}
                    aria-label="Team name"
                    aria-describedby="name-hint"
                    className="w-full bg-exp-navy border border-exp-border-dk rounded-card-xs px-4 py-3 text-body-lg text-white placeholder:text-exp-muted focus:outline-none focus:border-exp-gold min-h-[44px]"
                  />
                  {nameError && <p className="text-body-sm text-exp-live">{nameError}</p>}
                  <p id="name-hint" className="text-label-sm text-exp-muted">
                    {teamName.length}/20 characters · Keep it clean and appropriate
                  </p>
                </div>

                {/* Coaching panel — fills empty space and communicates value */}
                <div className="mt-6 space-y-3">
                  <p className="text-label-md text-exp-muted uppercase tracking-wider">What you get</p>
                  {[
                    { icon: '⚽', title: 'Pick 15 players', body: 'Build your squad from the WC 2026 field' },
                    { icon: '🏆', title: 'Earn fantasy points', body: 'Score when your players perform on the pitch' },
                    { icon: '🤝', title: 'Compete with friends', body: 'Join private or public leagues and climb the table' },
                    { icon: '📊', title: 'Manage transfers', body: 'One free transfer per matchday — choose wisely' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 bg-exp-navy/60 border border-exp-border-dk rounded-card-sm px-4 py-3">
                      <span className="text-xl mt-0.5 flex-shrink-0" aria-hidden>{item.icon}</span>
                      <div>
                        <p className="text-label-md font-bold text-white">{item.title}</p>
                        <p className="text-body-sm text-exp-muted mt-0.5">{item.body}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-label-sm text-exp-muted text-center pt-1">
                    Points only · no real money · no financial value
                  </p>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 2: Formation ── */}
          {step === 2 && (
            <StepWrapper key="step2" reduce={reduce}>
              <div className="px-4 py-6">
                <h2 className="text-display-md text-white mb-1">Pick your formation</h2>
                <p className="text-body-md text-exp-muted mb-6">This determines how your players line up on the pitch.</p>
                <FormationSelector value={formation} onChange={f => { setFormation(f); setSquad(buildEmptySquad(f)); }} />

                {/* Formation preview */}
                <div className="mt-6">
                  <p className="text-label-md text-exp-muted mb-3">Formation preview</p>
                  <div className="rounded-card overflow-hidden h-48"
                    style={{ background: 'repeating-linear-gradient(180deg,#145c2e 0px,#145c2e 24px,#115228 24px,#115228 48px)' }}
                    aria-hidden="true"
                  >
                    <div className="flex flex-col justify-around h-full py-3">
                      {['GK', ...formation.split('-')].map((count, row) => (
                        <div key={row} className="flex justify-around">
                          {Array.from({ length: Number(count) || 1 }).map((_, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-exp-gold/70 border-2 border-exp-gold flex items-center justify-center text-[8px] text-exp-void font-bold">
                              {row === 0 ? 'GK' : row === 1 ? 'D' : row === 2 ? 'M' : 'F'}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 3: Build squad ── */}
          {step === 3 && (
            <StepWrapper key="step3" reduce={reduce}>
              <div className="space-y-4">
                {/* Budget */}
                <div className="px-4 pt-4">
                  <BudgetIndicator remaining={budgetRemaining} total={TOTAL_BUDGET} />
                </div>
                {/* Pitch */}
                <div className="px-4">
                  <FantasyPitchView
                    players={pitchPlayers}
                    formation={formation}
                    onPlayerClick={handleSlotClick}
                  />
                </div>
                {/* Bench */}
                <BenchPanel
                  players={squad.bench}
                  onPlayerClick={handleBenchClick}
                />
                <p className="px-4 text-label-sm text-exp-muted text-center">
                  Tap a slot to add a player · Max 3 from same team · {allPlayers.length}/15 selected
                </p>
                <p className="px-4 pb-2 text-label-sm text-exp-muted text-center">
                  Points only — no real money or financial value
                </p>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <StepWrapper key="step4" reduce={reduce}>
              <div className="px-4 py-4 space-y-4">
                <div className="bg-exp-navy border border-exp-border-dk rounded-card px-4 py-4">
                  <h3 className="text-display-sm text-white mb-3">Team Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-body-sm text-exp-muted">Team name</span><span className="text-body-sm text-white font-semibold">{teamName || '(unnamed)'}</span></div>
                    <div className="flex justify-between"><span className="text-body-sm text-exp-muted">Formation</span><span className="text-body-sm text-white font-mono">{formation}</span></div>
                    <div className="flex justify-between"><span className="text-body-sm text-exp-muted">Total value</span><span className="text-body-sm text-exp-gold font-mono">£{totalValue.toFixed(1)}m</span></div>
                    <div className="flex justify-between"><span className="text-body-sm text-exp-muted">Budget remaining</span><span className="text-body-sm text-exp-green font-mono">£{budgetRemaining.toFixed(1)}m</span></div>
                  </div>
                </div>

                {/* Captain selection */}
                <div className="bg-exp-navy border border-exp-border-dk rounded-card px-4 py-4">
                  <h3 className="text-display-sm text-white mb-3">Choose Captain</h3>
                  <div className="space-y-2">
                    {squad.starters.filter(Boolean).map(player => player && (
                      <div key={player.id} className="flex items-center justify-between py-2 border-b border-exp-border-dk last:border-0">
                        <span className="text-body-sm text-white">{player.name}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCaptainId(player.id)}
                            aria-pressed={captainId === player.id}
                            aria-label={`Set ${player.name} as captain`}
                            className={`min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center text-label-sm font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                              captainId === player.id ? 'bg-exp-gold text-exp-void border-exp-gold' : 'bg-transparent text-exp-muted border-exp-border-dk'
                            }`}
                          >
                            C
                          </button>
                          <button
                            type="button"
                            onClick={() => setViceCaptainId(player.id)}
                            aria-pressed={viceCaptainId === player.id}
                            aria-label={`Set ${player.name} as vice captain`}
                            className={`min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center text-label-sm font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                              viceCaptainId === player.id ? 'bg-exp-navy-2 text-exp-gold border-exp-gold' : 'bg-transparent text-exp-muted border-exp-border-dk'
                            }`}
                          >
                            VC
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-label-sm text-exp-muted text-center">
                  Points only — no real money or financial value
                </p>
              </div>
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>

      {/* Player pool bottom sheet (step 3) */}
      <FantasyBottomSheet
        open={poolOpen}
        onClose={() => { setPoolOpen(false); setSelectedSlot(null); }}
        snapHeight="three-quarters"
        title="Add Player"
      >
        {poolLoading ? (
          <div className="py-10 text-center text-exp-muted text-body-sm">Loading World Cup player pool...</div>
        ) : poolError ? (
          <div className="px-4 py-10 text-center text-exp-live text-body-sm">{poolError}</div>
        ) : (
          <PlayerPool
            players={playerPool}
            onSelect={handlePlayerSelect}
            pickedIds={pickedIds}
          />
        )}
      </FantasyBottomSheet>

      {/* Action bar */}
      <FantasyActionBar
        primary={{
          label: step === 4 ? 'Submit Team' : 'Next →',
          loading: submitting,
          disabled:
            (step === 1 && (validateName(teamName) !== '' || teamName.trim() === '')) ||
            (step === 3 && !squadComplete) ||
            (step === 4 && (!captainId || !viceCaptainId)),
          onClick: () => {
            if (step < 4) setStep((step + 1) as Step);
            else handleSubmit();
          },
        }}
        secondary={
          step > 1
            ? { label: '← Back', onClick: () => setStep((step - 1) as Step) }
            : undefined
        }
        hint={
          step === 3
            ? `${allPlayers.length}/15 players · £${budgetRemaining.toFixed(1)}m remaining`
            : step === 4
            ? 'Review your squad before submitting'
            : undefined
        }
      />
    </FantasyShell>
  );
}

function StepWrapper({ children, reduce }: { children: React.ReactNode; reduce: boolean | null }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
