'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type Fixture } from '@/lib/football-client';
import { predictionsClient, type Prediction } from '@/lib/predictions-client';

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition"
        >
          −
        </button>
        <span className="w-8 text-center text-2xl font-bold text-psl-navy">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PredictFixturePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [existing, setExisting] = useState<Prediction | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      footballClient.getFixture(id),
      predictionsClient.getMyPredictionForFixture(id).catch(() => null),
    ])
      .then(([f, pred]) => {
        setFixture(f);
        if (pred) {
          setExisting(pred);
          setHomeScore(pred.predictedHomeScore);
          setAwayScore(pred.predictedAwayScore);
        }
        setLoading(false);
      })
      .catch(() => router.push('/login'));
  }, [id, router]);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      if (existing) {
        const updated = await predictionsClient.updatePrediction(existing.id, {
          predictedHomeScore: homeScore,
          predictedAwayScore: awayScore,
        });
        setExisting(updated);
        setSuccess('Prediction updated.');
      } else {
        const created = await predictionsClient.createPrediction(id, homeScore, awayScore);
        setExisting(created);
        setSuccess('Prediction submitted.');
      }
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to save prediction');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !fixture) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  const isOpen = fixture.status === 'SCHEDULED' && new Date(fixture.kickoffAt).getTime() > Date.now();

  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/predictions/fixtures" className="text-white/60 hover:text-white text-sm">Fixtures</Link>
        <span className="text-white/30">/</span>
        <span className="text-white text-sm">{fixture.homeTeam.shortName} vs {fixture.awayTeam.shortName}</span>
      </div>

      <div className="bg-white rounded-xl p-6 max-w-sm mx-auto">
        <p className="text-xs text-gray-400 text-center mb-4">
          {new Date(fixture.kickoffAt).toLocaleString('en-ZA', {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>

        <div className="flex items-center justify-center gap-8 mb-6">
          <ScoreInput label={fixture.homeTeam.shortName} value={homeScore} onChange={setHomeScore} />
          <span className="text-gray-300 text-2xl font-light">–</span>
          <ScoreInput label={fixture.awayTeam.shortName} value={awayScore} onChange={setAwayScore} />
        </div>

        {existing && (
          <p className="text-center text-xs text-psl-gold mb-3">
            Current prediction: {existing.predictedHomeScore}–{existing.predictedAwayScore}
          </p>
        )}

        {success && <p className="text-center text-xs text-green-600 mb-3">{success}</p>}
        {error && <p className="text-center text-xs text-red-500 mb-3">{error}</p>}

        {isOpen ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-psl-navy text-white font-semibold py-3 rounded-lg hover:bg-psl-navy/90 disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : existing ? 'Update Prediction' : 'Submit Prediction'}
          </button>
        ) : (
          <p className="text-center text-sm text-gray-400">Predictions are closed for this fixture.</p>
        )}
      </div>
    </main>
  );
}
