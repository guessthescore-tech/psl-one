'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResultPageInner() {
  const params = useSearchParams();
  const token = params.get('token');

  if (!token) {
    return (
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-white text-xl font-bold">No challenge token provided</p>
          <Link href="/predict" className="text-emerald-400 underline">
            Back to Predictions
          </Link>
        </div>
      </main>
    );
  }

  // Redirect to accept page with token — the accept page already handles SETTLED state
  if (typeof window !== 'undefined') {
    window.location.replace(`/predict/challenge/accept?token=${encodeURIComponent(token)}`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-white">Loading challenge result…</p>
        <p className="text-gray-400 text-sm">Points only · no real money</p>
      </div>
    </main>
  );
}

export default function ChallengeResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <p className="text-white">Loading…</p>
      </main>
    }>
      <ResultPageInner />
    </Suspense>
  );
}
