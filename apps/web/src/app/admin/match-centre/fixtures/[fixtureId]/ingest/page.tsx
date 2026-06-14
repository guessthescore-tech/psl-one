'use client';

import { use, useState } from 'react';
import { adminIngestSandboxData } from '@/lib/admin-match-centre-client';

const ENTITY_TEMPLATES: Record<string, unknown> = {
  LINEUP: { players: [{ playerId: '', teamId: '', shirtNumber: 1, status: 'STARTING' }] },
  MATCH_EVENT: { minute: 1, eventType: 'GOAL', playerId: '', teamId: '' },
  PLAYER_RATING: { playerId: '', performanceRating: 7.5, minutesPlayed: 90, goals: 0, assists: 0 },
  STANDING: { seasonId: '', entries: [{ clubId: '', position: 1, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }] },
};

export default function FixtureIngestPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [entityType, setEntityType] = useState('MATCH_EVENT');
  const [rawData, setRawData] = useState(JSON.stringify(ENTITY_TEMPLATES['MATCH_EVENT'], null, 2));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  function changeType(t: string) {
    setEntityType(t);
    setRawData(JSON.stringify(ENTITY_TEMPLATES[t] ?? {}, null, 2));
  }

  async function submit() {
    let data: unknown;
    try {
      data = JSON.parse(rawData);
    } catch {
      setError('Invalid JSON');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await adminIngestSandboxData({
        fixtureId: fixtureId,
        entityType,
        data,
        ...(notes ? { notes } : {}),
        sourceType: 'SANDBOX_PROVIDER',
      }) as Record<string, unknown>;
      setResult(r);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Fixture Data Ingestion</h1>
      <p className="text-xs text-gray-400 mb-1">Fixture: {fixtureId}</p>
      <p className="text-xs text-gray-500 mb-5">
        Sandbox ingestion only. Official provider integration is INTEGRATION_READY — do NOT call real providers from this interface.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Entity Type</label>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(ENTITY_TEMPLATES).map(t => (
              <button
                key={t}
                onClick={() => changeType(t)}
                className={`text-xs px-3 py-1.5 rounded border ${entityType === t ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Data Payload (JSON)</label>
          <textarea
            className="border rounded px-3 py-2 text-sm w-full font-mono"
            rows={10}
            value={rawData}
            onChange={e => setRawData(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
          <input className="border rounded px-3 py-1.5 text-sm w-full" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Pre-season sandbox test" />
        </div>
        <button onClick={submit} disabled={submitting} className="bg-blue-600 text-white px-5 py-2 rounded text-sm disabled:opacity-50">
          {submitting ? 'Ingesting...' : 'Ingest Data'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      {result && (
        <div className="mt-4 border border-green-300 rounded-lg p-4 bg-green-50">
          <p className="text-green-700 font-semibold text-sm mb-1">Ingested</p>
          <p className="text-xs text-gray-600">Entity: {String(result['entityType'])} · ID: {String(result['entityId'])}</p>
          <p className="text-xs text-gray-600">Source: {String(result['sourceType'])} · Processed: {String(result['processed'])}</p>
        </div>
      )}
    </main>
  );
}
