'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Users } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';

interface LeagueCreateFormProps {
  onSubmit: (name: string, type: 'PRIVATE' | 'PUBLIC') => void;
  loading?: boolean;
}

export function LeagueCreateForm({ onSubmit, loading }: LeagueCreateFormProps) {
  const reduce = useReducedMotion();
  const [name, setName] = useState('');
  const [type, setType] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');

  const nameValid = name.trim().length >= 3 && name.trim().length <= 30;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameValid || loading) return;
    onSubmit(name.trim(), type);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-4 py-5">
      {/* League name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="league-name" className="text-label-lg text-exp-muted uppercase tracking-widest">
          League Name
        </label>
        <input
          id="league-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Fantasy League"
          maxLength={30}
          disabled={loading}
          aria-describedby="league-name-hint"
          className={clsx(
            'bg-exp-ink border rounded-card-sm px-4 py-3 text-body-lg text-white',
            'placeholder:text-white/20 min-h-[52px] transition-colors focus:outline-none',
            nameValid || name === '' ? 'border-exp-border-dk focus:border-exp-gold' : 'border-exp-live',
          )}
        />
        <p id="league-name-hint" className="text-label-sm text-exp-muted">
          {name.length}/30 — minimum 3 characters
        </p>
      </div>

      {/* League type */}
      <div className="flex flex-col gap-3">
        <span className="text-label-lg text-exp-muted uppercase tracking-widest">Type</span>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { id: 'PRIVATE' as const, label: 'Private', icon: Lock,  desc: 'Invite only — friends only join with your code' },
              { id: 'PUBLIC'  as const, label: 'Public',  icon: Users, desc: 'Open to any fan — listed in public browse' },
            ] as const
          ).map(({ id, label, icon: Icon, desc }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => setType(id)}
              whileTap={reduce ? {} : { scale: 0.97 }}
              aria-pressed={type === id}
              className={clsx(
                'p-4 rounded-card border text-left transition-all min-h-[44px]',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                type === id
                  ? 'border-exp-gold bg-exp-gold/10 shadow-glow-gold'
                  : 'border-exp-border-dk bg-exp-ink hover:border-white/20',
              )}
            >
              <Icon size={20} weight={type === id ? 'fill' : 'regular'} className={type === id ? 'text-exp-gold' : 'text-exp-muted'} />
              <div className={clsx('text-body-sm font-semibold mt-2', type === id ? 'text-exp-gold' : 'text-white')}>{label}</div>
              <div className="text-label-sm text-exp-muted mt-1 leading-relaxed">{desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Season (display only) */}
      <div className="flex flex-col gap-2">
        <span className="text-label-lg text-exp-muted uppercase tracking-widest">Season</span>
        <div className="bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 text-body-md text-white/60 cursor-not-allowed">
          FIFA World Cup 2026
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!nameValid || loading}
        whileTap={reduce ? {} : { scale: 0.97 }}
        className={clsx(
          'w-full min-h-[52px] rounded-card-sm font-black text-body-md transition-all mt-2',
          'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          nameValid && !loading
            ? 'bg-exp-gold text-exp-void hover:shadow-glow-gold'
            : 'bg-white/10 text-white/30 cursor-not-allowed',
        )}
      >
        {loading ? 'Creating...' : 'Create League'}
      </motion.button>

      <p className="text-label-sm text-exp-muted text-center">
        Points only — no financial value — no real money
      </p>
    </form>
  );
}
