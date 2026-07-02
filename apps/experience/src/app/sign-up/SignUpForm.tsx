'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react';
import { register } from '@/lib/auth';

const API_BASE =
  typeof window === 'undefined'
    ? (process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000')
    : (process.env['NEXT_PUBLIC_API_BASE_URL'] ??
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:4000'
          : 'https://api.beta.pslone.co.za'));

interface FormState {
  email: string;
  password: string;
  dateOfBirth: string;
  consentCoreService: boolean;
  consentMarketing: boolean;
  consentAnalytics: boolean;
}

interface SuccessState {
  email: string;
  token?: string;
  accountCreated: boolean;
  emailDeliveryStatus: 'SENT' | 'FAILED' | 'SKIPPED';
}

function inputClass(hasError?: boolean) {
  return clsx(
    'w-full rounded-card-sm px-4 py-3 bg-exp-void border text-white placeholder:text-exp-muted text-body-md',
    'focus:outline-none focus:ring-2 focus:ring-exp-gold focus:border-transparent transition-colors duration-150',
    'min-h-[44px]',
    hasError ? 'border-exp-live' : 'border-exp-border-dk',
  );
}

function labelClass() {
  return 'block text-label-lg text-white/70 mb-1.5';
}

export function SignUpForm() {
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    dateOfBirth: '',
    consentCoreService: false,
    consentMarketing: false,
    consentAnalytics: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  function ageFromDob(dob: string): number {
    const born = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    return age;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.consentCoreService) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.dateOfBirth && ageFromDob(form.dateOfBirth) < 13) {
      setError('You must be at least 13 years old to register.');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        consentCoreService: form.consentCoreService,
        consentMarketing: form.consentMarketing,
        consentAnalytics: form.consentAnalytics,
      });

      if ('accessToken' in data) {
        setSuccess({
          email: form.email,
          token: data.accessToken,
          accountCreated: true,
          emailDeliveryStatus: data.emailDeliveryStatus ?? 'SKIPPED',
        });
      } else {
        setSuccess({
          email: form.email,
          accountCreated: false,
          emailDeliveryStatus: 'SKIPPED',
        });
      }
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!success) return;
    setResendLoading(true);
    setResendError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/email/verify/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(success.token ? { Authorization: `Bearer ${success.token}` } : {}),
        },
        body: JSON.stringify({ email: success.email }),
      });
      if (!res.ok) {
        setResendError('Failed to resend verification email. Please try again.');
        return;
      }
      setResendSent(true);
      setSuccess(prev => prev ? { ...prev, emailDeliveryStatus: 'SENT' } : prev);
    } catch {
      setResendError('Unable to connect to the server. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }

  /* ── Success state ── */
  if (success) {
    const emailSent = success.emailDeliveryStatus === 'SENT' || resendSent;
    const canResend = Boolean(success.token);
    return (
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <div className="w-16 h-16 rounded-full bg-exp-green/15 flex items-center justify-center">
          <CheckCircle size={36} weight="fill" className="text-exp-green" aria-hidden />
        </div>

        <div>
          <h2 className="text-display-sm text-white mb-2">
            {success.accountCreated ? 'Account created!' : 'Check your email'}
          </h2>
          {!success.accountCreated ? (
            <p className="text-body-md text-white/70">
              If an account can be created for <strong className="text-white">{success.email}</strong>,
              we will send the next verification instructions there. You can also try signing in.
            </p>
          ) : emailSent ? (
            <p className="text-body-md text-white/70">
              {"We've sent a verification email to "}
              <strong className="text-white">{success.email}</strong>
              {". Click the link in the email to verify your account."}
            </p>
          ) : (
            <p className="text-body-md text-white/70">
              Your account was created, but the verification email could not be sent right now.
              Use resend below, or sign in later once email delivery is restored.
            </p>
          )}
        </div>

        <div className="w-full border-t border-exp-border-dk pt-4">
          {success.accountCreated && !emailSent && (
            <p role="status" className="text-body-sm text-exp-gold text-center mb-3">
              Email delivery status: {success.emailDeliveryStatus.toLowerCase()}.
            </p>
          )}
          {resendError && (
            <p role="alert" className="text-body-sm text-exp-live text-center mb-3">
              {resendError}
            </p>
          )}
          {resendSent ? (
            <p className="text-body-sm text-exp-green text-center">
              Verification email resent!
            </p>
          ) : !canResend ? (
            <a
              href="/sign-in"
              className={clsx(
                'inline-flex items-center justify-center w-full py-3 rounded-card-sm text-label-lg font-bold',
                'border border-exp-border-dk text-white/70 hover:text-white hover:border-white/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
                'min-h-[44px]',
              )}
            >
              Go to sign in
            </a>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className={clsx(
                'w-full py-3 rounded-card-sm text-label-lg font-bold transition-colors duration-150',
                'border border-exp-border-dk text-white/70 hover:text-white hover:border-white/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[44px]',
              )}
              aria-busy={resendLoading}
            >
              {resendLoading ? 'Sending…' : 'Resend verification email'}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Create account"
      noValidate
      className="flex flex-col gap-5"
    >
      {error && (
        <div
          role="alert"
          className="bg-exp-live/10 border border-exp-live/40 rounded-card-sm px-4 py-3 text-body-sm text-exp-live"
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="signup-email" className={labelClass()}>
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className={inputClass()}
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="signup-password" className={labelClass()}>
          Password
          <span className="text-exp-muted font-normal ml-1">(min 8 characters)</span>
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className={clsx(inputClass(), 'pr-12')}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-exp-muted hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Date of birth */}
      <div>
        <label htmlFor="signup-dob" className={labelClass()}>
          Date of birth
          <span className="text-exp-muted font-normal ml-1">(must be 13+)</span>
        </label>
        <input
          id="signup-dob"
          type="date"
          required
          value={form.dateOfBirth}
          onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
          className={inputClass()}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
        />
      </div>

      {/* Consent checkboxes */}
      <fieldset className="flex flex-col gap-3 pt-1">
        <legend className="text-label-lg text-white/70 mb-2">Your consent</legend>

        {/* Required */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.consentCoreService}
            onChange={e => setForm(f => ({ ...f, consentCoreService: e.target.checked }))}
            className="mt-0.5 w-4 h-4 accent-exp-gold flex-shrink-0"
            required
            aria-required="true"
          />
          <span className="text-body-sm text-white/70 group-hover:text-white/90 transition-colors">
            I agree to the{' '}
            <a href="/terms" className="text-exp-gold hover:underline" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-exp-gold hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            {' '}(required)
          </span>
        </label>

        {/* Marketing */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.consentMarketing}
            onChange={e => setForm(f => ({ ...f, consentMarketing: e.target.checked }))}
            className="mt-0.5 w-4 h-4 accent-exp-gold flex-shrink-0"
          />
          <span className="text-body-sm text-white/70 group-hover:text-white/90 transition-colors">
            Receive PSL One news, match updates and promotional offers (optional)
          </span>
        </label>

        {/* Analytics */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.consentAnalytics}
            onChange={e => setForm(f => ({ ...f, consentAnalytics: e.target.checked }))}
            className="mt-0.5 w-4 h-4 accent-exp-gold flex-shrink-0"
          />
          <span className="text-body-sm text-white/70 group-hover:text-white/90 transition-colors">
            Allow analytics to improve the PSL One experience (optional)
          </span>
        </label>
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className={clsx(
          'w-full py-3.5 rounded-card-sm text-label-lg font-bold transition-all duration-150',
          'bg-exp-gold text-exp-void hover:bg-exp-gold-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-exp-navy',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'min-h-[44px]',
        )}
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
