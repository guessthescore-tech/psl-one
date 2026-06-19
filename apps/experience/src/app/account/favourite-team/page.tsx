'use client';

import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FavouriteTeamSelector } from '@/components/account/FavouriteTeamSelector';
import { getDataMode, WC_CLUBS } from '@/lib/data';

/**
 * /account/favourite-team — Choose favourite team
 * Shows grid of WC_CLUBS to select from.
 */
export default function FavouriteTeamPage() {
  const mode = getDataMode();

  async function handleSave(teamId: string) {
    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(res => setTimeout(res, 500));
      return;
    }
    const { updateProfile } = await import('@/lib/profile-api');
    await updateProfile({ preferredTeamId: teamId });
  }

  return (
    <FantasyShell
      title="Favourite Team"
      subtitle="Choose the team you support"
      back={{ href: '/account', label: 'Account' }}
    >
      <FavouriteTeamSelector
        clubs={WC_CLUBS}
        onSave={handleSave}
      />
    </FantasyShell>
  );
}
