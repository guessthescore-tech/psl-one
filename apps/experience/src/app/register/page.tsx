'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { AuthLayout } from '@/components/account/AuthLayout';
import { AuthTabs } from '@/components/account/AuthTabs';
import { getDataMode } from '@/lib/data';
import { register } from '@/lib/auth';

/**
 * /register — Registration page
 * LIVE_BETA_DATA: calls register() API.
 * DESIGN_REVIEW_DATA: simulates success, redirects to /fantasy/onboarding.
 */
export default function RegisterPage() {
  const router = useRouter();
  const mode = getDataMode();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (displayName.trim().length < 2 || displayName.trim().length > 30) {
      setError('Display name must be 2–30 characters');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to continue');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'DESIGN_REVIEW_DATA') {
        await new Promise(res => setTimeout(res, 800));
        router.push('/fantasy/onboarding');
        return;
      }

      await register(email, password, displayName);
      router.push('/fantasy/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="note"
          className="mb-4 text-xs text-center text-purple-300 bg-purple-900/40 border border-purple-700/40 rounded-card-xs px-3 py-2 font-mono"
        >
          DESIGN_REVIEW_DATA: Registration simulated
        </div>
      )}

      <AuthTabs active="register" />

      <form
        onSubmit={handleSubmit}
        aria-label="Create account"
        className="flex flex-col gap-5"
        noValidate
      >
        {/* Display Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="displayName" className="text-label-lg text-exp-muted uppercase tracking-wider">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={30}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your fan name"
            className={clsx(
              'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 text-white text-body-md placeholder:text-exp-muted/40 transition-colors min-h-[44px]',
              'focus:outline-none focus:border-exp-gold',
            )}
            aria-required
          />
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-label-lg text-exp-muted uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className={clsx(
                'w-full bg-exp-ink border border-exp-border-dk rounded-card-sm px-4 py-3 pr-12 text-white text-body-md placeholder:text-exp-muted/40 transition-colors min-h-[44px]',
                'focus:outline-none focus:border-exp-gold',
              )}
              aria-required
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-exp-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
            >
              {showPassword ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
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
              placeholder="Re-enter password"
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

        {/* Terms checkbox */}
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded accent-exp-gold focus-visible:outline-2 focus-visible:outline-exp-gold cursor-pointer flex-shrink-0"
            aria-required
          />
          <label htmlFor="terms" className="text-body-sm text-exp-muted cursor-pointer">
            I accept the{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-exp-gold underline hover:text-exp-gold-2 focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm"
              onClick={e => e.stopPropagation()}
            >
              Terms &amp; Conditions
            </Link>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="text-body-sm text-exp-live bg-exp-live/10 rounded-card-xs px-3 py-2">
            {error}
          </div>
        )}

        {/* Submit */}
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
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
