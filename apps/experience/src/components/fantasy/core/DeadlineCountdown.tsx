'use client';

import { useState, useEffect } from 'react';

interface DeadlineCountdownProps {
  deadlineAt: string;
  isLocked?: boolean;
}

function getTimeLeft(deadlineAt: string): { days: number; hours: number; minutes: number; seconds: number; past: boolean } {
  const now = Date.now();
  const diff = new Date(deadlineAt).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  const total = Math.floor(diff / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds, past: false };
}

export function DeadlineCountdown({ deadlineAt, isLocked = false }: DeadlineCountdownProps) {
  const [time, setTime] = useState(() => getTimeLeft(deadlineAt));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(deadlineAt)), 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);

  const isApproaching = !time.past && time.days === 0 && time.hours < 2;

  const badgeClass = isLocked || time.past
    ? 'bg-exp-live/20 text-exp-live border-exp-live/40'
    : isApproaching
    ? 'bg-amber-500/20 text-amber-400 border-amber-400/40'
    : 'bg-exp-green/20 text-exp-green border-exp-green/40';

  const label = isLocked || time.past ? 'Locked' : isApproaching ? 'Closing Soon' : 'Open';

  return (
    <div className="flex items-center gap-3 bg-exp-navy rounded-card-xs px-3 py-2.5 border border-exp-border-dk">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-label-sm border ${badgeClass}`}>
        {isLocked || time.past ? '🔒' : '⏱'} {label}
      </span>
      {!isLocked && !time.past && (
        <div className="flex items-center gap-1.5 font-mono text-label-md">
          {time.days > 0 && (
            <><span className="text-white">{time.days}</span><span className="text-exp-muted">d</span></>
          )}
          <span className="text-white">{String(time.hours).padStart(2, '0')}</span>
          <span className="text-exp-muted">h</span>
          <span className="text-white">{String(time.minutes).padStart(2, '0')}</span>
          <span className="text-exp-muted">m</span>
          <span className="text-white">{String(time.seconds).padStart(2, '0')}</span>
          <span className="text-exp-muted">s</span>
        </div>
      )}
      {(isLocked || time.past) && (
        <span className="text-label-sm text-exp-muted">Transfers disabled until next gameweek</span>
      )}
    </div>
  );
}
