'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset } from '@/lib/auth-client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') ?? '');
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const fd = new FormData(e.currentTarget);
    const newPassword = fd.get('newPassword') as string;
    const confirm = fd.get('confirmPassword') as string;

    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset({ token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset link is invalid or has expired');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-psl-navy">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-psl-navy mb-4">Password reset</h1>
          <p className="text-gray-600">Your password has been updated. Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-psl-navy">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-psl-navy mb-6">Set a new password</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-psl-navy text-white font-semibold py-2 rounded hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Updating…' : 'Set new password'}
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
