'use client';

import { useState } from 'react';
import { createSystemActivity, createLiveMatchAlert, getAdminStats } from '@/lib/activity-client';

const TOKEN = 'dev-token';

interface AdminStats {
  total: number;
  active: number;
  hidden: number;
  archived: number;
  byType: Record<string, number>;
  byVisibility: Record<string, number>;
  reactionTotals: Record<string, number>;
}

export default function AdminActivitySystemPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [systemForm, setSystemForm] = useState({ type: 'SYSTEM', title: '', body: '', visibility: 'PUBLIC' });
  const [alertForm, setAlertForm] = useState({ fixtureId: '', title: '', body: '' });
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function loadStats() {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getAdminStats(TOKEN);
      setStats(data);
    } catch (e) {
      setStatsError(String(e));
    } finally {
      setStatsLoading(false);
    }
  }

  async function handlePostSystem(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createSystemActivity(TOKEN, {
        type: systemForm.type,
        title: systemForm.title,
        body: systemForm.body,
        visibility: systemForm.visibility,
      });
      setActionMsg('System activity posted');
      setSystemForm({ type: 'SYSTEM', title: '', body: '', visibility: 'PUBLIC' });
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  async function handlePostAlert(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createLiveMatchAlert(TOKEN, alertForm);
      setActionMsg('Live match alert posted');
      setAlertForm({ fixtureId: '', title: '', body: '' });
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Post System Activity</h1>
        <a href="/admin/activity" className="text-blue-600 text-sm underline">← All Activity</a>
      </div>

      {actionMsg && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          {actionMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* System activity form */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Post System Activity</h2>
          <form onSubmit={handlePostSystem} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={systemForm.type}
                onChange={e => setSystemForm(f => ({ ...f, type: e.target.value }))}
              >
                <option value="SYSTEM">SYSTEM</option>
                <option value="ADMIN_POST">ADMIN_POST</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={systemForm.title}
                onChange={e => setSystemForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Activity title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea
                required
                rows={3}
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={systemForm.body}
                onChange={e => setSystemForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Activity body"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={systemForm.visibility}
                onChange={e => setSystemForm(f => ({ ...f, visibility: e.target.value }))}
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="ADMIN_ONLY">ADMIN_ONLY</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700"
            >
              Post
            </button>
          </form>
        </div>

        {/* Live match alert form */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Post Live Match Alert</h2>
          <form onSubmit={handlePostAlert} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fixture ID</label>
              <input
                type="text"
                required
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={alertForm.fixtureId}
                onChange={e => setAlertForm(f => ({ ...f, fixtureId: e.target.value }))}
                placeholder="fixture-uuid"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Title</label>
              <input
                type="text"
                required
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={alertForm.title}
                onChange={e => setAlertForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. GOAL!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Body</label>
              <textarea
                required
                rows={3}
                className="w-full border rounded px-2 py-1.5 text-sm"
                value={alertForm.body}
                onChange={e => setAlertForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Alert description"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-600 text-white text-sm py-2 rounded hover:bg-orange-700"
            >
              Post Alert
            </button>
          </form>
        </div>
      </div>

      {/* Stats panel */}
      <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Activity Stats</h2>
          <button
            onClick={loadStats}
            disabled={statsLoading}
            className="text-sm text-blue-600 underline disabled:opacity-50"
          >
            {statsLoading ? 'Loading...' : 'Load Stats'}
          </button>
        </div>

        {statsError && <p className="text-red-600 text-sm">{statsError}</p>}

        {stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total', value: stats.total },
                { label: 'Active', value: stats.active },
                { label: 'Hidden', value: stats.hidden },
                { label: 'Archived', value: stats.archived },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">By Type</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(stats.byType).map(([k, v]) => (
                  <span key={k} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Reactions</h3>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(stats.reactionTotals).map(([k, v]) => (
                  <span key={k} className="text-xs bg-yellow-50 text-yellow-700 rounded px-2 py-0.5">
                    {k}: {v}
                  </span>
                ))}
                {Object.keys(stats.reactionTotals).length === 0 && (
                  <span className="text-xs text-gray-400">No reactions yet</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
