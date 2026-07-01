'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyLoadingState } from '@/components/fantasy/shared/FantasyLoadingState';
import { FantasyErrorState } from '@/components/fantasy/shared/FantasyErrorState';
import { AccountNav } from '@/components/account/AccountNav';
import { getDataMode } from '@/lib/data';
import { logout } from '@/lib/auth';
import { validateSession } from '@/lib/use-session';
import type { ProfileSummary } from '@/lib/profile-api';

const MOCK_PROFILE: ProfileSummary = {
  displayName: 'Design Review Fan',
  email: 'fan@psl.co.za',
  memberSince: '2026-01-01T00:00:00Z',
  fantasyTeamName: 'Galaxy FC',
  fantasyTotalPoints: 847,
  fantasyGlobalRank: 88403,
};

/**
 * /account — Account overview hub
 * Shows avatar, profile summary, fantasy stats, and AccountNav.
 * Requires authentication.
 */
export default function AccountPage() {
  const router = useRouter();
  const mode = getDataMode();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'DESIGN_REVIEW_DATA') {
      setProfile(MOCK_PROFILE);
      setLoading(false);
      setLoadError(null);
      return;
    }

    async function init() {
      const { status } = await validateSession();
      if (status === 'anonymous') {
        router.push('/sign-in?redirect=/account');
        return;
      }
      try {
        const m = await import('@/lib/profile-api');
        const data = await m.getProfileSummary();
        setProfile(data);
        setLoadError(null);
      } catch {
        setProfile(null);
        setLoadError('Could not load your account summary.');
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [mode, router]);

  async function handleSignOut() {
    await logout();
    router.push('/sign-in');
  }

  if (loading) {
    return (
      <FantasyShell title="Account" hideFantasyTabs>
        <FantasyLoadingState />
      </FantasyShell>
    );
  }

  if (!profile) {
    return (
      <FantasyShell title="Account" hideFantasyTabs>
        {loadError ? (
          <FantasyErrorState
            message={loadError}
            onRetry={() => {
              setLoading(true);
              setLoadError(null);
              void import('@/lib/profile-api')
                .then((m) => m.getProfileSummary())
                .then((data) => {
                  setProfile(data);
                  setLoading(false);
                })
                .catch(() => {
                  setProfile(null);
                  setLoadError('Could not load your account summary.');
                  setLoading(false);
                });
            }}
          />
        ) : (
          <div className="text-center py-12 flex flex-col items-center gap-4">
            <p className="text-body-md text-exp-muted">Sign in to access your account</p>
            <Link
              href="/sign-in?redirect=/account"
              className="px-6 py-3 bg-exp-green text-white font-bold rounded-card-sm min-h-[44px] flex items-center hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
            >
              Sign In
            </Link>
          </div>
        )}
      </FantasyShell>
    );
  }

  // Initials for avatar
  const initials = profile.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSinceFormatted = new Date(profile.memberSince).toLocaleDateString('en-ZA', {
    month: 'long', year: 'numeric',
  });

  return (
    <FantasyShell hideFantasyTabs>
      <div className="flex flex-col gap-6">
        {/* Profile hero */}
        <div className="flex items-center gap-4 p-5 bg-exp-navy border border-exp-border-dk rounded-card">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full bg-exp-navy-2 flex items-center justify-center flex-shrink-0"
            aria-hidden
          >
            <span className="text-exp-gold font-black text-xl">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-display-sm text-white truncate">{profile.displayName}</p>
            <p className="text-body-sm text-exp-muted truncate">{profile.email}</p>
            <p className="text-label-sm text-exp-muted mt-1">
              Member since {memberSinceFormatted}
            </p>
          </div>
        </div>

        {/* Fantasy summary */}
        {(profile.fantasyTeamName || profile.fantasyTotalPoints != null) && (
          <div className="p-5 bg-exp-ink border border-exp-border-dk rounded-card">
            <p className="text-label-lg text-exp-muted uppercase tracking-wider mb-3">
              Fantasy Summary
            </p>
            <div className="grid grid-cols-3 gap-4">
              {profile.fantasyTeamName && (
                <div>
                  <p className="text-label-sm text-exp-muted">Team</p>
                  <p className="text-body-md font-semibold text-white mt-0.5 truncate">
                    {profile.fantasyTeamName}
                  </p>
                </div>
              )}
              {profile.fantasyTotalPoints != null && (
                <div>
                  <p className="text-label-sm text-exp-muted">Total Pts</p>
                  <p className="text-display-sm text-exp-gold mt-0.5">
                    {profile.fantasyTotalPoints.toLocaleString()}
                  </p>
                </div>
              )}
              {profile.fantasyGlobalRank != null && (
                <div>
                  <p className="text-label-sm text-exp-muted">Rank</p>
                  <p className="text-display-sm text-white mt-0.5">
                    #{profile.fantasyGlobalRank.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-exp-navy border border-exp-border-dk rounded-card overflow-hidden">
          <div className="px-4 py-3 border-b border-exp-border-dk">
            <p className="text-label-lg text-exp-muted uppercase tracking-wider">Account Settings</p>
          </div>
          <div className="p-2">
            <AccountNav onSignOut={handleSignOut} />
          </div>
        </div>
      </div>
    </FantasyShell>
  );
}
