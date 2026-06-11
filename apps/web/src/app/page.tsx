import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1a1a2e]">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white">PSL One</h1>
          <p className="mt-4 text-xl font-medium text-[#ffd700]">
            The Digital Operating System of South African Football
          </p>
          <p className="mt-6 text-lg text-gray-400">
            Fixtures · Fantasy · Predictions · Rewards
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/health"
              className="rounded-md bg-[#1b3a6b] px-6 py-3 text-sm font-medium text-white hover:bg-[#152d54] transition-colors"
            >
              System Health
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
