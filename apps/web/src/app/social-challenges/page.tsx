'use client';

export default function SocialChallengesPage() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Social Prediction Challenges</h1>
      <p className="text-xs text-gray-500 mb-6">
        Gameplay points only — cannot be exchanged for money or prizes.
      </p>
      <div className="grid grid-cols-1 gap-3">
        <a href="/social-challenges/incoming" className="block border rounded-lg p-4 bg-white shadow-sm hover:bg-gray-50">
          <div className="font-semibold text-sm">Incoming Challenges</div>
          <div className="text-xs text-gray-500 mt-1">View challenges sent to you by other fans.</div>
        </a>
        <a href="/social-challenges/outgoing" className="block border rounded-lg p-4 bg-white shadow-sm hover:bg-gray-50">
          <div className="font-semibold text-sm">Outgoing Challenges</div>
          <div className="text-xs text-gray-500 mt-1">View challenges you have sent to other fans.</div>
        </a>
        <a href="/social-challenges/new" className="block border rounded-lg p-4 bg-white shadow-sm hover:bg-gray-50">
          <div className="font-semibold text-sm">Send a Direct Challenge</div>
          <div className="text-xs text-gray-500 mt-1">Challenge a specific fan on an open listing.</div>
        </a>
        <a href="/social-predictions/marketplace" className="block border rounded-lg p-4 bg-white shadow-sm hover:bg-gray-50">
          <div className="font-semibold text-sm">Public Marketplace</div>
          <div className="text-xs text-gray-500 mt-1">Browse all open prediction challenges.</div>
        </a>
      </div>
    </main>
  );
}
