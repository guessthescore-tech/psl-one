'use client';

import { useEffect, useRef } from 'react';

interface ScoreBatWorldCupWidgetProps {
  /** Full iframe embed URL (constructed server-side — never expose raw token here). */
  embedUrl: string;
  title?: string;
  className?: string;
}

/**
 * ScoreBat World Cup highlights widget — iframe embed only.
 *
 * The embedUrl is constructed server-side from SCOREBAT_WIDGET_TOKEN.
 * No provider keys are passed as props or visible in the bundle.
 * The token appears in the iframe src URL as ScoreBat intends for widget attribution.
 *
 * Security: frame-ancestors CSP must allowlist scorebat.com and www.scorebat.com.
 * No betting/odds content. Highlights video only.
 */
export function ScoreBatWorldCupWidget({
  embedUrl,
  title = 'FIFA World Cup 2026 — Match Highlights',
  className = '',
}: ScoreBatWorldCupWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ensure the iframe loads fresh on mount
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }
  }, [embedUrl]);

  return (
    <div className={`w-full rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10 ${className}`}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Live Highlights</span>
        <span className="text-xs text-white/40">via ScoreBat</span>
      </div>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        width="100%"
        height="540"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="block border-0"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
