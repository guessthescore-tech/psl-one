'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface OnboardingStepProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function OnboardingStep({ currentStep, totalSteps, stepLabels }: OnboardingStepProps) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {/* Dot indicators */}
      <div className="flex items-center gap-2" aria-label={`Step ${currentStep} of ${totalSteps}`} role="status">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isActive = i + 1 === currentStep;
          const isDone = i + 1 < currentStep;
          return (
            <motion.div
              key={i}
              className={`rounded-pill transition-all ${
                isActive ? 'w-8 h-2.5 bg-exp-gold' :
                isDone   ? 'w-2.5 h-2.5 bg-exp-green' :
                'w-2.5 h-2.5 bg-exp-border-dk'
              }`}
              animate={reduce ? {} : { width: isActive ? 32 : 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}
      </div>

      {/* Label */}
      {stepLabels && stepLabels[currentStep - 1] && (
        <p className="text-label-md text-exp-muted">
          Step {currentStep} of {totalSteps} — {stepLabels[currentStep - 1]}
        </p>
      )}
    </div>
  );
}
