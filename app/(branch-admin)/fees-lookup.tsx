import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { StatusBadge } from '@/components/branch-admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { lookupBranchFees } from '@/services/api';
import type { BranchFeeLookupSummary } from '@/types/branchAdmin';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const FEE_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  tuition: 'school',
  library: 'library-books',
  transport: 'directions-bus',
  admission: 'badge',
  other: 'receipt-long',
};

export default function FeeLookupScreen() {
  const actor = useActor();
  const [roll, setRoll] = useState('ADM-2024-089');
  const [summary, setSummary] = useState<BranchFeeLookupSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      setSummary(await lookupBranchFees(actor, roll));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader title="Fee Management" subtitle="Look up and record student payments." />
      <AdminCard>
        <FormField label="Student Roll Number" value={roll} onChangeText={setRoll} placeholder="e.g. ADM-2024-089" />
        <Button title="Fetch Records" onPress={search} />
      </AdminCard>
      {summary ? (
        <>
          <View style={styles.stats}>
            <AdminCard style={styles.paidCard}>
              <Text style={styles.statLabel}>Total Paid</Text>
              <Text style={styles.paidValue}>{formatCurrency(summary.paid)}</Text>
            </AdminCard>
            <AdminCard style={styles.dueCard}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.dueValue}>{formatCurrency(summary.due)}</Text>
            </AdminCard>
          </View>
          {summary.nextDueDate ? (
            <AdminCard style={styles.dueBanner}>
              <View>
                <Text style={styles.dueBannerLabel}>Upcoming Due Date</Text>
                <Text style={styles.dueBannerDate}>{summary.nextDueDate}</Text>
                <Text style={styles.dueBannerSub}>{summary.nextDueLabel}</Text>
              </View>
              <MaterialIcons name="event" size={36} color={AppTheme.admin.onPrimaryContainer} />
            </AdminCard>
          ) : null}
          <Text style={styles.section}>Fee Breakdown</Text>
          {summary.breakdown.map((item) => (
            <AdminCard key={item.id} style={styles.feeRow}>
              <View style={styles.feeIcon}>
                <MaterialIcons
                  name={FEE_ICONS[item.icon] ?? 'receipt-long'}
                  size={22}
                  color={item.status === 'paid' ? '#2e7d32' : AppTheme.admin.error}
                />
              </View>
              <View style={styles.feeInfo}>
                <Text style={styles.feeLabel}>{item.label}</Text>
                <Text style={styles.feeAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              <StatusBadge variant={item.status === 'paid' ? 'paid' : 'pending'} />
            </AdminCard>
          ))}
          <AdminCard style={styles.recordCard}>
            <MaterialIcons name="payments" size={32} color={AppTheme.admin.onPrimary} />
            <Text style={styles.recordTitle}>Record New Payment</Text>
            <Text style={styles.recordDesc}>Log a transaction to update student financial records.</Text>
            <Button title="Enter Payment Details" onPress={() => {}} />
          </AdminCard>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 12 },
  paidCard: { flex: 1, borderLeftWidth: 4, borderLeftColor: '#2e7d32' },
  dueCard: { flex: 1, borderLeftWidth: 4, borderLeftColor: AppTheme.admin.error },
  statLabel: { fontSize: 10, fontWeight: '600', color: AppTheme.admin.onSurfaceVariant, textTransform: 'uppercase' },
  paidValue: { fontSize: 22, fontWeight: '700', color: '#2e7d32' },
  dueValue: { fontSize: 22, fontWeight: '700', color: AppTheme.admin.error },
  dueBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppTheme.admin.primaryContainer,
  },
  dueBannerLabel: { fontSize: 10, color: AppTheme.admin.onPrimaryContainer, textTransform: 'uppercase' },
  dueBannerDate: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 4 },
  dueBannerSub: { color: AppTheme.admin.onPrimaryContainer, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.primary, marginVertical: 12 },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feeIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: AppTheme.admin.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  feeInfo: { flex: 1 },
  feeLabel: { fontWeight: '600', color: AppTheme.admin.onSurface },
  feeAmount: { fontSize: 13, color: AppTheme.admin.onSurfaceVariant },
  recordCard: { alignItems: 'center', padding: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: `${AppTheme.admin.primary}33` },
  recordTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  recordDesc: { textAlign: 'center', color: AppTheme.admin.onSurfaceVariant, marginVertical: 12 },
});
