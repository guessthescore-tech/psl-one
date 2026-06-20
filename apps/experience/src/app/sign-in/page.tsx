'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';
import { AuthLayout } from '@/components/account/AuthLayout';
import { AuthTabs } from '@/components/account/AuthTabs';
import { getDataMode } from '@/lib/data';
import { login } from '@/lib/auth';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = getDataMode();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'DESIGN_REVIEW_DATA') {
        await new Promise(res => setTimeout(res, 600));
        const redirect = searchParams?.get('redirect') ?? '/fantasy/team';
        router.push(redirect);
        return;
      }

      await login(email, password);
      const redirect = searchParams?.get('redirect') ?? '/fantasy/team';
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="note"
          className="mb-4 text-xs text-center text-purple-300 bg-purple-900/40 border border-purple-700/40 rounded-card-xs px-3 py-2 font-mono"
        >
          DESIGN_REVIEW_DATA: Authentication simulated
        </div>
      )}

      <AuthTabs active="sign-in" />

      <form
        onSubmit={handleSubmit}
        aria-label="Sign in"
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
              'w-full bg-exp-ink border rounded-card-sm px-4 py-3 text-white text-body-md placeholder:text-exp-muted/40 transition-colors min-h-[44px]',
              'focus:outline-none focus:border-exp-gold',
              'border-exp-border-dk',
            )}
            aria-required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-label-lg text-exp-muted uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <div className="text-right -mt-2">
          <Link
            href="/forgot-password"
            className="text-body-sm text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
          >
            Forgot your password?
          </Link>
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
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </>
  );
}

export default function SignInPage() {
  return (
    <AuthLayout>
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
