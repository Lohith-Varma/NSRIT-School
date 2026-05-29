import type { ParentChildSummary } from '@/types';

export function childInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function childGradeLabel(child: ParentChildSummary): string {
  if (child.className) {
    return `Grade ${child.grade} · ${child.className}`;
  }
  return `Grade ${child.grade}`;
}
