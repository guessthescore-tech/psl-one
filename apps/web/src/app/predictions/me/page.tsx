'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { predictionsClient, type Prediction } from '@/lib/predictions-client';

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  PENDING:  { label: 'Pending',  classes: 'bg-gray-100 text-gray-600' },
  LOCKED:   { label: 'Locked',   classes: 'bg-amber-100 text-amber-700' },
  WON:      { label: 'Won',      classes: 'bg-green-100 text-green-700' },
  LOST:     { label: 'Lost',     classes: 'bg-red-100 text-red-600' },
  SETTLED:  { label: 'Settled',  classes: 'bg-blue-100 text-blue-700' },
};

function PredictionCard({ pred }: { pred: Prediction }) {
  const badge = STATUS_BADGE[pred.status] ?? STATUS_BADGE['PENDING']!;
  const { fixture } = pred;
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-400">
          {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', {
            day: 'numeric', month: 'short',
          })}
        </p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.classes}`}>
          {badge.label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-semibold text-psl-navy text-sm">{fixture.homeTeam.shortName}</span>
        <div className="text-center">
          <span className="font-mono font-bold text-psl-navy">
            {pred.predictedHomeScore}–{pred.predictedAwayScore}
          </span>
          {(fixture.homeScore !== null && fixture.awayScore !== null) && (
            <p className="text-xs text-gray-400">
              Result: {fixture.homeScore}–{fixture.awayScore}
            </p>
          )}
        </div>
        <span className="font-semibold text-psl-navy text-sm">{fixture.awayTeam.shortName}</span>
      </div>
      {pred.pointsAwarded > 0 && (
        <p className="text-right text-xs font-semibold text-psl-gold">
          +{pred.pointsAwarded} pts
        </p>
      )}
    </div>
  );
}

export default function MyPredictionsPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictionsClient.getMyPredictions()
      .then(data => { setPredictions(data); setLoading(false); })
      .catch(() => router.push('/login'));
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsAwarded ?? 0), 0);

  return (
    <main className="min-h-screen bg-psl-navy p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/predictions" className="text-white/60 hover:text-white text-sm">Predictions</Link>
        <span className="text-white/30">/</span>
        <h1 className="text-xl font-bold text-white">My Predictions</h1>
      </div>

      {predictions.length > 0 && (
        <p className="text-white/70 text-sm mb-4">Total points: <span className="font-bold text-psl-gold">{totalPoints}</span></p>
      )}

      {predictions.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-white/60 text-sm mb-4">You have not made any predictions yet.</p>
          <Link href="/predictions/fixtures" className="text-psl-gold font-semibold text-sm">
            Make your first prediction →
          </Link>
        </div>
      ) : (
        <div className="space-y-3 max-w-lg">
          {predictions.map(p => <PredictionCard key={p.id} pred={p} />)}
        </div>
      )}
    </main>
  );
}
