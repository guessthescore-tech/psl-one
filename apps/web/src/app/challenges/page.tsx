'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { challengesClient, type Challenge } from '@/lib/challenges-client';
import { footballClient, type Fixture } from '@/lib/football-client';
import { getToken } from '@/lib/auth-client';

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: 'Pending',   classes: 'bg-amber-100 text-amber-700' },
  ACCEPTED:  { label: 'Accepted',  classes: 'bg-blue-100 text-blue-700' },
  DECLINED:  { label: 'Declined',  classes: 'bg-gray-100 text-gray-500' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-400' },
  SETTLED:   { label: 'Settled',   classes: 'bg-green-100 text-green-700' },
};

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [scheduledFixtures, setScheduledFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fixtureId, setFixtureId] = useState('');
  const [opponentEmail, setOpponentEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    Promise.all([
      challengesClient.getMyChallenges(),
      footballClient.listFixtures(),
    ])
      .then(([chs, fixtures]) => {
        setChallenges(chs);
        const now = Date.now();
        setScheduledFixtures(
          fixtures.filter(f => f.status === 'SCHEDULED' && new Date(f.kickoffAt).getTime() > now),
        );
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function handleCreate() {
    setFormError(null);
    if (!fixtureId) { setFormError('Select a fixture'); return; }
    if (!opponentEmail) { setFormError('Enter opponent email'); return; }
    setSubmitting(true);
    try {
      const ch = await challengesClient.createChallenge(fixtureId, opponentEmail);
      setChallenges(prev => [ch, ...prev]);
      setShowForm(false);
      setFixtureId('');
      setOpponentEmail('');
    } catch (e: unknown) {
      setFormError((e as Error).message ?? 'Failed to create challenge');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Peer Challenges</h1>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="bg-psl-gold text-psl-navy text-sm font-semibold px-4 py-2 rounded-lg hover:bg-psl-gold/90 transition"
        >
          {showForm ? 'Cancel' : '+ New Challenge'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 mb-6 max-w-sm">
          <h2 className="font-semibold text-psl-navy mb-4">Challenge a Fan</h2>
          <label className="block text-xs text-gray-500 mb-1">Fixture</label>
          <select
            value={fixtureId}
            onChange={e => setFixtureId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-psl-navy"
          >
            <option value="">Select fixture…</option>
            {scheduledFixtures.map(f => (
              <option key={f.id} value={f.id}>
                {f.homeTeam.shortName} vs {f.awayTeam.shortName} —{' '}
                {new Date(f.kickoffAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
              </option>
            ))}
          </select>

          <label className="block text-xs text-gray-500 mb-1">Opponent email</label>
          <input
            type="email"
            value={opponentEmail}
            onChange={e => setOpponentEmail(e.target.value)}
            placeholder="fan@example.com"
            className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-psl-navy"
          />

          {formError && <p className="text-xs text-red-500 mb-3">{formError}</p>}
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="w-full bg-psl-navy text-white font-semibold py-2.5 rounded-lg hover:bg-psl-navy/90 disabled:opacity-50 transition"
          >
            {submitting ? 'Sending…' : 'Send Challenge'}
          </button>
        </div>
      )}

      {challenges.length === 0 ? (
        <p className="text-white/60 text-sm">No challenges yet.</p>
      ) : (
        <div className="space-y-3 max-w-lg">
          {challenges.map(ch => {
            const badge = STATUS_BADGE[ch.status] ?? STATUS_BADGE['PENDING']!;
            return (
              <Link
                key={ch.id}
                href={`/challenges/${ch.id}`}
                className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-psl-navy">
                    {ch.fixture.homeTeam.shortName} vs {ch.fixture.awayTeam.shortName}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.classes}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(ch.fixture.kickoffAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short',
                  })}
                </p>
                {ch.status === 'SETTLED' && ch.winnerUserId && (
                  <p className="text-xs text-green-600 mt-1 font-medium">Winner determined</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
