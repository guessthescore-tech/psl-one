'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinLeagueByCode, joinPublicLeague } from '@/lib/fantasy-rules-client';

export default function JoinLeaguePage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [seasonId, setSeasonId] = useState('');
  const [joiningPublic, setJoiningPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [publicSuccess, setPublicSuccess] = useState<string | null>(null);

  async function handleJoinByCode(e: React.FormEvent) {
    e.preventDefault();
    setJoining(true);
    setCodeError(null);
    try {
      const membership = await joinLeagueByCode(code.trim().toUpperCase());
      router.push(`/fantasy/leagues/${membership.leagueId}`);
    } catch (err) {
      setCodeError((err as Error).message);
    } finally {
      setJoining(false);
    }
  }

  async function handleJoinPublic(e: React.FormEvent) {
    e.preventDefault();
    setJoiningPublic(true);
    setPublicError(null);
    setPublicSuccess(null);
    try {
      const membership = await joinPublicLeague(seasonId.trim());
      setPublicSuccess(`Joined! League ID: ${membership.leagueId}`);
    } catch (err) {
      setPublicError((err as Error).message);
    } finally {
      setJoiningPublic(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Join a League</h1>
        <Link href="/fantasy/leagues" className="text-sm text-blue-600 underline">Back</Link>
      </div>

      {/* Join by invite code */}
      <section className="border rounded p-4 mb-4 bg-white">
        <h2 className="font-semibold text-sm mb-3">Join by Invite Code</h2>
        {codeError && <p className="text-red-600 text-xs mb-2">{codeError}</p>}
        <form onSubmit={handleJoinByCode} className="space-y-2">
          <input
            className="w-full border rounded px-3 py-2 text-sm tracking-widest uppercase font-mono"
            placeholder="ABCD1234"
            value={code}
            onChange={e => setCode(e.target.value)}
            maxLength={10}
            required
          />
          <button
            type="submit"
            disabled={joining || !code.trim()}
            className="w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {joining ? 'Joining…' : 'Join Private League'}
          </button>
        </form>
      </section>

      {/* Join public league */}
      <section className="border rounded p-4 bg-white">
        <h2 className="font-semibold text-sm mb-3">Join a Public League</h2>
        {publicError && <p className="text-red-600 text-xs mb-2">{publicError}</p>}
        {publicSuccess && <p className="text-green-600 text-xs mb-2">{publicSuccess}</p>}
        <form onSubmit={handleJoinPublic} className="space-y-2">
          <input
            className="w-full border rounded px-3 py-2 text-sm font-mono"
            placeholder="Season UUID"
            value={seasonId}
            onChange={e => setSeasonId(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={joiningPublic || !seasonId.trim()}
            className="w-full py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {joiningPublic ? 'Joining…' : 'Join Public League'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">Up to 5 public leagues allowed per season.</p>
      </section>
    </main>
  );
}
