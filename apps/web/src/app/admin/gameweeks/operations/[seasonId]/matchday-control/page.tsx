'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMatchdayControl, validateSeasonGameweeks } from '@/lib/gameweek-operations-client';
import Link from 'next/link';

interface Fixtures {
  total: number;
  withGameweek: number;
  withoutGameweek: number;
  published: number;
  unpublished: number;
}

interface CurrentGameweek {
  gameweekId: string;
  name: string;
  round: number;
  status: string;
  operationalStatus: string;
}

interface MatchdayControlData {
  seasonId: string;
  seasonName: string;
  seasonStatus: string;
  isActive: boolean;
  overallReadiness: string;
  currentGameweek: CurrentGameweek | null;
  totalGameweeks: number;
  gameweeksByStatus: Record<string, number>;
  fixtures: Fixtures;
  fantasyConfigured: boolean;
  predictionConfigured: boolean;
  fanVisibilitySafe: boolean;
  fantasyEntrySafe: boolean;
  predictionEntrySafe: boolean;
  peerChallengesSafe: boolean;
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  navigationLinks: {
    fixtureImport: string;
    fantasyCalibration: string;
    predictionCalibration: string;
    seasonSwitching: string;
  };
  safetyNote: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  seasonName: string;
}

export default function MatchdayControlPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<MatchdayControlData | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    getMatchdayControl(seasonId)
      .then((d) => setData(d as MatchdayControlData))
      .catch((e: unknown) => setError(String(e)));
  }, [seasonId]);

  async function handleValidate() {
    setValidating(true);
    setValidationResult(null);
    try {
      const result = (await validateSeasonGameweeks(seasonId)) as ValidationResult;
      setValidationResult(result);
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setValidating(false);
    }
  }

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const readinessColour = data.overallReadiness === 'READY'
    ? 'bg-green-100 text-green-800 border-green-200'
    : data.overallReadiness === 'BLOCKED'
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-yellow-100 text-yellow-800 border-yellow-200';

  const statusEntries = Object.entries(data.gameweeksByStatus ?? {}).filter(([, v]) => v > 0);
  const navLinks = data.navigationLinks ?? {};
  const fx = data.fixtures ?? { total: 0, withGameweek: 0, withoutGameweek: 0, published: 0, unpublished: 0 };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            <Link href="/admin/gameweeks/operations" className="hover:underline">Operations</Link>{' '}
            / <Link href={`/admin/gameweeks/operations/${seasonId}`} className="hover:underline">{data.seasonName}</Link>{' '}
            / Matchday Control
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Matchday Control Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.seasonName} · {data.seasonStatus}
            {data.isActive && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>}
          </p>
        </div>
        <button
          onClick={handleValidate}
          disabled={validating}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {validating ? 'Validating…' : 'Validate Gameweeks'}
        </button>
      </div>

      {/* Safety note */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
        Operational readiness only — no payments, betting, or live-provider integration.
      </div>

      {/* Overall readiness */}
      <div className={`border rounded-lg p-4 ${readinessColour}`}>
        <p className="text-sm font-semibold">Overall Readiness: {data.overallReadiness}</p>
        <p className="text-xs mt-0.5">{data.totalGameweeks} gameweek(s)</p>
      </div>

      {/* Validation result */}
      {validationResult && (
        <div className={`border rounded-lg p-4 ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-semibold ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
            {validationResult.isValid ? 'Validation passed — gameweeks are consistent.' : 'Validation failed — see errors below.'}
          </p>
          {(validationResult.errors ?? []).length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {validationResult.errors.map((err, i) => (
                <li key={i} className="text-sm text-red-700">{err}</li>
              ))}
            </ul>
          )}
          {(validationResult.warnings ?? []).length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1">
              {validationResult.warnings.map((w, i) => (
                <li key={i} className="text-sm text-yellow-700">{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Blockers */}
      {(data.blockers ?? []).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Blockers</p>
          <ul className="list-disc list-inside space-y-1">
            {data.blockers.map((b, i) => <li key={i} className="text-sm text-red-700">{b}</li>)}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {(data.warnings ?? []).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {data.warnings.map((w, i) => <li key={i} className="text-sm text-yellow-700">{w}</li>)}
          </ul>
        </div>
      )}

      {/* Current gameweek */}
      {data.currentGameweek && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Current / Next Gameweek</p>
          <p className="text-sm font-semibold text-blue-900">
            {data.currentGameweek.name} — Round {data.currentGameweek.round}
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            {data.currentGameweek.status} · {data.currentGameweek.operationalStatus}
          </p>
        </div>
      )}

      {/* Fixture counts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Fixture Status</h2>
        <div className="grid grid-cols-5 gap-3">
          <StatCard label="Total" value={fx.total} />
          <StatCard label="In Gameweek" value={fx.withGameweek} colour="text-green-700" />
          <StatCard label="Unassigned" value={fx.withoutGameweek} colour={fx.withoutGameweek > 0 ? 'text-red-600' : 'text-gray-400'} />
          <StatCard label="Published" value={fx.published} colour="text-green-700" />
          <StatCard label="Unpublished" value={fx.unpublished} colour={fx.unpublished > 0 ? 'text-orange-600' : 'text-gray-400'} />
        </div>
      </div>

      {/* Entry safety flags */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Fan Entry Safety</h2>
        <div className="grid grid-cols-4 gap-4">
          <SafetyCard label="Fan Fixture Visibility" safe={data.fanVisibilitySafe} />
          <SafetyCard label="Fantasy Entry" safe={data.fantasyEntrySafe} />
          <SafetyCard label="Prediction Entry" safe={data.predictionEntrySafe} />
          <SafetyCard label="Peer Challenges" safe={data.peerChallengesSafe} />
        </div>
      </div>

      {/* Gameweeks by status */}
      {statusEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Gameweeks by Operational Status</h2>
          <div className="grid grid-cols-4 gap-3">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="border border-gray-200 rounded-lg p-3 bg-white text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{status}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next actions */}
      {(data.nextActions ?? []).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recommended Next Actions</h2>
          <ul className="space-y-2">
            {data.nextActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-blue-500 shrink-0">→</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Related Areas</h2>
        <div className="grid grid-cols-2 gap-3">
          {navLinks.fixtureImport && (
            <Link href={navLinks.fixtureImport} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 text-sm font-medium text-gray-800">
              Fixture Import
            </Link>
          )}
          {navLinks.fantasyCalibration && (
            <Link href={navLinks.fantasyCalibration} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 text-sm font-medium text-gray-800">
              Fantasy Calibration
            </Link>
          )}
          {navLinks.predictionCalibration && (
            <Link href={navLinks.predictionCalibration} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 text-sm font-medium text-gray-800">
              Prediction Calibration
            </Link>
          )}
          {navLinks.seasonSwitching && (
            <Link href={navLinks.seasonSwitching} className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 text-sm font-medium text-gray-800">
              Season Switching
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SafetyCard({ label, safe }: { label: string; safe: boolean }) {
  return (
    <div className={`border rounded-lg p-4 ${safe ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${safe ? 'text-green-800' : 'text-red-700'}`}>
        {safe ? 'Safe' : 'Not Safe'}
      </p>
    </div>
  );
}

function StatCard({ label, value, colour = 'text-gray-900' }: { label: string; value: number; colour?: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-xl font-bold ${colour}`}>{value}</p>
    </div>
  );
}
