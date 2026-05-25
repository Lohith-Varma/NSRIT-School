export const AppTheme = {
  primary: '#0F172A',     // Deep slate, rich and premium
  primaryLight: '#334155', 
  accent: '#4F46E5',      // Indigo accent, vibrant and modern
  background: '#F8FAFC',  // Light slate background
  surface: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
  present: '#10B981',
  absent: '#EF4444',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  principal: '#4F46E5',
  coordinator: '#8B5CF6',
  branchAdmin: '#F97316',
  mainAdmin: '#0F172A',
};

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
