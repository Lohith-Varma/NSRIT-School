import { adminShadow, AppTheme } from '@/constants/Theme';
import { sx } from '@/utils/styles';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export function AdminCard({
  children,
  style,
  accent,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: 'error' | 'secondary' | 'primary';
}) {
  return (
    <View
      style={sx(
        styles.card,
        accent === 'error' && styles.accentError,
        accent === 'secondary' && styles.accentSecondary,
        accent === 'primary' && styles.accentPrimary,
        style,
      )}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.admin.surfaceContainerLowest,
    borderRadius: AppTheme.radius.lg,
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.admin.surfaceContainerHighest,
    ...adminShadow.card,
  },
  accentError: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.danger,
  },
  accentSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.accent,
  },
  accentPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.primary,
  },
});
