'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;

    // Always show the same message regardless of outcome (non-enumeration)
    await requestPasswordReset(email).catch(() => {});

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-psl-navy">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-psl-navy mb-4">Check your inbox</h1>
          <p className="text-gray-600 mb-6">
            If this email is registered, a password reset link has been sent.
          </p>
          <Link href="/login" className="text-psl-navy font-semibold underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-psl-navy">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-psl-navy mb-2">Reset your password</h1>
        <p className="text-gray-600 text-sm mb-6">
          Enter your email and we&apos;ll send a reset link if your account exists.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-psl-navy text-white font-semibold py-2 rounded hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          <Link href="/login" className="text-psl-navy font-semibold underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
