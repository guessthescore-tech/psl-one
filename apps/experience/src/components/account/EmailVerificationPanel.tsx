'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, EnvelopeSimple, Warning } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { apiFetch, apiPost } from '@/lib/api';

type VerificationState = 'loading' | 'verified' | 'pending' | 'unauthorized' | 'error';
type SendState = 'idle' | 'sending' | 'sent' | 'failed';

type MeResponse = {
  email: string;
  isVerified: boolean;
};

export function EmailVerificationPanel() {
  const [state, setState] = useState<VerificationState>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [sendState, setSendState] = useState<SendState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<MeResponse>('/auth/me')
      .then((profile) => {
        if (cancelled) return;
        setEmail(profile.email);
        setState(profile.isVerified ? 'verified' : 'pending');
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        setState(message === 'UNAUTHORIZED' ? 'unauthorized' : 'error');
        setError(message === 'UNAUTHORIZED' ? null : 'Could not load email verification status.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleResend() {
    setSendState('sending');
    setError(null);

    try {
      await apiPost<{ message: string }>('/auth/email/verify/request', {});
      setSendState('sent');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      setSendState('failed');
      setError(
        message === 'UNAUTHORIZED'
          ? 'You must be signed in to request a verification email.'
          : 'Failed to send verification email. Please try again.',
      );
    }
  }

  const verified = state === 'verified';
  const pending = state === 'pending';
  const disabled = !pending || sendState === 'sending';

  return (
    <section
      className="mb-6 rounded-card-sm border border-exp-border-dk bg-exp-ink px-4 py-4"
      aria-label="Email verification status"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-label-lg text-white mb-1">Email verification</h2>
          <p className="text-body-sm text-white/60">
            {state === 'loading' && 'Checking your email verification status.'}
            {verified && 'Your email address is verified.'}
            {pending && (
              <>
                Verify <span className="text-white">{email}</span> to keep account notices flowing.
              </>
            )}
            {state === 'unauthorized' && 'Sign in to manage email verification.'}
            {state === 'error' && 'Email verification status is temporarily unavailable.'}
          </p>
          {sendState === 'sent' && (
            <p role="status" className="mt-2 text-body-sm text-exp-green">
              Verification email sent. Check your inbox.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-2 text-body-sm text-exp-live">
              {error}
            </p>
          )}
        </div>
        <StatusBadge state={state} />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={disabled}
          aria-busy={sendState === 'sending'}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-card-sm text-label-lg font-bold transition-colors duration-150 min-h-[44px]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
            disabled
              ? 'border border-exp-border-dk text-exp-muted cursor-not-allowed'
              : 'border border-exp-border-dk text-white hover:border-white/40 hover:bg-white/5',
          )}
        >
          <EnvelopeSimple size={18} aria-hidden />
          {sendState === 'sending' ? 'Sending...' : 'Resend verification email'}
        </button>
      </div>
    </section>
  );
}

function StatusBadge({ state }: { state: VerificationState }) {
  if (state === 'verified') {
    return (
      <span className="flex-shrink-0 mt-0.5 inline-flex items-center gap-1.5 text-label-md text-exp-green border border-exp-green/40 rounded-pill px-3 py-1">
        <CheckCircle size={14} weight="fill" aria-hidden />
        Verified
      </span>
    );
  }

  const label = state === 'loading' ? 'Checking' : state === 'unauthorized' ? 'Signed out' : 'Pending';

  return (
    <span className="flex-shrink-0 mt-0.5 inline-flex items-center gap-1.5 text-label-md text-exp-muted border border-exp-border-dk rounded-pill px-3 py-1">
      {state === 'error' ? <Warning size={14} weight="fill" aria-hidden /> : <span className="w-1.5 h-1.5 rounded-full bg-exp-muted" aria-hidden />}
      {label}
    </span>
  );
}
