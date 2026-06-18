'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { type VisionFixture } from '@/lib/vision-data';
import { predictionShareUrl, predictionShareText, whatsappShareUrl } from '@/lib/share-utils';

interface PredictionScoreCardProps {
  fixture: VisionFixture;
  homeScore: number;
  awayScore: number;
  points?: number;
  onDismiss?: () => void;
  visible?: boolean;
}

export function PredictionScoreCard({
  fixture,
  homeScore,
  awayScore,
  points = 10,
  onDismiss,
  visible = true,
}: PredictionScoreCardProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-psl-midnight rounded-card p-6 text-white shadow-card-xl"
          role="region"
          aria-label="Prediction submitted"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Prediction locked</p>
              <p className="text-xs text-white/50 mt-0.5">Points only · no real money</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Dismiss"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Score display */}
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2"
                style={{ backgroundColor: fixture.homeClub.primaryColor }}
                aria-hidden
              />
              <div className="text-xs font-bold">{fixture.homeClub.shortName}</div>
            </div>
            <div className="text-center">
              <div className="text-stat-xl font-black text-psl-gold tabular-nums">
                {homeScore} - {awayScore}
              </div>
              <div className="text-[10px] text-white/40 mt-1">Your prediction</div>
            </div>
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2"
                style={{ backgroundColor: fixture.awayClub.primaryColor }}
                aria-hidden
              />
              <div className="text-xs font-bold">{fixture.awayClub.shortName}</div>
            </div>
          </div>

          {/* Points available */}
          <div className="mt-4 rounded-card-sm bg-white/8 p-3 flex items-center justify-between">
            <span className="text-xs text-white/60">Points available</span>
            <span className="text-sm font-black text-psl-gold">{points} pts</span>
          </div>

          {/* Share actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href={whatsappShareUrl(predictionShareText(fixture.homeClub.shortName, fixture.awayClub.shortName, homeScore, awayScore), predictionShareUrl(fixture.id))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-xs font-bold py-2.5 rounded-card-sm hover:bg-[#22c55e] motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] min-h-[44px]"
              aria-label="Share on WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.557 4.119 1.532 5.847L.057 23.543a.5.5 0 0 0 .603.676l5.856-1.535A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.903 0-3.68-.524-5.19-1.433l-.372-.22-3.8.997.995-3.696-.24-.381A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Share
            </a>
            <a
              href={`/vision/predict`}
              className="flex items-center justify-center gap-2 bg-psl-navy text-white text-xs font-bold py-2.5 rounded-card-sm hover:bg-psl-midnight motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy min-h-[44px]"
            >
              Next prediction
            </a>
          </div>

          <p className="mt-4 text-[10px] text-white/30 text-center leading-relaxed">
            Points only · No real money · No deposits · No withdrawals
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
