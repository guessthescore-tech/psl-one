'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { LeagueCreateForm } from '@/components/fantasy/leagues/LeagueCreateForm';
import { InviteLeagueSheet } from '@/components/fantasy/leagues/InviteLeagueSheet';
import { getDataMode } from '@/lib/data';

export default function CreateLeaguePage() {
  const router = useRouter();
  const mode = getDataMode();

  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createdLeagueId, setCreatedLeagueId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('PSL247');
  const [leagueName, setLeagueName] = useState('');

  async function handleSubmit(name: string, type: 'PRIVATE' | 'PUBLIC') {
    setLoading(true);
    setLeagueName(name);

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
      const league = await createLeague(name, type);
      setInviteCode(league.inviteCode ?? 'N/A');
      setCreatedLeagueId(league.id);
      setLoading(false);
      setSheetOpen(true);
    } catch {
      setLoading(false);
      // TODO: error toast
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

      <InviteLeagueSheet
        open={sheetOpen}
        onClose={handleSheetClose}
        leagueName={leagueName || 'Your League'}
        inviteCode={inviteCode}
      />
    </FantasyShell>
  );
}
