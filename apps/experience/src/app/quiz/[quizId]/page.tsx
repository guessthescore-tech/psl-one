import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { QuizShell } from '@/components/account/QuizShell';

const QUIZ_TITLES: Record<string, string> = {
  'psl-trivia': 'PSL Trivia Challenge',
  'wc-trivia': 'World Cup 2026 Trivia',
  'football-history': 'Football History Quiz',
};

const MOCK_QUESTIONS = [
  {
    text: 'Which club has won the most PSL titles?',
    options: ['Orlando Pirates', 'Mamelodi Sundowns', 'Kaizer Chiefs', 'SuperSport United'],
    correctIndex: 1,
  },
  {
    text: 'When was the PSL (Premier Soccer League) founded?',
    options: ['1992', '1996', '2000', '2004'],
    correctIndex: 1,
  },
  {
    text: 'What colour are the Mamelodi Sundowns shirts?',
    options: ['Red', 'Blue', 'Yellow', 'Green'],
    correctIndex: 2,
  },
];

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

/**
 * /quiz/[quizId] — Quiz shell
 * DESIGN_REVIEW_DATA only. Client-side state, no persistence.
 * Points only — no real money.
 */
export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;
  const title = QUIZ_TITLES[quizId] ?? 'Quiz Challenge';

  return (
    <FantasyShell
      title={title}
      subtitle="Points only — no real money"
    >
      <div
        role="note"
        className="mb-4 text-xs text-center text-purple-300 bg-purple-900/40 border border-purple-700/40 rounded-card-xs px-3 py-2 font-mono"
      >
        DESIGN_REVIEW_DATA — Quiz model not yet built. Score is client-side only.
      </div>

      <QuizShell
        quizId={quizId}
        title={title}
        questions={MOCK_QUESTIONS}
      />
    </FantasyShell>
  );
}

export function generateStaticParams() {
  return Object.keys(QUIZ_TITLES).map(quizId => ({ quizId }));
}
