'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

export type MatchEventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'OWN_GOAL' | 'PENALTY';

export interface MatchTimelineEvent {
  id: string;
  type: MatchEventType;
  minute: number;
  playerName: string;
  teamSide: 'HOME' | 'AWAY';
  detail?: string;
}

interface MatchTimelineProps {
  events: MatchTimelineEvent[];
  homeTeamName: string;
  awayTeamName: string;
}

function eventIcon(type: MatchEventType): string {
  switch (type) {
    case 'GOAL':        return '⚽';
    case 'YELLOW_CARD': return '🟨';
    case 'RED_CARD':    return '🟥';
    case 'SUBSTITUTION':return '🔄';
    case 'OWN_GOAL':    return '⚽';
    case 'PENALTY':     return '⚽';
    default:            return '•';
  }
}

function eventLabel(type: MatchEventType): string {
  switch (type) {
    case 'GOAL':        return 'Goal';
    case 'YELLOW_CARD': return 'Yellow card';
    case 'RED_CARD':    return 'Red card';
    case 'SUBSTITUTION':return 'Substitution';
    case 'OWN_GOAL':    return 'Own goal';
    case 'PENALTY':     return 'Penalty goal';
    default:            return 'Event';
  }
}

export function MatchTimeline({ events, homeTeamName, awayTeamName }: MatchTimelineProps) {
  const reduce = useReducedMotion();
  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  if (sorted.length === 0) {
    return (
      <div className="py-12 text-center text-exp-muted text-body-md">
        No events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative" role="list" aria-label="Match timeline">
      {/* Centre line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-px bg-exp-border-dk -translate-x-1/2"
        aria-hidden
      />

      <div className="space-y-3 py-4">
        {sorted.map((event, i) => {
          const isHome = event.teamSide === 'HOME';
          return (
            <motion.div
              key={event.id}
              role="listitem"
              initial={reduce ? false : { opacity: 0, x: isHome ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={clsx(
                'flex items-center gap-3',
                isHome ? 'flex-row' : 'flex-row-reverse',
              )}
              aria-label={`${event.minute}' ${eventLabel(event.type)}: ${event.playerName} (${isHome ? homeTeamName : awayTeamName})`}
            >
              {/* Team content */}
              <div
                className={clsx(
                  'flex-1 flex items-center gap-2',
                  isHome ? 'justify-end text-right' : 'justify-start text-left',
                )}
              >
                <div>
                  <div className="text-body-sm font-semibold text-white">{event.playerName}</div>
                  {event.detail && (
                    <div className="text-label-sm text-exp-muted">{event.detail}</div>
                  )}
                </div>
              </div>

              {/* Centre: minute + icon */}
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0 z-10">
                <span className="text-label-sm text-exp-muted tabular-nums">{event.minute}&apos;</span>
                <span
                  className="w-8 h-8 rounded-full bg-exp-ink border border-exp-border-dk flex items-center justify-center text-sm"
                  aria-hidden
                >
                  {eventIcon(event.type)}
                </span>
              </div>

              {/* Spacer for other side */}
              <div className="flex-1" aria-hidden />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mock events for DESIGN_REVIEW_DATA ────────────────────────────── */
export const MOCK_TIMELINE_EVENTS: MatchTimelineEvent[] = [
  { id: 'e1', type: 'GOAL',         minute: 12, playerName: 'Mbappe',    teamSide: 'HOME', detail: 'Header from corner' },
  { id: 'e2', type: 'YELLOW_CARD',  minute: 28, playerName: 'Kroos',     teamSide: 'AWAY', detail: 'Tactical foul' },
  { id: 'e3', type: 'GOAL',         minute: 34, playerName: 'Mbappe',    teamSide: 'HOME', detail: 'Low finish, left foot' },
  { id: 'e4', type: 'SUBSTITUTION', minute: 46, playerName: 'Müller → Sané', teamSide: 'AWAY' },
  { id: 'e5', type: 'GOAL',         minute: 51, playerName: 'Sané',      teamSide: 'AWAY', detail: 'Deflected strike' },
  { id: 'e6', type: 'YELLOW_CARD',  minute: 63, playerName: 'Camavinga', teamSide: 'HOME', detail: 'Late challenge' },
  { id: 'e7', type: 'SUBSTITUTION', minute: 70, playerName: 'Griezmann → Dembele', teamSide: 'HOME' },
];
