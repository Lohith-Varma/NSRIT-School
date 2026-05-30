import { AppTheme } from '@/constants/Theme';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: AppTheme.spacing.md,
  },
  text: { flex: 1 },
  title: {
    ...AppTheme.typography.h1,
    fontSize: 26,
    color: AppTheme.primary,
  },
  subtitle: {
    ...AppTheme.typography.body,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
});
