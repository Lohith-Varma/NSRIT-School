import type { Wing } from '@/types';

export const WING_LABELS: Record<Wing, string> = {
  primary: 'Primary Wing',
  secondary: 'Secondary Wing',
  higher_secondary: 'Higher Secondary Wing',
};

export function formatWing(wing: Wing): string {
  return WING_LABELS[wing];
}
