'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { AuthLayout } from '@/components/account/AuthLayout';
import { getDataMode } from '@/lib/data';
import { requestPasswordReset } from '@/lib/auth';

/**
 * /forgot-password — Password reset step 1
 * Enter email to receive a reset link.
 */
export default function ForgotPasswordPage() {
  const mode = getDataMode();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'DESIGN_REVIEW_DATA') {
        await new Promise(res => setTimeout(res, 700));
        setSent(true);
        return;
      }
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-display-sm text-white">Forgot Password</h1>
          <p className="text-body-sm text-exp-muted mt-2">
            {sent
              ? undefined
              : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {sent ? (
          <div
            role="status"
            className="flex flex-col items-center gap-4 py-4 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-exp-success/10 flex items-center justify-center">
              <span className="text-2xl" aria-hidden>✉️</span>
            </div>
            <div>
              <p className="text-body-md font-semibold text-white">Check your email</p>
              <p className="text-body-sm text-exp-muted mt-1">
                We&apos;ve sent a reset link to{' '}
                <strong className="text-white">{email || 'your email'}</strong>
              </p>
            </div>
            <Link
              href="/sign-in"
              className="text-body-sm text-exp-gold hover:text-exp-gold-2 transition-colors underline focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            aria-label="Request password reset"
            className="flex flex-col gap-5"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-label-lg text-exp-muted uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={clsx(
                  'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 text-white text-body-md placeholder:text-exp-muted/40 transition-colors min-h-[44px]',
                  'focus:outline-none focus:border-exp-gold',
                )}
                aria-required
              />
            </div>

            {error && (
              <div role="alert" className="text-body-sm text-exp-live bg-exp-live/10 rounded-card-xs px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={clsx(
                'w-full bg-exp-green text-white font-bold text-body-md rounded-card-sm py-3 min-h-[44px] transition-opacity',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90',
              )}
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="text-body-sm text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
              >
                ← Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
