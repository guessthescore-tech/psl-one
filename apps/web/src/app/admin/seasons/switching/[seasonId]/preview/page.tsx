'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { getSwitchPreview, activateSeason } from '@/lib/season-context-client';

interface SeasonRef {
  id: string;
  name: string;
  status: string;
}

interface ReadinessCheck {
  domain: string;
  label: string;
  severity: string;
  passed: boolean;
  detail: string;
}

interface ReadinessSummary {
  activationStatus: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  blockers: ReadinessCheck[];
  warnings: ReadinessCheck[];
}

interface PreviewData {
  seasonId: string;
  seasonName: string;
  fromSeason: SeasonRef | null;
  toSeason: SeasonRef;
  willComplete: string[];
  willActivate: string[];
  readiness: ReadinessSummary;
}

export default function SeasonPreviewPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [acknowledge, setAcknowledge] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    getSwitchPreview(seasonId, 'dev-token')
      .then((d: unknown) => setData(d as PreviewData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  const handleActivate = async () => {
    if (!data) return;
    setActivating(true);
    setActivationError(null);
    try {
      const body: { acknowledgeWarnings?: boolean; activationNote?: string } = {
        acknowledgeWarnings: acknowledge,
      };
      if (note) body.activationNote = note;
      await activateSeason(seasonId, body, 'dev-token');
      setActivated(true);
    } catch (e: unknown) {
      setActivationError(String(e));
    } finally {
      setActivating(false);
    }
  };

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading preview…</div>;

  const isBlocked = data.readiness.activationStatus === 'BLOCKED';
  const hasWarnings = data.readiness.activationStatus === 'READY_WITH_WARNINGS';
  const canActivate = !isBlocked && (!hasWarnings || acknowledge);

  if (activated) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-300 rounded-lg p-6 text-center">
          <p className="text-xl font-bold text-green-800">{data.seasonName} is now ACTIVE</p>
          <p className="text-sm text-green-600 mt-2">
            The PSL season is now the default fan experience. World Cup data is preserved historically.
          </p>
          <a href="/admin/seasons/context" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            View season context →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activation Preview</h1>
        <p className="text-sm text-gray-500 mt-1">{data.seasonName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-xs text-gray-500 uppercase font-semibold">Completing</p>
          {data.fromSeason ? (
            <p className="font-medium text-gray-800 mt-1">{data.fromSeason.name}</p>
          ) : (
            <p className="text-gray-400 text-sm mt-1">No current active season</p>
          )}
          {data.willComplete.map((w, i) => (
            <p key={i} className="text-xs text-gray-500 mt-1">{w}</p>
          ))}
        </div>
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <p className="text-xs text-blue-600 uppercase font-semibold">Activating</p>
          <p className="font-medium text-blue-900 mt-1">{data.toSeason.name}</p>
          {data.willActivate.map((w, i) => (
            <p key={i} className="text-xs text-blue-600 mt-1">{w}</p>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Cross-Domain Impact</h3>
        <ul className="space-y-1 text-gray-600">
          <li>• Default fan fixture feed → switches to {data.toSeason.name}</li>
          <li>• Fantasy team creation → unlocked for {data.toSeason.name}</li>
          <li>• Predictions → open for {data.toSeason.name} fixtures once published</li>
          <li>• Club pages → show {data.toSeason.name} squads and fixtures</li>
          {data.fromSeason && (
            <li className="text-green-700">
              • {data.fromSeason.name} data → preserved, accessible by season slug
            </li>
          )}
        </ul>
      </div>

      {isBlocked && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="font-semibold text-red-800 mb-2">Activation Blocked</p>
          {data.readiness.blockers.map((b, i) => (
            <p key={i} className="text-sm text-red-700">• {b.label}: {b.detail}</p>
          ))}
        </div>
      )}

      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="font-semibold text-yellow-800 mb-2">Warnings ({data.readiness.warnings.length})</p>
          {data.readiness.warnings.map((w, i) => (
            <p key={i} className="text-sm text-yellow-700">• {w.label}: {w.detail}</p>
          ))}
          <label className="flex items-center gap-2 mt-3 text-sm text-yellow-800 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledge}
              onChange={(e) => setAcknowledge(e.target.checked)}
              className="rounded"
            />
            I acknowledge the warnings and wish to proceed
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Activation note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. PSL 2026/27 season launch"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {activationError && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {activationError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleActivate}
          disabled={!canActivate || activating}
          className={`px-6 py-2 rounded text-sm font-semibold ${
            canActivate && !activating
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {activating ? 'Activating…' : `Activate ${data.toSeason.name}`}
        </button>
        <a
          href={`/admin/seasons/switching/${seasonId}/readiness`}
          className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
        >
          View readiness
        </a>
      </div>
    </div>
  );
}
