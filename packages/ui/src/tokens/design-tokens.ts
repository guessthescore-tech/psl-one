export const PSL_COLORS = {
  primary: '#1B3A6B',    // PSL dark blue
  secondary: '#FFD700',  // Gold
  accent: '#E63946',     // Alert red
  surface: '#F8F9FA',
  background: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#6B7280',
} as const;

export const PSL_TIERS = {
  BRONZE: { color: '#CD7F32', label: 'Bronze' },
  SILVER: { color: '#C0C0C0', label: 'Silver' },
  GOLD: { color: '#FFD700', label: 'Gold' },
  PLATINUM: { color: '#E5E4E2', label: 'Platinum' },
  SUPERFAN: { color: '#1B3A6B', label: 'Superfan' },
} as const;
