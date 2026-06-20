import Link from 'next/link';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { HelpCategoryList } from '@/components/account/HelpCategoryList';
import type { HelpCategory } from '@/components/account/HelpCategoryList';

const FAQ_CATEGORIES: HelpCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create a fantasy team?',
        answer:
          'Tap "Fantasy" in the bottom navigation, then select "Create Team". You will have a budget to spend on players across the tournament. Pick your starting XI plus four bench players. Your captain earns double points.',
        slug: 'create-fantasy-team',
      },
      {
        question: 'What is the points system?',
        answer:
          'Points are awarded for goals, assists, clean sheets, saves, and bonus points. Fantasy and prediction points are fan value only — no real money, no gambling. See the full points breakdown in the Fantasy section.',
        slug: 'points-system',
      },
      {
        question: 'How do transfers work?',
        answer:
          'You get a set number of free transfers each matchday. Transfers above your free allowance cost four points each. All transfers lock when the matchday deadline passes.',
        slug: 'how-transfers-work',
      },
    ],
  },
  {
    title: 'Fantasy Rules',
    items: [
      {
        question: 'What is the budget?',
        answer:
          'The default budget is 100m fantasy currency units. Prices reflect real-world form and popularity. Players can increase or decrease in price as the tournament progresses.',
        slug: 'fantasy-budget',
      },
      {
        question: 'How many players from one club can I pick?',
        answer:
          'You may select a maximum of three players from the same national team. This rule encourages a balanced squad and prevents single-team dominance.',
        slug: 'players-per-club',
      },
      {
        question: 'When is the transfer deadline?',
        answer:
          'Transfers lock at the matchday deadline — the time before the first match of each matchday kicks off. The exact deadline is shown in the Fantasy section and in any deadline reminder notifications you have enabled.',
        slug: 'transfer-deadline',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        question: 'How do I change my email?',
        answer:
          'Email changes require identity verification and will be available in a future release. If you need urgent help, contact support via the link below.',
        slug: 'change-email',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'On the sign-in page, tap "Forgot your password?" and enter your email. We will send a reset link. The link expires after 24 hours. If you do not receive it, check your spam folder.',
        slug: 'reset-password',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Account deletion requires POPIA-compliant identity verification. Go to Account → Delete Account to see what deletion entails. This feature will be available in a future release.',
        slug: 'delete-account',
      },
    ],
  },
  {
    title: 'Technical',
    items: [
      {
        question: 'The app is not loading. What should I do?',
        answer:
          'Try refreshing the page. If the problem persists: clear your browser cache, check your internet connection, and try a different browser. If live match data is delayed, this is usually a temporary issue with our data providers.',
        slug: 'app-not-loading',
      },
      {
        question: 'How do I report a bug?',
        answer:
          'Use the contact link below to send us a bug report. Please include: your device and browser version, the steps to reproduce the issue, and any error messages you saw.',
        slug: 'report-a-bug',
      },
    ],
  },
];

/**
 * /help — FAQ list
 * Static content — no API required.
 */
export default function HelpPage() {
  return (
    <FantasyShell
      title="Help &amp; FAQ"
      subtitle="Answers to common questions"
    >
      <HelpCategoryList categories={FAQ_CATEGORIES} />

      {/* Contact CTA */}
      <div className="mt-8 pt-6 border-t border-exp-border-dk text-center">
        <p className="text-body-sm text-exp-muted">
          Can&apos;t find what you&apos;re looking for?{' '}
          <Link
            href="mailto:support@pslone.co.za"
            className="text-exp-gold underline hover:text-exp-gold-2 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-sm"
          >
            Contact us →
          </Link>
        </p>
      </div>
    </FantasyShell>
  );
}
