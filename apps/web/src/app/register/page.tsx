'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, setToken } from '@/lib/auth-client';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<'SENT' | 'FAILED' | 'SKIPPED' | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirmPassword') as string;

    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const phoneRaw = (fd.get('phone') as string | null) ?? '';
      const result = await register({
        email: fd.get('email') as string,
        password,
        dateOfBirth: fd.get('dateOfBirth') as string,
        consentCoreService: fd.get('consentCoreService') === 'on',
        ...(phoneRaw ? { phone: phoneRaw } : {}),
        consentMarketing: fd.get('consentMarketing') === 'on',
        consentAnalytics: fd.get('consentAnalytics') === 'on',
      });

      if ('accessToken' in result) {
        setToken(result.accessToken);
        setEmailDeliveryStatus(result.emailDeliveryStatus ?? 'SKIPPED');
        if (result.emailDeliveryStatus === 'SENT') {
          router.push('/account');
        } else {
          setSuccess(true);
        }
      } else {
        setEmailDeliveryStatus('SKIPPED');
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-psl-navy">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-psl-navy mb-4">Check your inbox</h1>
          <p className="text-gray-600 mb-2">
            If your email was not already registered, your account has been created.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Verification email status: {emailDeliveryStatus ?? 'SKIPPED'}.
          </p>
          <Link href="/login" className="text-psl-navy font-semibold underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-psl-navy py-12">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-psl-navy mb-6">Create your PSL One account</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
            <input
              name="dateOfBirth"
              type="date"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-gray-400">(optional, E.164 format)</span>
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+27821234567"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-psl-navy"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input name="consentCoreService" type="checkbox" required className="mt-0.5" />
              <span className="text-sm text-gray-700">
                I agree to the PSL One{' '}
                <a href="/terms" className="underline text-psl-navy">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="underline text-psl-navy">
                  Privacy Policy
                </a>{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input name="consentMarketing" type="checkbox" className="mt-0.5" />
              <span className="text-sm text-gray-600">
                I agree to receive marketing communications from PSL One
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input name="consentAnalytics" type="checkbox" className="mt-0.5" />
              <span className="text-sm text-gray-600">
                I consent to analytics to improve my experience
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-psl-navy text-white font-semibold py-2 rounded hover:bg-opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-psl-navy font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
