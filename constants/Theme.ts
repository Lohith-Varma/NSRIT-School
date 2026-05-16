export const AppTheme = {
  primary: '#1e3a5f',
  primaryLight: '#2d5a8a',
  accent: '#0d9488',
  background: '#f4f6f9',
  surface: '#ffffff',
  text: '#1a1a2e',
  textMuted: '#64748b',
  border: '#e2e8f0',
  present: '#16a34a',
  absent: '#dc2626',
  danger: '#dc2626',
  warning: '#d97706',
  success: '#16a34a',
  principal: '#1e3a5f',
  coordinator: '#6d28d9',
  branchAdmin: '#9a3412',
  mainAdmin: '#0f172a',
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
