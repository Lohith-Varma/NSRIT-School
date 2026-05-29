import { AppTheme } from '@/constants/Theme';
import { StyleSheet, Text, View } from 'react-native';

type Variant = 'present' | 'absent' | 'enrolled' | 'on_leave' | 'issue' | 'active' | 'inactive' | 'archived' | 'paid' | 'pending';

const CONFIG: Record<Variant, { bg: string; fg: string; label: string }> = {
  present: { bg: AppTheme.admin.secondaryContainer, fg: AppTheme.admin.onSecondaryContainer, label: 'Present' },
  absent: { bg: AppTheme.admin.errorContainer, fg: AppTheme.admin.onErrorContainer, label: 'Absent' },
  enrolled: { bg: '#dcfce7', fg: '#166534', label: 'Enrolled' },
  on_leave: { bg: '#ffedd5', fg: '#9a3412', label: 'On Leave' },
  issue: { bg: AppTheme.admin.errorContainer, fg: AppTheme.admin.error, label: 'Issue' },
  active: { bg: '#dcfce7', fg: '#166534', label: 'Active' },
  inactive: { bg: AppTheme.admin.surfaceVariant, fg: AppTheme.admin.onSurfaceVariant, label: 'Inactive' },
  archived: { bg: '#ffedd5', fg: '#9a3412', label: 'Archived' },
  paid: { bg: '#dcfce7', fg: '#166534', label: 'Paid' },
  pending: { bg: AppTheme.admin.errorContainer, fg: AppTheme.admin.onErrorContainer, label: 'Pending' },
};

export function StatusBadge({ variant, label }: { variant: Variant; label?: string }) {
  const c = CONFIG[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{label ?? c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  text: { fontSize: 11, fontWeight: '600' },
});
