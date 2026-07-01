'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { LeagueCreateForm } from '@/components/fantasy/leagues/LeagueCreateForm';
import { InviteLeagueSheet } from '@/components/fantasy/leagues/InviteLeagueSheet';
import { getDataMode } from '@/lib/data';
import { getWorldCupSeason } from '@/lib/football-api';

export default function CreateLeaguePage() {
  const router = useRouter();
  const mode = getDataMode();

  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createdLeagueId, setCreatedLeagueId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('PSL247');
  const [leagueName, setLeagueName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(name: string, type: 'PRIVATE' | 'PUBLIC') {
    setLoading(true);
    setLeagueName(name);
    setError(null);

    if (mode === 'DESIGN_REVIEW_DATA') {
      await new Promise(r => setTimeout(r, 900));
      setInviteCode('PSL247');
      setCreatedLeagueId('league-new-mock');
      setLoading(false);
      setSheetOpen(true);
      return;
    }

    try {
      const { createLeague } = await import('@/lib/fantasy-api');
      const season = await getWorldCupSeason();
      const league = await createLeague({ name, seasonId: season.id });
      setInviteCode(league.inviteCode ?? 'N/A');
      setCreatedLeagueId(league.id);
      setLoading(false);
      setSheetOpen(true);
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Could not create league. Please try again.');
    }
  }

  function handleSheetClose() {
    setSheetOpen(false);
    if (createdLeagueId) {
      router.push(`/fantasy/leagues/${createdLeagueId}`);
    }
  }

  return (
    <FantasyShell
      title="Create a League"
      subtitle="Set up your own private or public league"
      back={{ href: '/fantasy/leagues', label: 'Back to Leagues' }}
    >
      <LeagueCreateForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="mx-4 mt-3 bg-exp-live/10 border border-exp-live/30 rounded-card-xs px-4 py-3">
          <p className="text-body-sm text-exp-live" role="alert">{error}</p>
        </div>
      )}

      <InviteLeagueSheet
        open={sheetOpen}
        onClose={handleSheetClose}
        leagueName={leagueName || 'Your League'}
        inviteCode={inviteCode}
      />
    </FantasyShell>
  );
}
