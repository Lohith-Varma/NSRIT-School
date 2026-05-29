import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { lookupStudentFees } from '@/services/api';
import type { AdminFeeStudentSummary } from '@/types/admin';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

const FEE_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  tuition: 'book',
  transport: 'bus',
  admission: 'id-card',
  other: 'file',
};

export function FeeTrackingScreen() {
  const actor = useActor();
  const [studentId, setStudentId] = useState('STU-1024');
  const [summary, setSummary] = useState<AdminFeeStudentSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const result = await lookupStudentFees(actor, studentId);
      setSummary(result);
      if (!result) Alert.alert('Not found', 'No student matched that ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader title="Fee Tracking" subtitle="Look up student fee status and generate receipts." />

      <View style={styles.searchRow}>
        <FontAwesome name="search" size={16} color={AppTheme.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={studentId}
          onChangeText={setStudentId}
          placeholder="Enter Student ID (e.g., STU-1024)"
          placeholderTextColor={AppTheme.textMuted}
        />
      </View>
      <Button title="Lookup Student" onPress={search} />

      {summary ? (
        <>
          <AdminCard style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitials}>
                  {summary.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{summary.name}</Text>
                <Text style={styles.profileMeta}>
                  Class: {summary.grade} | Roll No: {summary.rollNo}
                </Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>{summary.status.toUpperCase()}</Text>
              </View>
            </View>
          </AdminCard>

          <AdminStatGrid
            items={[
              { label: 'Total', value: formatCurrency(summary.totalFee) },
              { label: 'Paid', value: formatCurrency(summary.paid), tone: 'success' },
              { label: 'Due', value: formatCurrency(summary.due), tone: 'error' },
            ]}
          />

          <AdminCard>
            <Text style={styles.breakdownTitle}>Breakdown · AY 2024-25</Text>
            {summary.breakdown.map((line) => (
              <View key={line.id} style={styles.feeLine}>
                <View style={styles.feeIcon}>
                  <FontAwesome
                    name={FEE_ICONS[line.icon] ?? 'file'}
                    size={18}
                    color={AppTheme.textMuted}
                  />
                </View>
                <View style={styles.feeInfo}>
                  <Text style={styles.feeLabel}>{line.label}</Text>
                  {line.dueDate ? <Text style={styles.feeDue}>Due: {line.dueDate}</Text> : null}
                </View>
                <View style={styles.feeRight}>
                  <Text style={styles.feeAmount}>{formatCurrency(line.amount)}</Text>
                  <Text
                    style={[
                      styles.feeStatus,
                      line.status === 'paid' ? styles.paid : styles.pending,
                    ]}>
                    {line.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </AdminCard>

          <Button
            title="Generate Fee Receipt"
            onPress={() => Alert.alert('Receipt', 'PDF receipt generation queued.')}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: AppTheme.radius.lg,
    backgroundColor: AppTheme.surface,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12, color: AppTheme.text },
  profileCard: { marginTop: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppTheme.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: { fontWeight: '700', color: AppTheme.primary, fontSize: 18 },
  profileName: { fontSize: 18, fontWeight: '600', color: AppTheme.text },
  profileMeta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 2 },
  activeTag: {
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagText: { fontSize: 11, fontWeight: '700', color: AppTheme.admin.onPrimaryContainer },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  feeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: AppTheme.admin.surfaceContainerHigh,
    gap: 12,
  },
  feeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: AppTheme.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeInfo: { flex: 1 },
  feeLabel: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  feeDue: { fontSize: 12, color: AppTheme.textMuted, marginTop: 2 },
  feeRight: { alignItems: 'flex-end' },
  feeAmount: { fontSize: 16, fontWeight: '700', color: AppTheme.text },
  feeStatus: { fontSize: 10, fontWeight: '700', marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  paid: { backgroundColor: '#E8F5E9', color: AppTheme.success },
  pending: { backgroundColor: AppTheme.admin.errorContainer, color: AppTheme.admin.onErrorContainer },
});
