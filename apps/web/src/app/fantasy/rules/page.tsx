'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type FantasyRules, getFantasyRules } from '@/lib/fantasy-rules-client';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-3 py-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</h2>
      <div className="border rounded divide-y bg-white">{children}</div>
    </div>
  );
}

export default function FantasyRulesPage() {
  const [rules, setRules] = useState<FantasyRules | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFantasyRules()
      .then(setRules)
      .catch(e => setError((e as Error).message));
  }, []);

  if (error) {
    return (
      <main className="max-w-lg mx-auto p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </main>
    );
  }

  if (!rules) {
    return (
      <main className="max-w-lg mx-auto p-4">
        <p className="text-gray-400 text-sm">Loading rules…</p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fantasy Rules</h1>
        <Link href="/fantasy" className="text-sm text-blue-600 underline">Fantasy home</Link>
      </div>

      <Section title="Squad Structure">
        <Row label="Squad size" value={`${rules.squadSize} players`} />
        <Row label="Goalkeepers" value={String(rules.goalkeeperCount)} />
        <Row label="Defenders" value={String(rules.defenderCount)} />
        <Row label="Midfielders" value={String(rules.midfielderCount)} />
        <Row label="Forwards" value={String(rules.forwardCount)} />
      </Section>

      <Section title="Starting XI">
        <Row label="Starting XI size" value={`${rules.startingXiSize} players`} />
        <Row label="Bench size" value={`${rules.benchSize} players`} />
        <Row label="Min starting goalkeepers" value={String(rules.minStartingGoalkeepers)} />
        <Row label="Min starting defenders" value={String(rules.minStartingDefenders)} />
        <Row label="Min starting midfielders" value={String(rules.minStartingMidfielders)} />
        <Row label="Min starting forwards" value={String(rules.minStartingForwards)} />
      </Section>

      <Section title="Transfers">
        <Row label="Free transfers per gameweek" value={String(rules.freeTransfersPerGameweek)} />
        <Row label="Max saved free transfers" value={String(rules.maxSavedFreeTransfers)} />
        <Row label="Extra transfer cost" value={`${rules.extraTransferCost} pts`} />
        <Row label="Max transfers per gameweek" value={String(rules.maxTransfersPerGameweek)} />
      </Section>

      <Section title="Deadlines">
        <Row
          label="Deadline before first kickoff"
          value={`${rules.deadlineOffsetMinutes} minutes`}
        />
      </Section>

      <Section title="Chips">
        <Row label="Chips enabled" value={rules.chipsEnabled ? 'Yes' : 'No'} />
        <Row label="Wildcard" value={rules.wildcardEnabled ? `${rules.wildcardCount}× per season` : 'Disabled'} />
        <Row label="Free Hit" value={rules.freeHitEnabled ? `${rules.freeHitCount}× per season` : 'Disabled'} />
        <Row
          label="Free Hit consecutive block"
          value={rules.freeHitConsecutiveGameweekBlocked ? 'Yes' : 'No'}
        />
        <Row label="Bench Boost" value={rules.benchBoostEnabled ? `${rules.benchBoostCount}× per season` : 'Disabled'} />
        <Row label="Triple Captain" value={rules.tripleCaptainEnabled ? `${rules.tripleCaptainCount}× per season` : 'Disabled'} />
      </Section>

      <Section title="Season Structure">
        <Row label="Total gameweeks" value={String(rules.seasonGameweekCount)} />
        <Row label="Wildcard window split after GW" value={String(rules.halfwayGameweek)} />
      </Section>
    </main>
  );
}
