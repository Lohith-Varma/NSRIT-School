import { AppTheme } from '@/constants/Theme';
import { StyleSheet, Text, View } from 'react-native';

interface CoordinatorPageHeaderProps {
  title: string;
  subtitle?: string;
}

export function CoordinatorPageHeader({ title, subtitle }: CoordinatorPageHeaderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: AppTheme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: AppTheme.textMuted,
  },
});
