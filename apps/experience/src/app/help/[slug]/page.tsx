import { notFound } from 'next/navigation';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { HelpArticle } from '@/components/account/HelpArticle';

interface ArticleData {
  title: string;
  content: string;
  related: { slug: string; title: string }[];
}

const ARTICLES: Record<string, ArticleData> = {
  'create-fantasy-team': {
    title: 'How to Create a Fantasy Team',
    content: `Creating your fantasy team is simple and free.\n\n1. Tap "Fantasy" in the bottom navigation bar.\n2. Select "Create Team" from the fantasy hub.\n3. You start with a budget of 100m fantasy currency units. Use it wisely.\n4. Pick 15 players: 1 goalkeeper, 4 defenders, 4 midfielders, and 3 forwards — plus 4 bench players.\n5. You may select a maximum of 3 players from the same national team.\n6. Choose a captain (earns double points) and a vice-captain (earns double points if your captain does not play).\n7. Confirm your team before the first matchday deadline.\n\nGood luck — may the points be with you!`,
    related: [
      { slug: 'points-system', title: 'What is the points system?' },
      { slug: 'how-transfers-work', title: 'How do transfers work?' },
      { slug: 'fantasy-budget', title: 'What is the budget?' },
    ],
  },
  'points-system': {
    title: 'Fantasy Points System',
    content: `Fantasy and prediction points are fan value only — no real money, no gambling.\n\nGoalkeeper & Defender:\n- Playing 60+ minutes: 2 pts\n- Clean sheet: 4 pts\n- Goal scored: 6 pts\n- Assist: 3 pts\n- Penalty save: 5 pts\n\nMidfielder:\n- Playing 60+ minutes: 2 pts\n- Goal scored: 5 pts\n- Assist: 3 pts\n- Clean sheet: 1 pt\n\nForward:\n- Playing 60+ minutes: 2 pts\n- Goal scored: 4 pts\n- Assist: 3 pts\n\nAll positions:\n- Yellow card: -1 pt\n- Red card: -3 pts\n- Own goal: -2 pts\n- Bonus points awarded to top 3 performers each match\n\nCaptain multiplier: 2× all points earned.`,
    related: [
      { slug: 'create-fantasy-team', title: 'How to create a fantasy team' },
      { slug: 'how-transfers-work', title: 'How do transfers work?' },
    ],
  },
  'how-transfers-work': {
    title: 'How Transfers Work',
    content: `Transfers let you change players in your squad between matchdays.\n\nFree transfers:\nYou receive a set number of free transfers each matchday (usually 1–2, depending on the competition configuration). Unused free transfers carry over — up to a maximum of 5.\n\nExtra transfers:\nAdditional transfers beyond your free allowance cost 4 points each. Use them wisely.\n\nDeadline lock:\nAll transfers lock at the matchday deadline — the moment before the first match of the matchday kicks off. You cannot make changes after the deadline until the next window opens.\n\nPrice changes:\nPlayer prices fluctuate based on ownership and form. Selling at the right time can free up budget for better picks.`,
    related: [
      { slug: 'transfer-deadline', title: 'When is the transfer deadline?' },
      { slug: 'players-per-club', title: 'How many players per club?' },
    ],
  },
  'fantasy-budget': {
    title: 'Fantasy Budget',
    content: `You start with a budget of 100m fantasy currency units.\n\nThis budget is used to build your initial 15-player squad. Player prices reflect their real-world form, popularity, and tournament status.\n\nPlayer prices can rise or fall during the tournament based on ownership trends and performance. Selling a player before their price drops is a good strategy.\n\nIf a player's price rises after you buy them, you may earn a profit when you sell — but gains are subject to the selling price rules (profit is capped at 50% of the price rise until the player is held for a full matchday).`,
    related: [
      { slug: 'create-fantasy-team', title: 'How to create a fantasy team' },
      { slug: 'players-per-club', title: 'How many players per club?' },
    ],
  },
  'players-per-club': {
    title: 'Players Per Club Rule',
    content: `You may select a maximum of 3 players from any single national team in your 15-player squad.\n\nThis rule applies across your starting XI and bench combined.\n\nThe rule is designed to:\n- Encourage a diverse, well-balanced squad\n- Prevent unfair advantage if one team has an easy run of fixtures\n- Keep the game interesting across the full tournament\n\nIf a player you own is moved between squads or withdraws from the tournament, you will receive a free replacement transfer.`,
    related: [
      { slug: 'create-fantasy-team', title: 'How to create a fantasy team' },
      { slug: 'fantasy-budget', title: 'What is the budget?' },
    ],
  },
  'transfer-deadline': {
    title: 'Transfer Deadline',
    content: `Transfers lock at the matchday deadline — the moment before the first match of each matchday kicks off.\n\nYou can see the exact deadline countdown in the Fantasy section. We also send deadline reminder notifications if you have them enabled (see Account → Notifications).\n\nAfter the deadline:\n- Your squad is locked for that matchday\n- You cannot change your captain or formation\n- The next transfer window opens after all matchday fixtures are complete\n\nTip: Make your transfers early to avoid missing the deadline due to connection issues.`,
    related: [
      { slug: 'how-transfers-work', title: 'How do transfers work?' },
      { slug: 'points-system', title: 'Points system' },
    ],
  },
  'change-email': {
    title: 'How to Change Your Email',
    content: `Email changes require identity verification to protect your account.\n\nThis feature will be available in a future release of PSL One.\n\nIn the meantime, if you urgently need to update your email address, please contact us directly at support@pslone.co.za and we will assist you manually.`,
    related: [
      { slug: 'reset-password', title: 'How to reset your password' },
      { slug: 'delete-account', title: 'How to delete your account' },
    ],
  },
  'reset-password': {
    title: 'How to Reset Your Password',
    content: `If you have forgotten your password, follow these steps:\n\n1. Go to the sign-in page (/sign-in)\n2. Tap "Forgot your password?" below the sign-in form\n3. Enter your email address and tap "Send Reset Link"\n4. Check your inbox for an email from PSL One (check spam if not received within 2 minutes)\n5. Click the link in the email — it will take you to a page where you can set a new password\n6. The reset link expires after 24 hours\n\nIf you can access your account but want to change your password, go to Account → Security. Note: in-session password change requires a backend API that is coming soon.`,
    related: [
      { slug: 'change-email', title: 'How to change your email' },
      { slug: 'delete-account', title: 'How to delete your account' },
    ],
  },
  'delete-account': {
    title: 'How to Delete Your Account',
    content: `Account deletion is a permanent action and cannot be undone.\n\nDeletion removes:\n- All personal data from PSL One systems\n- Your fantasy teams and transfer history\n- All predictions and leaderboard records\n- Achievements, badges, and fan value balance\n- All notification subscriptions\n\nPOPIA compliance:\nAccount deletion on PSL One complies with the Protection of Personal Information Act (POPIA). You have the right to request erasure of your personal data. Identity verification is required before deletion to prevent unauthorised account removal.\n\nThis feature will be available in a future release. In the meantime, go to Account → Delete Account to see the full details and to be notified when this feature launches.`,
    related: [
      { slug: 'change-email', title: 'How to change your email' },
      { slug: 'reset-password', title: 'How to reset your password' },
    ],
  },
  'app-not-loading': {
    title: 'App Not Loading',
    content: `If PSL One is not loading or behaving unexpectedly, try these steps:\n\n1. Refresh the page (pull to refresh on mobile)\n2. Clear your browser cache and cookies, then reload\n3. Check your internet connection — switch between Wi-Fi and mobile data to test\n4. Try a different browser (Chrome, Firefox, Safari)\n5. Disable browser extensions that might block scripts\n6. If live match data is delayed, this is usually a temporary issue with our real-time data providers — it will resolve within a few minutes\n\nIf the problem persists after trying all the above, please report it using the contact link on the Help page.`,
    related: [
      { slug: 'report-a-bug', title: 'How to report a bug' },
    ],
  },
  'report-a-bug': {
    title: 'How to Report a Bug',
    content: `We appreciate bug reports — they help us improve PSL One for everyone.\n\nTo report a bug, email us at support@pslone.co.za with the following information:\n\n1. Device: phone/tablet/desktop, operating system and version\n2. Browser: name and version (e.g. Chrome 124)\n3. Steps to reproduce: what you did before the bug appeared\n4. Expected result: what you expected to happen\n5. Actual result: what happened instead\n6. Screenshot or screen recording (if possible)\n\nWe will acknowledge your report within 48 hours and keep you updated on any fix.`,
    related: [
      { slug: 'app-not-loading', title: 'App not loading' },
    ],
  },
};

function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * /help/[slug] — Individual help article
 * Static content mapped from known slugs.
 */
export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    // Unknown slug — show 404-style state
    return (
      <FantasyShell
        title={prettifySlug(slug)}
        back={{ href: '/help', label: 'Help' }}
      >
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-body-md text-exp-muted">
            This article could not be found.
          </p>
          <p className="text-body-sm text-exp-muted">
            Try searching the{' '}
            <a href="/help" className="text-exp-gold underline hover:text-exp-gold-2">
              Help page
            </a>{' '}
            for what you need.
          </p>
        </div>
      </FantasyShell>
    );
  }

  return (
    <FantasyShell back={{ href: '/help', label: 'Help' }}>
      <HelpArticle
        title={article.title}
        content={article.content}
        related={article.related}
      />
    </FantasyShell>
  );
}

export function generateStaticParams() {
  return Object.keys(ARTICLES).map(slug => ({ slug }));
}
