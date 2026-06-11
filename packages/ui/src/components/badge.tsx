import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#1B3A6B] text-white',
        secondary: 'bg-[#FFD700] text-[#1B3A6B]',
        bronze: 'bg-[#CD7F32] text-white',
        silver: 'bg-[#C0C0C0] text-gray-900',
        gold: 'bg-[#FFD700] text-gray-900',
        platinum: 'bg-[#E5E4E2] text-gray-900',
        superfan: 'bg-[#1B3A6B] text-[#FFD700]',
        live: 'bg-[#E63946] text-white animate-pulse',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
