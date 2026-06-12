'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaReleaseNotes } from '@/lib/beta-feedback-client';

interface ReleaseNote {
  story: string;
  commit: string;
  title: string;
  summary: string;
  keyDeliverables: string[];
  safetyBoundaries: string[];
}

interface NotesData {
  notes: ReleaseNote[];
  currentVersion: string;
  note: string;
}

export default function BetaReleaseNotesPage() {
  const [data, setData] = useState<NotesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBetaReleaseNotes()
      .then((d) => setData(d as NotesData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/operations" className="hover:text-gray-600">Operations</Link>
        <span>/</span>
        <Link href="/admin/beta-feedback" className="hover:text-gray-600">Beta Feedback</Link>
        <span>/</span>
        <span className="text-gray-600">Release Notes</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Release Notes</h1>
        <Link href="/admin/beta-feedback" className="text-sm text-blue-600 underline">← Beta Feedback</Link>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold text-blue-800">{data.currentVersion}</p>
            {data.note && <p className="text-xs text-blue-600 mt-0.5">{data.note}</p>}
          </div>

          {data.notes.slice().reverse().map((note) => (
            <div key={note.story} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded">{note.story}</span>
                {note.commit !== 'pending' && (
                  <span className="text-xs font-mono text-gray-400">{note.commit}</span>
                )}
                {note.commit === 'pending' && (
                  <span className="text-xs text-amber-600">pending commit</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{note.title}</p>
              <p className="text-xs text-gray-600 mb-3">{note.summary}</p>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Key Deliverables</p>
                  <ul className="space-y-0.5">
                    {note.keyDeliverables.map((d, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                        <span className="text-gray-300 flex-shrink-0">·</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-medium text-green-600 mb-1">Safety Boundaries</p>
                  {note.safetyBoundaries.map((s, i) => (
                    <p key={i} className="text-xs text-green-700 italic">{s}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
