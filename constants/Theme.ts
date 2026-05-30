export const AppTheme = {
  // Primary Brand
  primary: '#000666',
  primaryLight: '#1A237E',

  // Accent
  accent: '#006A60',

  // Backgrounds
  background: '#F7F9FC',
  surface: '#FFFFFF',

  // Text
  text: '#191C1E',
  textMuted: '#454652',

  // Borders
  border: '#C6C5D4',

  // Status
  present: '#2E7D32',
  absent: '#BA1A1A',

  danger: '#BA1A1A',
  warning: '#F9A825',
  success: '#2E7D32',

  // Role Colors
  principal: '#1A237E',
  coordinator: '#6D28D9',
  branchAdmin: '#9A3412',
  mainAdmin: '#0F172A',

  // Dashboard Colors
  secondary: '#67D9C9',
  secondaryContainer: '#85F6E5',

  // Surface Variants
  surfaceContainer: '#ECEEF1',
  surfaceVariant: '#E0E3E6',

  // Outline
  outline: '#767683',

  // White / Black
  white: '#FFFFFF',
  black: '#000000',

  // Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Admin portal (Stitch design tokens)
  admin: {
    primary: '#000666',
    onPrimary: '#FFFFFF',
    primaryContainer: '#1A237E',
    onPrimaryContainer: '#8690EE',
    primaryFixed: '#E0E0FF',
    onPrimaryFixed: '#000767',
    primaryFixedDim: '#BDC2FF',
    secondary: '#006A60',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#85F6E5',
    onSecondaryContainer: '#007166',
    secondaryFixed: '#85F6E5',
    secondaryFixedDim: '#67D9C9',
    tertiary: '#181B23',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#2C3039',
    onTertiaryContainer: '#9597A2',
    surface: '#F7F9FC',
    onSurface: '#191C1E',
    onSurfaceVariant: '#454652',
    surfaceContainer: '#ECEEF1',
    surfaceContainerLow: '#F2F4F7',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerHigh: '#E6E8EB',
    surfaceContainerHighest: '#E0E3E6',
    surfaceVariant: '#E0E3E6',
    outline: '#767683',
    outlineVariant: '#C6C5D4',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#93000A',
    inverseSurface: '#2D3133',
    inverseOnSurface: '#EFF1F4',
    shadow: 'rgba(26, 35, 126, 0.08)',
    shadowStrong: 'rgba(26, 35, 126, 0.12)',
  },

  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
    h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 31 },
    h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    label: { fontSize: 13, fontWeight: '500' as const, lineHeight: 16 },
    labelMd: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.6 },
  },
};

export const adminShadow = {
  card: {
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  cardStrong: {
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 6,
  },
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