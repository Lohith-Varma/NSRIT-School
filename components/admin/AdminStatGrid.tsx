import { AppTheme } from '@/constants/Theme';
import { AdminCard } from '@/components/admin/AdminCard';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export function AdminStatGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: string; tone?: 'default' | 'success' | 'error' | 'secondary' }[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <View style={[styles.grid, columns >= 3 && styles.grid3]}>
      {items.map((item) => (
        <AdminCard
          key={item.label}
          style={
            [
              styles.cell,
              item.tone === 'error' ? styles.statErrorBg : undefined,
              item.tone === 'secondary' ? styles.statSecondaryBg : undefined,
            ] as StyleProp<ViewStyle>
          }
          accent={
            item.tone === 'error' ? 'error' : item.tone === 'secondary' ? 'secondary' : undefined
          }>
          <Text style={styles.label}>{item.label}</Text>
          <Text
            style={[
              styles.value,
              item.tone === 'success' && { color: AppTheme.success },
              item.tone === 'error' && { color: AppTheme.danger },
              item.tone === 'secondary' && { color: AppTheme.accent },
            ]}>
            {item.value}
          </Text>
        </AdminCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  grid3: {},
  cell: {
    width: '47%',
    minWidth: 140,
  },
  label: {
    ...AppTheme.typography.label,
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: AppTheme.primary,
    marginTop: 6,
  },
  statErrorBg: {
    backgroundColor: AppTheme.admin.errorContainer,
  },
  statSecondaryBg: {
    backgroundColor: AppTheme.admin.secondaryContainer,
  },
});
