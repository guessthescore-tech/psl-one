'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Scan } from '@phosphor-icons/react';

interface ScanRecord {
  id: string;
  badge: string;
  points: number;
  scannedAt: string;
}

const MOCK_HISTORY: ScanRecord[] = [
  { id: '1', badge: 'Match Day Fan', points: 50, scannedAt: '2026-06-18T14:32:00Z' },
  { id: '2', badge: 'Half-Time Hero', points: 25, scannedAt: '2026-06-17T20:15:00Z' },
  { id: '3', badge: 'Season Ticket Holder', points: 100, scannedAt: '2026-06-10T11:00:00Z' },
];

/**
 * Badge scanner shell — purely visual, no real camera access.
 * Simulates a scan after 2s and shows a mock reward toast.
 * DESIGN_REVIEW_DATA only — NFC/QR integration is future work.
 */
export function BadgeScannerShell() {
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleScan() {
    setScanning(true);
    setToast(null);
    setTimeout(() => {
      setScanning(false);
      setToast('You earned 50 Fan Points!');
      setTimeout(() => setToast(null), 4000);
    }, 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Design review note */}
      <div
        role="note"
        className="text-body-sm text-exp-muted bg-exp-navy-2/20 border border-exp-border-dk rounded-card-sm px-4 py-3"
      >
        NFC and QR badge scanning requires hardware integration — coming in a future release.
      </div>

      {/* Camera viewport */}
      <div
        aria-label="Camera scanner viewport (design preview)"
        role="img"
        className="relative w-full aspect-square max-w-xs mx-auto bg-black rounded-card border border-exp-border-dk overflow-hidden flex items-center justify-center"
      >
        {/* Corner brackets in exp-gold */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
          <div
            key={pos}
            aria-hidden
            className={clsx(
              'absolute w-8 h-8 border-exp-gold',
              pos === 'top-left'     && 'top-4 left-4 border-t-2 border-l-2',
              pos === 'top-right'    && 'top-4 right-4 border-t-2 border-r-2',
              pos === 'bottom-left'  && 'bottom-4 left-4 border-b-2 border-l-2',
              pos === 'bottom-right' && 'bottom-4 right-4 border-b-2 border-r-2',
            )}
          />
        ))}

        {/* Scanning animation */}
        {scanning && (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-24 h-24 rounded-full border-2 border-exp-gold/40 border-t-exp-gold animate-spin" />
          </div>
        )}

        {/* Idle state */}
        {!scanning && (
          <Scan size={48} className="text-exp-gold/30" aria-hidden />
        )}
      </div>

      <p className="text-body-sm text-exp-muted text-center">
        Point your camera at a PSL badge
      </p>

      {/* Scan button */}
      <button
        type="button"
        onClick={handleScan}
        disabled={scanning}
        aria-busy={scanning}
        className={clsx(
          'w-full max-w-xs mx-auto bg-exp-gold text-exp-void font-bold text-body-md rounded-card-sm py-3 min-h-[44px] transition-opacity',
          'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          scanning ? 'opacity-60 cursor-not-allowed' : 'hover:bg-exp-gold-2',
        )}
      >
        {scanning ? 'Scanning…' : 'Scan a Badge'}
      </button>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="text-center text-body-md font-bold text-exp-gold bg-exp-gold/10 border border-exp-gold/30 rounded-card-sm px-4 py-3"
        >
          🏆 {toast}
        </div>
      )}

      {/* Scan history */}
      <section aria-labelledby="scan-history-heading">
        <h2 id="scan-history-heading" className="text-label-lg text-exp-muted uppercase tracking-wider mb-3">
          Past Scans
        </h2>
        <ul className="flex flex-col gap-2" role="list">
          {MOCK_HISTORY.map(record => (
            <li
              key={record.id}
              className="flex items-center justify-between px-4 py-3 bg-exp-ink border border-exp-border-dk rounded-card-sm"
            >
              <div>
                <p className="text-body-md font-medium text-white">{record.badge}</p>
                <p className="text-label-sm text-exp-muted">
                  {new Date(record.scannedAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              <span className="text-label-lg text-exp-gold font-bold">+{record.points} pts</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
