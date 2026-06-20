'use client';

import { useState, useEffect } from 'react';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyLoadingState } from '@/components/fantasy/shared/FantasyLoadingState';
import { FantasyErrorState } from '@/components/fantasy/shared/FantasyErrorState';
import { ProfileForm } from '@/components/account/ProfileForm';
import { getDataMode } from '@/lib/data';
import { isAuthenticated } from '@/lib/auth';
import type { FanProfile } from '@/lib/profile-api';
import { useRouter } from 'next/navigation';

const MOCK_PROFILE: FanProfile = {
  id: 'mock-fan-001',
  email: 'fan@psl.co.za',
  displayName: 'Design Review Fan',
  bio: 'Lifelong PSL supporter. Fantasy football obsessive.',
  phone: '+27 11 000 0000',
  memberSince: '2026-01-01T00:00:00Z',
};

/**
 * /account/profile — Edit personal details
 */
export default function AccountProfilePage() {
  const router = useRouter();
  const mode = getDataMode();
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  async function loadProfile() {
    setLoading(true);
    setLoadError(false);

    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(res => setTimeout(res, 400));
      setProfile(MOCK_PROFILE);
      setLoading(false);
      return;
    }

    if (!isAuthenticated()) {
      router.push('/sign-in?redirect=/account/profile');
      return;
    }

    try {
      const { getProfile } = await import('@/lib/profile-api');
      const data = await getProfile();
      setProfile(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(values: { displayName: string; bio: string; phone: string }) {
    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(res => setTimeout(res, 500));
      return;
    }
    const { updateProfile } = await import('@/lib/profile-api');
    await updateProfile({
      displayName: values.displayName,
      bio: values.bio || undefined,
      phone: values.phone || undefined,
    });
  }

  return (
    <FantasyShell
      title="Edit Profile"
      back={{ href: '/account', label: 'Account' }}
      hideFantasyTabs
    >
      {loading && <FantasyLoadingState />}

      {loadError && (
        <FantasyErrorState
          message="Failed to load your profile."
          onRetry={() => void loadProfile()}
        />
      )}

      {!loading && !loadError && profile && (
        <ProfileForm
          initialValues={{
            displayName: profile.displayName,
            bio: profile.bio ?? '',
            phone: profile.phone ?? '',
          }}
          onSave={handleSave}
        />
      )}
    </FantasyShell>
  );
}
