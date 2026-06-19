'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Trophy } from '@phosphor-icons/react/dist/ssr';

interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

interface QuizShellProps {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
}

/**
 * Quiz question card with answer options, progress indicator, and score screen.
 * Client-side state only — no persistence. DESIGN_REVIEW_DATA.
 */
export function QuizShell({ title, questions }: QuizShellProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function handleNext() {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (isLast) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setDone(false);
  }

  if (done) {
    const fanPoints = score * 10;
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div
          className="w-20 h-20 rounded-full bg-exp-gold/20 flex items-center justify-center"
          aria-hidden
        >
          <Trophy size={40} className="text-exp-gold" weight="fill" aria-hidden />
        </div>
        <div>
          <h2 className="text-display-md text-white">Quiz Complete!</h2>
          <p className="text-body-lg text-exp-muted mt-2">
            You scored{' '}
            <strong className="text-exp-gold">{score}/{questions.length}</strong>
          </p>
          <p
            role="status"
            className="text-display-sm text-exp-gold mt-3 font-black"
          >
            +{fanPoints} Fan Points
          </p>
          <p className="text-label-sm text-exp-muted mt-1">Points only — no real money</p>
        </div>
        <button
          type="button"
          onClick={handleRestart}
          className="px-6 py-3 bg-exp-green text-white font-bold rounded-card-sm min-h-[44px] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          Play Again
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="text-label-lg text-exp-muted">
          Question {current + 1} of {questions.length}
        </p>
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Question ${current + 1} of ${questions.length}`}
        >
          {questions.map((_, i) => (
            <div
              key={i}
              aria-hidden
              className={clsx(
                'h-1 w-6 rounded-full transition-colors',
                i < current ? 'bg-exp-gold' : i === current ? 'bg-exp-gold/60' : 'bg-exp-border-dk',
              )}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-exp-ink border border-exp-border-dk rounded-card p-6">
        <p className="text-display-sm text-white leading-tight">{question.text}</p>
      </div>

      {/* Answer options */}
      <div
        className="flex flex-col gap-3"
        role="radiogroup"
        aria-label="Answer options"
      >
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrect = selected !== null && idx === question.correctIndex;
          const isWrong = isSelected && idx !== question.correctIndex;

          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={clsx(
                'w-full text-left px-4 py-4 rounded-card-sm border transition-all duration-150 text-body-md font-medium min-h-[44px]',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                selected === null
                  ? 'border-exp-border-dk bg-exp-ink text-white hover:border-exp-gold/50 hover:bg-exp-gold/5'
                  : isCorrect
                    ? 'border-exp-success bg-exp-success/10 text-exp-success'
                    : isWrong
                      ? 'border-exp-live bg-exp-live/10 text-exp-live'
                      : 'border-exp-border-dk bg-exp-ink/40 text-exp-muted',
              )}
            >
              <span className="mr-3 text-label-md text-exp-muted" aria-hidden>
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Next / Submit */}
      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full bg-exp-green text-white font-bold text-body-md rounded-card-sm py-3 min-h-[44px] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          {isLast ? 'Submit' : 'Next Question'}
        </button>
      )}
    </div>
  );
}
