'use client';

import { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ClipboardText } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';

interface LeagueCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function LeagueCodeInput({ value, onChange, disabled }: LeagueCodeInputProps) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    onChange(raw);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
      onChange(cleaned);
      setPasted(true);
      setTimeout(() => setPasted(false), 1500);
    } catch {
      // Clipboard not available — no-op
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="league-code" className="text-label-lg text-exp-muted uppercase tracking-widest">
        Invite Code
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="league-code"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          maxLength={6}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="ABC123"
          aria-label="6-character league invite code"
          className={clsx(
            'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 pr-12',
            'text-display-sm text-white font-mono tracking-widest text-center',
            'placeholder:text-white/20 transition-colors',
            'focus:outline-none focus:border-exp-gold',
            'min-h-[56px]',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        />
        <motion.button
          type="button"
          onClick={handlePaste}
          disabled={disabled}
          aria-label="Paste invite code from clipboard"
          whileTap={reduce ? {} : { scale: 0.9 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-exp-muted hover:text-exp-gold transition-colors p-2 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
        >
          <ClipboardText size={20} weight={pasted ? 'fill' : 'regular'} className={pasted ? 'text-exp-gold' : ''} />
        </motion.button>
      </div>
      <p className="text-label-sm text-exp-muted text-center">
        {value.length}/6 characters
      </p>
    </div>
  );
}
