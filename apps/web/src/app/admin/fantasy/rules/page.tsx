'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  type FantasyRules,
  adminGetRulesForSeason,
  adminCreateDefaultRules,
  adminUpdateRules,
  adminResetRules,
  adminValidateRules,
} from '@/lib/fantasy-rules-client';

type RulesForm = Partial<Record<keyof FantasyRules, string>>;

const FIELDS: { key: keyof FantasyRules; label: string; group: string; type: 'number' | 'boolean' }[] = [
  // Squad Rules
  { key: 'squadSize', label: 'Squad Size', group: 'Squad Rules', type: 'number' },
  { key: 'goalkeeperCount', label: 'Goalkeepers', group: 'Squad Rules', type: 'number' },
  { key: 'defenderCount', label: 'Defenders', group: 'Squad Rules', type: 'number' },
  { key: 'midfielderCount', label: 'Midfielders', group: 'Squad Rules', type: 'number' },
  { key: 'forwardCount', label: 'Forwards', group: 'Squad Rules', type: 'number' },
  // Starting XI Rules
  { key: 'startingXiSize', label: 'Starting XI Size', group: 'Starting XI Rules', type: 'number' },
  { key: 'benchSize', label: 'Bench Size', group: 'Starting XI Rules', type: 'number' },
  { key: 'minStartingGoalkeepers', label: 'Min Starting GKs', group: 'Starting XI Rules', type: 'number' },
  { key: 'maxStartingGoalkeepers', label: 'Max Starting GKs', group: 'Starting XI Rules', type: 'number' },
  { key: 'minStartingDefenders', label: 'Min Starting DEFs', group: 'Starting XI Rules', type: 'number' },
  { key: 'minStartingMidfielders', label: 'Min Starting MIDs', group: 'Starting XI Rules', type: 'number' },
  { key: 'minStartingForwards', label: 'Min Starting FWDs', group: 'Starting XI Rules', type: 'number' },
  // Transfer Rules
  { key: 'freeTransfersPerGameweek', label: 'Free Transfers / GW', group: 'Transfer Rules', type: 'number' },
  { key: 'maxSavedFreeTransfers', label: 'Max Saved Free Transfers', group: 'Transfer Rules', type: 'number' },
  { key: 'extraTransferCost', label: 'Extra Transfer Cost (pts)', group: 'Transfer Rules', type: 'number' },
  { key: 'maxTransfersPerGameweek', label: 'Max Transfers / GW', group: 'Transfer Rules', type: 'number' },
  // Deadline Rules
  { key: 'deadlineOffsetMinutes', label: 'Deadline Offset (minutes before KO)', group: 'Deadline Rules', type: 'number' },
  // Chip Rules
  { key: 'chipsEnabled', label: 'Chips Enabled', group: 'Chip Rules', type: 'boolean' },
  { key: 'wildcardEnabled', label: 'Wildcard Enabled', group: 'Chip Rules', type: 'boolean' },
  { key: 'wildcardCount', label: 'Wildcard Count / Season', group: 'Chip Rules', type: 'number' },
  { key: 'freeHitEnabled', label: 'Free Hit Enabled', group: 'Chip Rules', type: 'boolean' },
  { key: 'freeHitCount', label: 'Free Hit Count / Season', group: 'Chip Rules', type: 'number' },
  { key: 'freeHitConsecutiveGameweekBlocked', label: 'Block Consecutive Free Hit', group: 'Chip Rules', type: 'boolean' },
  { key: 'benchBoostEnabled', label: 'Bench Boost Enabled', group: 'Chip Rules', type: 'boolean' },
  { key: 'benchBoostCount', label: 'Bench Boost Count / Season', group: 'Chip Rules', type: 'number' },
  { key: 'tripleCaptainEnabled', label: 'Triple Captain Enabled', group: 'Chip Rules', type: 'boolean' },
  { key: 'tripleCaptainCount', label: 'Triple Captain Count / Season', group: 'Chip Rules', type: 'number' },
  // Season Structure
  { key: 'halfwayGameweek', label: 'Halfway Gameweek (for Wildcard window)', group: 'Season Structure', type: 'number' },
  { key: 'seasonGameweekCount', label: 'Total Gameweeks in Season', group: 'Season Structure', type: 'number' },
];

const GROUPS = Array.from(new Set(FIELDS.map(f => f.group)));

function rulesToForm(rules: FantasyRules): RulesForm {
  const form: RulesForm = {};
  for (const f of FIELDS) {
    form[f.key] = String(rules[f.key]);
  }
  return form;
}

function formToDto(form: RulesForm): Partial<FantasyRules> {
  const dto: Partial<FantasyRules> = {};
  for (const f of FIELDS) {
    const val = form[f.key];
    if (val === undefined || val === '') continue;
    if (f.type === 'number') {
      (dto as Record<string, unknown>)[f.key] = Number(val);
    } else {
      (dto as Record<string, unknown>)[f.key] = val === 'true';
    }
  }
  return dto;
}

export default function AdminFantasyRulesPage() {
  const [seasonId, setSeasonId] = useState('');
  const [form, setForm] = useState<RulesForm>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setValidationErrors([]);
    setResult(null);
    setError(null);
  }

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    setLoading(true);
    reset();
    try {
      const res = await fn();
      return res;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleLoad() {
    if (!seasonId.trim()) return;
    const rules = await run(() => adminGetRulesForSeason(seasonId.trim()));
    if (rules) {
      setForm(rulesToForm(rules));
      setLoaded(true);
      setResult('Loaded.');
    }
  }

  async function handleCreateDefaults() {
    if (!seasonId.trim()) return;
    const rules = await run(() => adminCreateDefaultRules(seasonId.trim()));
    if (rules) {
      setForm(rulesToForm(rules));
      setLoaded(true);
      setResult('Default rules created.');
    }
  }

  async function handleValidate() {
    const res = await run(() => adminValidateRules(formToDto(form)));
    if (res) {
      setValidationErrors(res.errors);
      setResult(res.isValid ? 'Rules are valid.' : `${res.errors.length} validation error(s).`);
    }
  }

  async function handleSave() {
    if (!seasonId.trim()) return;
    const rules = await run(() => adminUpdateRules(seasonId.trim(), formToDto(form)));
    if (rules) {
      setForm(rulesToForm(rules));
      setResult('Saved.');
    }
  }

  async function handleReset() {
    if (!seasonId.trim() || !confirm('Reset to EPL defaults?')) return;
    const rules = await run(() => adminResetRules(seasonId.trim()));
    if (rules) {
      setForm(rulesToForm(rules));
      setResult('Reset to defaults.');
    }
  }

  function handleFieldChange(key: keyof FantasyRules, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Fantasy Rules — Admin</h1>
        <Link href="/admin/fantasy" className="text-sm text-blue-600 underline">Admin fantasy</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          placeholder="Season UUID"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
        />
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          onClick={handleLoad}
          disabled={loading || !seasonId.trim()}
        >
          Load
        </button>
        <button
          className="px-3 py-2 bg-gray-600 text-white rounded text-sm disabled:opacity-50"
          onClick={handleCreateDefaults}
          disabled={loading || !seasonId.trim()}
        >
          Create Defaults
        </button>
      </div>

      {error && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>}
      {result && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{result}</div>}
      {validationErrors.length > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
          <p className="font-semibold mb-1">Validation errors:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {loaded && (
        <>
          {GROUPS.map(group => (
            <div key={group} className="mb-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{group}</h2>
              <div className="border rounded divide-y">
                {FIELDS.filter(f => f.group === group).map(field => (
                  <div key={field.key} className="flex items-center px-3 py-2 gap-3">
                    <label className="flex-1 text-sm text-gray-700">{field.label}</label>
                    {field.type === 'boolean' ? (
                      <select
                        className="border rounded px-2 py-1 text-sm w-24"
                        value={form[field.key] ?? 'true'}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        className="border rounded px-2 py-1 text-sm w-24 text-right"
                        value={form[field.key] ?? ''}
                        onChange={e => handleFieldChange(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm disabled:opacity-50"
              onClick={handleValidate}
              disabled={loading}
            >
              Validate
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              onClick={handleSave}
              disabled={loading || !seasonId.trim()}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50 ml-auto"
              onClick={handleReset}
              disabled={loading || !seasonId.trim()}
            >
              Reset to Defaults
            </button>
          </div>
        </>
      )}
    </main>
  );
}
