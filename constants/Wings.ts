import type { Wing } from '@/types';

export const WING_LABELS: Record<Wing, string> = {
  primary: 'Primary Wing',
  secondary: 'Secondary Wing',
  higher_secondary: 'Higher Secondary Wing',
};

export const WING_SHORT_LABELS: Record<Wing, string> = {
  primary: 'PRI',
  secondary: 'SEC',
  higher_secondary: 'HS',
};

export function formatWing(wing: Wing): string {
  return WING_LABELS[wing];
}

export function formatWingShort(wing: Wing): string {
  return WING_SHORT_LABELS[wing];
}

export const WINGS: Wing[] = ['primary', 'secondary', 'higher_secondary'];