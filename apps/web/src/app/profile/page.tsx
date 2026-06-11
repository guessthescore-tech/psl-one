'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { profileClient, type ProfileSummary } from '@/lib/profile-client';

function CompletionBar({ percent }: { percent: number }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Profile completion</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-psl-navy rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileClient.getSummary()
      .then(setSummary)
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    if (summary !== null) setLoading(false);
  }, [summary]);

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  if (!summary) return null;

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <span className="inline-block bg-psl-gold text-psl-navy text-xs font-bold uppercase px-2 py-1 rounded">
            {summary.role}
          </span>
        </div>

        <div className="bg-white rounded-lg px-6 py-6 mb-4">
          <CompletionBar percent={summary.completionPercent} />

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{summary.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Display name</dt>
              <dd className="font-medium text-gray-900">{summary.displayName ?? <span className="text-gray-300">Not set</span>}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">City</dt>
              <dd className="font-medium text-gray-900">{summary.city ?? <span className="text-gray-300">Not set</span>}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Country</dt>
              <dd className="font-medium text-gray-900">{summary.country ?? <span className="text-gray-300">Not set</span>}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Preferred team</dt>
              <dd className="font-medium text-gray-900">
                {summary.preferredTeam ? summary.preferredTeam.name : <span className="text-gray-300">Not set</span>}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link
            href="/profile/edit"
            className="bg-psl-navy border border-white/20 text-white text-sm font-semibold text-center py-3 rounded-lg hover:bg-white/10 transition"
          >
            Edit profile
          </Link>
          <Link
            href="/profile/preferences"
            className="bg-psl-navy border border-white/20 text-white text-sm font-semibold text-center py-3 rounded-lg hover:bg-white/10 transition"
          >
            Preferences
          </Link>
        </div>

        <p className="text-center">
          <Link href="/account" className="text-gray-400 text-sm hover:text-white transition">← Account</Link>
        </p>
      </div>
    </main>
  );
}
