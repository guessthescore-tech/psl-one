'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import type { ExpClub } from '@/lib/data';

interface FavouriteTeamSelectorProps {
  clubs: ExpClub[];
  initialTeamId?: string;
  onSave: (teamId: string) => Promise<void>;
}

/**
 * Grid of WC team badges for selecting a favourite team.
 * Highlights selected team in exp-gold border.
 */
export function FavouriteTeamSelector({ clubs, initialTeamId, onSave }: FavouriteTeamSelectorProps) {
  const [selected, setSelected] = useState<string | null>(initialTeamId ?? null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(selected);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        role="radiogroup"
        aria-label="Choose your favourite team"
      >
        {clubs.map(club => {
          const isSelected = selected === club.id;
          return (
            <button
              key={club.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(club.id)}
              className={clsx(
                'relative flex flex-col items-center gap-2 p-4 rounded-card-sm border transition-all duration-150 min-h-[44px]',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                isSelected
                  ? 'border-exp-gold bg-exp-gold/10 shadow-glow-gold'
                  : 'border-exp-border-dk bg-exp-ink hover:border-white/20 hover:bg-white/5',
              )}
            >
              {/* Badge placeholder */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${club.primaryColor}, ${club.secondaryColor})`,
                  color: club.textColor,
                }}
                aria-hidden
              >
                {club.abbr}
              </div>

              <span className="text-label-md text-white text-center leading-tight">
                {club.shortName}
              </span>

              {isSelected && (
                <CheckCircle
                  size={18}
                  weight="fill"
                  className="absolute top-2 right-2 text-exp-gold"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="text-body-sm text-exp-live bg-exp-live/10 rounded-card-xs px-3 py-2">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div role="status" className="text-body-sm text-exp-success bg-exp-success/10 rounded-card-xs px-3 py-2">
          Team preference saved
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!selected || saving}
        aria-busy={saving}
        className={clsx(
          'w-full bg-exp-green text-white font-bold text-body-md rounded-card-sm py-3 min-h-[44px] transition-opacity',
          'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          (!selected || saving) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90',
        )}
      >
        {saving ? 'Saving…' : 'Save Favourite Team'}
      </button>
    </div>
  );
}
