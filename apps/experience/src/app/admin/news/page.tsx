'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';

const MOCK_ARTICLES = [
  { id: 'a1', title: 'Mbappe fires France into pole position', status: 'PUBLISHED', category: 'Match Report', publishedAt: '2026-06-19' },
  { id: 'a2', title: 'Brazil injury update ahead of Group C clash', status: 'DRAFT', category: 'Club News', publishedAt: null },
  { id: 'a3', title: 'Coach of the tournament: early contenders', status: 'DRAFT', category: 'Interview', publishedAt: null },
];

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'text-green-400 bg-green-400/10',
  DRAFT: 'text-yellow-400 bg-yellow-400/10',
  ARCHIVED: 'text-exp-muted bg-exp-muted/10',
};

export default function AdminNewsPage() {
  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between mb-8">
          <SectionHeader title="News Management" subtitle="Create and manage editorial content" dark />
          <button className="flex-shrink-0 text-label-sm px-4 py-2 bg-exp-gold text-black font-semibold rounded hover:bg-exp-gold/90 transition-colors duration-150 mt-1">
            + New Article
          </button>
        </div>

        {/* API info */}
        <div className="mb-6 p-3 bg-exp-ink border border-exp-border-dk rounded text-label-xs text-exp-muted/70">
          <strong className="text-exp-muted">API:</strong>{' '}
          <code>GET /admin/news</code> · <code>POST /admin/media</code> (mediaType: ARTICLE) ·{' '}
          <code>PATCH /admin/media/:id</code> · <code>POST /admin/media/:id/publish</code>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-6">
          {['All', 'Published', 'Draft', 'Archived'].map((f) => (
            <button
              key={f}
              className="text-label-xs px-3 py-1 border border-exp-border-dk rounded text-exp-muted hover:border-exp-gold/40 transition-colors"
            >
              {f}
            </button>
          ))}
        </div>

        {/* Articles table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b border-exp-border-dk text-label-xs text-exp-muted uppercase tracking-wider">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Published</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-exp-border-dk">
              {MOCK_ARTICLES.map((article) => (
                <tr key={article.id} className="hover:bg-exp-ink/50 transition-colors">
                  <td className="py-3 pr-4 text-white font-medium max-w-xs truncate">{article.title}</td>
                  <td className="py-3 pr-4 text-exp-muted">{article.category}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-label-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLES[article.status] ?? 'text-exp-muted'}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-exp-muted">{article.publishedAt ?? '—'}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="text-label-xs text-exp-gold hover:underline">Edit</button>
                      {article.status === 'DRAFT' && (
                        <button className="text-label-xs text-green-400 hover:underline">Publish</button>
                      )}
                      {article.status === 'PUBLISHED' && (
                        <button className="text-label-xs text-exp-muted hover:underline">Archive</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rights notice */}
        <div className="mt-8 p-3 bg-exp-ink border border-exp-border-dk rounded text-label-xs text-exp-muted/70">
          All media assets require CLEAR rights status before publication. Images and videos must be
          rights-cleared by editorial team. No copyrighted third-party content without licensing.
        </div>
      </div>
    </main>
  );
}
