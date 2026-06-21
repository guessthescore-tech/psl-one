'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, Star, Trophy, Users, Heart } from '@phosphor-icons/react/dist/ssr';
import { apiFetch } from '@/lib/api';
import { getDataMode } from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';

type OnboardingStatus = {
  isComplete: boolean;
  steps: {
    profileCreated: boolean;
    favouriteTeamSet: boolean;
    firstPredictionMade: boolean;
    firstChallengeCreated: boolean;
  };
  completedSteps: number;
  totalSteps: number;
};

const DESIGN_REVIEW_STATUS: OnboardingStatus = {
  isComplete: false,
  steps: {
    profileCreated: true,
    favouriteTeamSet: false,
    firstPredictionMade: true,
    firstChallengeCreated: false,
  },
  completedSteps: 2,
  totalSteps: 4,
};

const STEPS = [
  { key: 'profileCreated' as const, label: 'Complete your profile', href: '/account/profile', icon: Star },
  { key: 'favouriteTeamSet' as const, label: 'Choose your favourite team', href: '/account/favourite-team', icon: Heart },
  { key: 'firstPredictionMade' as const, label: 'Make your first prediction', href: '/predict', icon: Trophy },
  { key: 'firstChallengeCreated' as const, label: 'Challenge a fan', href: '/predict/challenge', icon: Users },
];

export default function OnboardingPage() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const isDesignReview = getDataMode() === 'DESIGN_REVIEW_DATA';

  useEffect(() => {
    if (isDesignReview || !isAuthenticated()) {
      setStatus(DESIGN_REVIEW_STATUS);
      setLoading(false);
      return;
    }
    apiFetch<OnboardingStatus>('/account/onboarding')
      .then(data => { setStatus(data); setLoading(false); })
      .catch(() => { setStatus(DESIGN_REVIEW_STATUS); setLoading(false); });
  }, [isDesignReview]);

  return (
    <main className="min-h-screen bg-exp-ink px-4 py-8 max-w-lg mx-auto">
      <h1 className="text-h2 font-black text-white mb-2">Get started</h1>
      <p className="text-body-md text-exp-muted mb-8">
        Complete these steps to unlock the full PSL One experience.
      </p>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-exp-navy-2/30 rounded-card-sm animate-pulse" />
          ))}
        </div>
      ) : status ? (
        <>
          <div className="mb-6 bg-exp-navy-2/30 rounded-card-sm px-4 py-3 flex items-center justify-between">
            <span className="text-body-sm text-exp-muted">{status.completedSteps} of {status.totalSteps} complete</span>
            <div className="flex gap-1">
              {Array.from({ length: status.totalSteps }).map((_, i) => (
                <div key={i} className={`w-6 h-1.5 rounded-full ${i < status.completedSteps ? 'bg-exp-gold' : 'bg-exp-border-dk'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {STEPS.map(step => {
              const done = status.steps[step.key];
              const Icon = step.icon;
              return (
                <Link
                  key={step.key}
                  href={done ? '#' : step.href}
                  aria-disabled={done}
                  className="flex items-center gap-4 p-4 rounded-card-sm border border-exp-border-dk bg-exp-navy-2/20 hover:border-exp-gold/40 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold"
                >
                  <Icon size={24} className={done ? 'text-exp-gold' : 'text-exp-muted'} aria-hidden />
                  <span className={`flex-1 text-body-md font-medium ${done ? 'line-through text-exp-muted' : 'text-white'}`}>
                    {step.label}
                  </span>
                  {done
                    ? <CheckCircle size={20} weight="fill" className="text-exp-gold" aria-label="Complete" />
                    : <Circle size={20} className="text-exp-muted" aria-label="Incomplete" />
                  }
                </Link>
              );
            })}
          </div>

          {status.isComplete && (
            <div role="status" className="mt-8 text-center p-6 bg-exp-gold/10 border border-exp-gold/30 rounded-card-sm">
              <p className="text-body-lg font-bold text-exp-gold">You&apos;re all set!</p>
              <p className="text-body-sm text-exp-muted mt-2">You&apos;ve completed the PSL One onboarding journey.</p>
              <Link href="/" className="mt-4 inline-block text-exp-gold underline hover:text-exp-gold-2">
                Back to home
              </Link>
            </div>
          )}

          {isDesignReview && (
            <p className="mt-6 text-label-sm text-exp-muted/60 text-center">Design review — showing sample progress</p>
          )}
        </>
      ) : null}
    </main>
  );
}
