const tintColorLight = '#000666';
const tintColorDark = '#BDC2FF';

export default {
  light: {
    // Core
    text: '#191C1E',
    background: '#F7F9FC',
    surface: '#FFFFFF',

    // Brand
    primary: '#000666',
    primaryContainer: '#1A237E',
    secondary: '#006A60',
    accent: '#4C56AF',

    // UI
    tint: tintColorLight,
    border: '#C6C5D4',
    outline: '#767683',

    // Navigation
    tabIconDefault: '#767683',
    tabIconSelected: tintColorLight,

    // Status
    success: '#2E7D32',
    warning: '#F9A825',
    error: '#BA1A1A',

    // Containers
    card: '#FFFFFF',
    surfaceContainer: '#ECEEF1',
    surfaceVariant: '#E0E3E6',
  },

  dark: {
    // Core
    text: '#FFFFFF',
    background: '#121212',
    surface: '#1E1E1E',

    // Brand
    primary: '#BDC2FF',
    primaryContainer: '#343D96',
    secondary: '#67D9C9',
    accent: '#8690EE',

    // UI
    tint: tintColorDark,
    border: '#2C2C2C',
    outline: '#888888',

    // Navigation
    tabIconDefault: '#888888',
    tabIconSelected: tintColorDark,

    // Status
    success: '#81C784',
    warning: '#FFD54F',
    error: '#EF5350',

    // Containers
    card: '#1E1E1E',
    surfaceContainer: '#2A2A2A',
    surfaceVariant: '#333333',
  },
};