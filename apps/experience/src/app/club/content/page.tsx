'use client';
/**
 * PSL_INACTIVE - do not activate PSL season
 * NO_REAL_MONEY
 */

import { PortalShell } from '../../../components/portal/PortalShell';
import { StatusBadge } from '../../../components/portal/PortalStatusBadges';
import { CLUB_NAV_ITEMS } from '../../../lib/portal-routes';

const MOCK_CONTENT = [
  { id: 'c1', title: 'Pre-Season Training Update', type: 'article', status: 'published', date: '2026-06-15' },
  { id: 'c2', title: 'Squad Announcement Video', type: 'video', status: 'draft', date: '2026-06-20' },
  { id: 'c3', title: 'Fan Day Event', type: 'article', status: 'draft', date: '2026-06-22' },
];

export default function ClubContentPage() {
  return (
    <PortalShell portalName="Club Portal" navItems={CLUB_NAV_ITEMS}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Content</h1>
            <p className="text-slate-400 text-sm">Manage articles, videos, and social posts for your club.</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors min-h-[44px]"
          >
            + New Content
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTENT.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-4 py-3 text-slate-200 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{c.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={c.status} variant={c.status === 'published' ? 'active' : 'warning'} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
