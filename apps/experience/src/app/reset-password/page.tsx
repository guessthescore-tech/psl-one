'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { AuthLayout } from '@/components/account/AuthLayout';
import { getDataMode } from '@/lib/data';
import { confirmPasswordReset } from '@/lib/auth';

/**
 * /reset-password — Password reset step 2
 * Reads ?token= from URL. Shows form to enter new password.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = getDataMode();

  const token = searchParams?.get('token') ?? null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  // Missing token
  if (!token) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="w-14 h-14 rounded-full bg-exp-live/10 flex items-center justify-center">
            <span className="text-2xl" aria-hidden>🔗</span>
          </div>
          <div>
            <p className="text-body-md font-semibold text-white">Invalid or expired link</p>
            <p className="text-body-sm text-exp-muted mt-1">
              This reset link is missing or has expired.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="text-body-sm text-exp-gold hover:text-exp-gold-2 underline transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
          >
            Request a new one →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'DESIGN_REVIEW_DATA') {
        await new Promise(res => setTimeout(res, 700));
        setSuccess(true);
        return;
      }
      await confirmPasswordReset(token!, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <div
          role="status"
          className="flex flex-col items-center gap-4 py-4 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-exp-success/10 flex items-center justify-center">
            <span className="text-2xl" aria-hidden>✅</span>
          </div>
          <div>
            <p className="text-body-md font-semibold text-white">Password updated!</p>
            <p className="text-body-sm text-exp-muted mt-1">Redirecting you to sign in…</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-display-sm text-white">Reset Password</h1>
          <p className="text-body-sm text-exp-muted mt-2">Enter your new password below</p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-label="Reset password"
          className="flex flex-col gap-5"
          noValidate
        >
          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-label-lg text-exp-muted uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={clsx(
                  'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 pr-12 text-white text-body-md placeholder:text-exp-muted/40 transition-colors min-h-[44px]',
                  'focus:outline-none focus:border-exp-gold',
                )}
                aria-required
              />
              <button
                type="button"
                onClick={() => setShowNew(s => !s)}
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
              >
                {showNew ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-label-lg text-exp-muted uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={clsx(
                  'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 pr-12 text-white text-body-md placeholder:text-exp-muted/40 transition-colors min-h-[44px]',
                  'focus:outline-none focus:border-exp-gold',
                )}
                aria-required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(s => !s)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
              >
                {showConfirm ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
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
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
