'use client';

import { useState } from 'react';
import { fanGetMyListings, fanCreateDirectChallenge } from '@/lib/social-prediction-client';
import { getBetaToken } from '@/lib/auth-client';

interface Listing {
  id: string;
  supportingSelection: string;
  status: string;
  committedPoints: number;
  fixtureMarket?: { marketType: string };
}

export default function NewDirectChallengePage() {
  const [step, setStep] = useState<'find-listing' | 'enter-user'>('find-listing');
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [challengedUserId, setChallengedUserId] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadListings() {
    setLoading(true);
    try {
      const d = await fanGetMyListings(getBetaToken());
      const all = Array.isArray(d) ? d : d.listings ?? [];
      setListings(all.filter((l: Listing) => l.status === 'OPEN'));
      setStep('find-listing');
    } catch (e) { setMsg(String(e)); } finally { setLoading(false); }
  }

  async function send() {
    if (!selectedListing || !challengedUserId.trim()) {
      setMsg('Please select a listing and enter the user ID.');
      return;
    }
    try {
      await fanCreateDirectChallenge(getBetaToken(), selectedListing, challengedUserId.trim());
      setMsg('Challenge sent! The fan will see it in their incoming challenges.');
    } catch (e) { setMsg(String(e)); }
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <a href="/social-challenges" className="text-xs text-blue-600 underline mb-4 inline-block">← Challenges</a>
      <h1 className="text-2xl font-bold mb-1">Send a Direct Challenge</h1>
      <p className="text-xs text-gray-500 mb-5">
        Gameplay points only — cannot be exchanged for money.
      </p>

      {msg && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{msg}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Open Listings</label>
          <div className="flex gap-2">
            <button
              onClick={loadListings}
              disabled={loading}
              className="text-xs bg-gray-800 text-white rounded px-3 py-1.5 hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Load My Open Listings'}
            </button>
          </div>
          {listings.length > 0 && (
            <select
              value={selectedListing}
              onChange={e => setSelectedListing(e.target.value)}
              className="mt-2 w-full border rounded p-2 text-sm"
            >
              <option value="">— Select a listing —</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>
                  {l.fixtureMarket?.marketType?.replace(/_/g, ' ')} · {l.supportingSelection} · {l.committedPoints} pts
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fan User ID to Challenge</label>
          <input
            type="text"
            value={challengedUserId}
            onChange={e => setChallengedUserId(e.target.value)}
            placeholder="UUID of the fan to challenge"
            className="w-full border rounded p-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Friend-to-friend challenges use user IDs in the MVP. Share-link feature also available after creating.</p>
        </div>

        <button
          onClick={send}
          disabled={!selectedListing || !challengedUserId.trim()}
          className="w-full bg-green-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Send Challenge
        </button>
      </div>
    </main>
  );
}
