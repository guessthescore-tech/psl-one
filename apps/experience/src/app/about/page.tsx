import Link from 'next/link';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';

const FEATURES = [
  {
    icon: '⚽',
    title: 'Points Engine',
    description:
      'A multi-dimensional fan value system that rewards predictions, fantasy performance, attendance, and social engagement — no real money, pure football passion.',
  },
  {
    icon: '🏟️',
    title: 'Club Experience',
    description:
      'Deep-dive club profiles, squad data, fixture calendars, and live match intelligence. Every PSL club, every competition, one platform.',
  },
  {
    icon: '🏆',
    title: 'Social Leagues',
    description:
      'Create or join private leagues with friends, challenge rivals head-to-head, and climb the global leaderboard. Football is better together.',
  },
];

const SOCIAL_LINKS = [
  { label: 'Twitter / X', handle: '@PSLOneOfficial', href: '#' },
  { label: 'Instagram',   handle: '@pslone',         href: '#' },
  { label: 'TikTok',     handle: '@pslone',          href: '#' },
];

/**
 * /about — About PSL One
 * Static marketing page.
 */
export default function AboutPage() {
  return (
    <FantasyShell>
      <div className="flex flex-col gap-10">
        {/* Hero */}
        <header className="text-center py-4">
          <div className="inline-flex items-center justify-center mb-4">
            <div
              className="w-16 h-16 rounded-[12px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#00843d,#1b3a6b)' }}
              aria-hidden
            >
              <span className="text-white font-black text-2xl leading-none">P</span>
            </div>
          </div>
          <h1 className="text-display-lg text-white">About PSL One</h1>
          <p className="text-body-lg text-exp-gold mt-3 font-medium">
            The Digital Operating System of South African Football
          </p>
        </header>

        {/* Mission */}
        <section className="bg-exp-ink border border-exp-border-dk rounded-card p-6">
          <p className="text-body-lg text-white/85 leading-relaxed">
            PSL One is built by South African football fans, for South African football fans. Our
            mission is to bring every supporter closer to the game they love — through live data,
            fantasy football, predictions, club experiences, and a community that stretches from
            Soweto to Cape Town and beyond.
          </p>
          <p className="text-body-lg text-white/75 leading-relaxed mt-4">
            We believe football engagement should be free, fun, and fair. No betting. No gambling.
            No real-money stakes. Just the beautiful game and the fans who make it beautiful.
          </p>
        </section>

        {/* Feature cards */}
        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">
            What We Build
          </h2>
          <div className="flex flex-col gap-3">
            {FEATURES.map(feature => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-5 bg-exp-navy border border-exp-border-dk rounded-card"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden>{feature.icon}</span>
                <div>
                  <h3 className="text-display-sm text-white">{feature.title}</h3>
                  <p className="text-body-sm text-exp-muted mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-exp-navy border border-exp-border-dk rounded-card p-6">
          <h2 className="text-display-sm text-white mb-3">Our Team</h2>
          <p className="text-body-md text-exp-muted leading-relaxed">
            PSL One is built by a team of South African football fans, engineers, and designers
            who are passionate about the game and technology. We are a product-led team focused
            on quality, performance, and the fan experience above all else.
          </p>
          <p className="text-body-sm text-exp-muted mt-3">
            We are growing. If you share our passion for football and technology, reach out at{' '}
            <a
              href="mailto:team@pslone.co.za"
              className="text-exp-gold underline hover:text-exp-gold-2 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
            >
              team@pslone.co.za
            </a>
          </p>
        </section>

        {/* Social */}
        <section aria-labelledby="social-heading">
          <h2 id="social-heading" className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">
            Follow Us
          </h2>
          <div className="flex flex-col gap-2">
            {SOCIAL_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                aria-label={`${link.label}: ${link.handle} (link placeholder — not yet active)`}
                className="flex items-center justify-between px-4 py-3 bg-exp-ink border border-exp-border-dk rounded-card-sm hover:border-exp-gold/30 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 min-h-[44px]"
              >
                <span className="text-body-md text-white">{link.label}</span>
                <span className="text-label-md text-exp-gold">{link.handle}</span>
              </Link>
            ))}
          </div>
          <p className="text-label-sm text-exp-muted mt-3 text-center">
            Social links are placeholders — accounts coming soon
          </p>
        </section>

        {/* Version info */}
        <div className="text-center py-2">
          <p className="text-label-sm text-exp-muted font-mono">
            PSL One Experience · v0.0.1 · Beta
          </p>
          <p className="text-label-sm text-exp-muted mt-1">
            <Link href="/terms" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm">Terms</Link>
            {' · '}
            <Link href="/privacy" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm">Privacy</Link>
            {' · '}
            <Link href="/help" className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold rounded-sm">Help</Link>
          </p>
        </div>
      </div>
    </FantasyShell>
  );
}
