'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPredictionRules, createProvisionalPredictionRules, updatePredictionRules } from '@/lib/prediction-calibration-client';

interface RulesConfig {
  id: string;
  status: string;
  correctScorePoints: number;
  correctGoalDifferencePoints: number;
  correctResultPoints: number;
  participationPoints: number;
  challengeWinPoints: number;
  challengeDrawPoints: number;
  lockMinutesBeforeKickoff: number;
}

export default function PredictionRulesPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{ seasonName: string; config: RulesConfig | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const load = () =>
    getPredictionRules(seasonId)
      .then((d) => setData(d as typeof data))
      .catch((e: unknown) => setError(String(e)));

  useEffect(() => { load(); }, [seasonId]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createProvisionalPredictionRules(seasonId);
      await load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editField) return;
    setSaving(true);
    try {
      await updatePredictionRules(seasonId, { [editField]: parseInt(editValue, 10) });
      setEditField(null);
      await load();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  const cfg = data.config;

  const fields: [string, string, keyof RulesConfig][] = [
    ['correctScorePoints', 'Exact Score', 'correctScorePoints'],
    ['correctGoalDifferencePoints', 'Correct Goal Difference', 'correctGoalDifferencePoints'],
    ['correctResultPoints', 'Correct Result', 'correctResultPoints'],
    ['participationPoints', 'Participation', 'participationPoints'],
    ['challengeWinPoints', 'Challenge Win', 'challengeWinPoints'],
    ['challengeDrawPoints', 'Challenge Draw', 'challengeDrawPoints'],
    ['lockMinutesBeforeKickoff', 'Lock Minutes Before Kickoff', 'lockMinutesBeforeKickoff'],
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{data.seasonName} — Prediction Rules</h1>
      <p className="text-sm text-gray-500">
        PSL scoring: Exact Score=10, Goal Difference=5, Correct Result=3. Values are PROVISIONAL — match the existing scoring engine defaults.
      </p>

      {!cfg ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded space-y-4">
          <p className="text-yellow-700">No prediction rules configured for this season.</p>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Provisional Rules (PSL Defaults)'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {cfg.status}
            </span>
          </div>

          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-2 text-left">Field</th>
                <th className="border border-gray-200 p-2 text-center">Value</th>
                <th className="border border-gray-200 p-2 text-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {fields.map(([key, label, prop]) => (
                <tr key={key}>
                  <td className="border border-gray-200 p-2">{label}</td>
                  <td className="border border-gray-200 p-2 text-center">
                    {editField === key ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 border rounded p-1 text-center"
                      />
                    ) : (
                      cfg[prop] as number
                    )}
                  </td>
                  <td className="border border-gray-200 p-2 text-center">
                    {editField === key ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={handleSave} disabled={saving} className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">Save</button>
                        <button onClick={() => setEditField(null)} className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditField(key); setEditValue(String(cfg[prop])); }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => updatePredictionRules(seasonId, { status: 'ACTIVE' }).then(load)}
            disabled={cfg.status === 'ACTIVE' || saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Mark as ACTIVE
          </button>
        </div>
      )}
    </div>
  );
}
