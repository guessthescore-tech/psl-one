'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';

const MOCK_VIDEOS = [
  { id: 'v1', title: 'France vs Germany — Match Highlights', status: 'PUBLISHED', category: 'MATCH_HIGHLIGHTS', duration: '5:42', rightsStatus: 'CLEAR' },
  { id: 'v2', title: 'Ronaldo Pre-Match Interview', status: 'DRAFT', category: 'INTERVIEW', duration: '3:21', rightsStatus: 'PENDING_REVIEW' },
  { id: 'v3', title: 'Brazil Training Session — Day 3', status: 'DRAFT', category: 'TRAINING', duration: '8:14', rightsStatus: 'PENDING_REVIEW' },
];

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'text-green-400 bg-green-400/10',
  DRAFT: 'text-yellow-400 bg-yellow-400/10',
  ARCHIVED: 'text-exp-muted bg-exp-muted/10',
};

const RIGHTS_STYLES: Record<string, string> = {
  CLEAR: 'text-green-400',
  PENDING_REVIEW: 'text-yellow-400',
  BLOCKED: 'text-red-400',
  EXPIRED: 'text-red-400',
};

export default function AdminVideosPage() {
  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between mb-8">
          <SectionHeader title="Video Management" subtitle="Manage VOD assets and streaming rights" dark />
          <button className="flex-shrink-0 text-label-sm px-4 py-2 bg-exp-gold text-black font-semibold rounded hover:bg-exp-gold/90 transition-colors duration-150 mt-1">
            + Add Video
          </button>
        </div>

        {/* API info */}
        <div className="mb-6 p-3 bg-exp-ink border border-exp-border-dk rounded text-label-xs text-exp-muted/70">
          <strong className="text-exp-muted">API:</strong>{' '}
          <code>GET /admin/videos</code> · <code>POST /admin/media</code> (mediaType: VIDEO) ·{' '}
          <code>PATCH /admin/media/:id</code> · <code>POST /admin/media/:id/publish</code> (requires CLEAR rights)
        </div>

        {/* Rights notice */}
        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-label-xs text-yellow-400">
          ⚠ Videos require CLEAR rights status before publication. Rights review required for all third-party footage.
          No copyrighted match footage without broadcasting rights agreement.
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-6">
          {['All', 'Published', 'Draft', 'Pending Review'].map((f) => (
            <button
              key={f}
              className="text-label-xs px-3 py-1 border border-exp-border-dk rounded text-exp-muted hover:border-exp-gold/40 transition-colors"
            >
              {f}
            </button>
          ))}
        </div>

        {/* Videos table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b border-exp-border-dk text-label-xs text-exp-muted uppercase tracking-wider">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Duration</th>
                <th className="pb-3 pr-4">Rights</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-exp-border-dk">
              {MOCK_VIDEOS.map((video) => (
                <tr key={video.id} className="hover:bg-exp-ink/50 transition-colors">
                  <td className="py-3 pr-4 text-white font-medium max-w-xs truncate">{video.title}</td>
                  <td className="py-3 pr-4 text-exp-muted text-label-xs">{video.category}</td>
                  <td className="py-3 pr-4 text-exp-muted">{video.duration}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-label-xs font-medium ${RIGHTS_STYLES[video.rightsStatus] ?? 'text-exp-muted'}`}>
                      {video.rightsStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-label-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLES[video.status] ?? 'text-exp-muted'}`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="text-label-xs text-exp-gold hover:underline">Edit</button>
                      {video.status === 'DRAFT' && video.rightsStatus === 'CLEAR' && (
                        <button className="text-label-xs text-green-400 hover:underline">Publish</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
