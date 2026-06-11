'use client';

import Link from 'next/link';

export default function ImportPreviewPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Import Preview</h1>
      <p className="text-gray-600 mb-6">
        Validate and preview an import payload before committing it. Use the{' '}
        <Link href="/admin/imports/manual" className="text-blue-600 hover:underline">Manual Import</Link>{' '}
        page to paste, validate, preview, and commit in one flow.
      </p>
      <Link
        href="/admin/imports/manual"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        Go to Manual Import
      </Link>
    </main>
  );
}
