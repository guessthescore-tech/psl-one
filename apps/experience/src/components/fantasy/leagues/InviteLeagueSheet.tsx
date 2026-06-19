'use client';

import { useState } from 'react';
import { ShareNetwork, CopySimple, Check } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'framer-motion';
import { FantasyBottomSheet } from '@/components/fantasy/shared/FantasyBottomSheet';

interface InviteLeagueSheetProps {
  open: boolean;
  onClose: () => void;
  leagueName: string;
  inviteCode: string;
}

export function InviteLeagueSheet({ open, onClose, leagueName, inviteCode }: InviteLeagueSheetProps) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — no-op
    }
  }

  async function handleShare() {
    try {
      await navigator.share({
        title: `Join my PSL One fantasy league: ${leagueName}`,
        text: `Join my World Cup 2026 fantasy league! Use code: ${inviteCode}`,
        url: `https://pslone.co.za/fantasy/leagues/join?code=${inviteCode}`,
      });
    } catch {
      // fallback — no-op
    }
  }

  return (
    <FantasyBottomSheet open={open} onClose={onClose} snapHeight="half" title="Invite Friends">
      <div className="flex flex-col gap-5">
        <p className="text-body-md text-exp-muted">
          Share this code with friends to join <span className="text-white font-semibold">{leagueName}</span>.
        </p>

        {/* Code display */}
        <div className="flex items-center justify-between bg-exp-ink border border-exp-gold/30 rounded-card-sm px-5 py-4 gap-4">
          <span className="text-display-md text-exp-gold font-mono tracking-widest">{inviteCode}</span>
          <motion.button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : 'Copy invite code'}
            whileTap={reduce ? {} : { scale: 0.9 }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-exp-gold hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            {copied ? <Check size={22} weight="bold" /> : <CopySimple size={22} weight="bold" />}
          </motion.button>
        </div>

        {/* Share button */}
        <motion.button
          type="button"
          onClick={handleShare}
          whileTap={reduce ? {} : { scale: 0.97 }}
          className="flex items-center justify-center gap-2 min-h-[52px] rounded-card-sm bg-exp-green text-white font-black text-body-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          <ShareNetwork size={20} weight="bold" />
          Share League
        </motion.button>

        <p className="text-label-sm text-exp-muted text-center">
          Points only — no real money — no financial value
        </p>
      </div>
    </FantasyBottomSheet>
  );
}
