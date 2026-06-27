'use client';

import { getDataMode, isLiveDataMode } from '../../../lib/data';

export function DesignReviewBanner() {
  const mode = getDataMode();

  if (isLiveDataMode(mode)) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-50 w-full bg-purple-700 px-4 py-2 text-center text-label-lg font-semibold text-white tracking-wide"
      role="banner"
      aria-label="Design review mode"
    >
      Design review — WC 2026 mock data. Not live scores.
    </div>
  );
}
