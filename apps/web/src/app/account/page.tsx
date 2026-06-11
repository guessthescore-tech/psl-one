'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { me, logout, type MeResponse } from '@/lib/auth-client';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse | null>(null);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch {
      setError('Logout failed. Please try again.');
      setLoggingOut(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-psl-navy">
        <div className="text-white text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-psl-navy flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-psl-navy">My Account</h1>
          <span className="inline-block bg-psl-gold text-psl-navy text-xs font-bold uppercase px-2 py-1 rounded">
            {user.role}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{user.email}</dd>
          </div>
          {user.phone && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{user.phone}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Date of birth</dt>
            <dd className="font-medium text-gray-900">
              {new Date(user.dateOfBirth).toLocaleDateString('en-ZA')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Verified</dt>
            <dd className="font-medium text-gray-900">{user.isVerified ? 'Yes' : 'Pending'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Member since</dt>
            <dd className="font-medium text-gray-900">
              {new Date(user.createdAt).toLocaleDateString('en-ZA')}
            </dd>
          </div>
        </dl>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-8 w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700 disabled:opacity-50 transition"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
