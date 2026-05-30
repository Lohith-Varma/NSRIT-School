import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getFinancialMonitoring } from '@/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BranchFeeTransaction, BranchFinancialMetrics, BranchGradeFeeBar } from '@/types/branchAdmin';

export default function FinancialMonitoringScreen() {
  const actor = useActor();
  const router = useRouter();
  const [metrics, setMetrics] = useState<BranchFinancialMetrics | null>(null);
  const [bars, setBars] = useState<BranchGradeFeeBar[]>([]);
  const [txns, setTxns] = useState<BranchFeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinancialMonitoring(actor)
      .then((d) => {
        setMetrics(d.metrics);
        setBars(d.gradeBars);
        setTxns(d.transactions);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Financial Monitoring"
        subtitle="Local branch fee collections and dues tracking."
        action={
          <View style={styles.actions}>
            <Pressable style={styles.outlineBtn}>
              <MaterialIcons name="download" size={18} color={AppTheme.admin.onSurface} />
              <Text style={styles.outlineBtnText}>Export</Text>
            </Pressable>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push('/(branch-admin)/fees-lookup' as never)}>
              <MaterialIcons name="add" size={18} color={AppTheme.admin.onPrimary} />
              <Text style={styles.primaryBtnText}>Record Payment</Text>
            </Pressable>
          </View>
        }
      />
      {metrics ? (
        <AdminStatGrid
          items={[
            { label: 'Pending Dues', value: formatCurrency(metrics.pendingDues), tone: 'error' },
            { label: 'Collected (YTD)', value: formatCurrency(metrics.collectedYtd), tone: 'secondary' },
          ]}
        />
      ) : null}
      {metrics ? (
        <AdminCard style={styles.goalCard}>
          <Text style={styles.goalLabel}>Collection Goal</Text>
          <Text style={styles.goalPct}>{metrics.collectionGoalPercent}%</Text>
          <Text style={styles.goalTarget}>Target: {formatCurrency(metrics.collectionTarget)}</Text>
        </AdminCard>
      ) : null}
      <AdminCard>
        <Text style={styles.chartTitle}>Fee Collection by Grade</Text>
        <View style={styles.chart}>
          {bars.map((b) => (
            <View key={b.grade} style={styles.barCol}>
              <View style={styles.barStack}>
                <View style={[styles.barCollected, { flex: b.collectedPercent }]} />
                <View style={[styles.barPending, { flex: b.pendingPercent }]} />
              </View>
              <Text style={styles.barLabel}>{b.grade}</Text>
            </View>
          ))}
        </View>
      </AdminCard>
      <AdminCard>
        <View style={styles.txnHead}>
          <Text style={styles.chartTitle}>Recent Transactions</Text>
          <Pressable>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>
        {txns.map((t) => (
          <View key={t.id} style={styles.txnRow}>
            <View style={styles.txnAvatar}>
              <Text style={styles.txnInitials}>{t.initials}</Text>
            </View>
            <View style={styles.txnInfo}>
              <Text style={styles.txnName}>{t.studentName}</Text>
              <Text style={styles.txnMethod}>{t.method}</Text>
            </View>
            <View>
              <Text style={styles.txnAmount}>+{formatCurrency(t.amount)}</Text>
              <Text style={styles.txnTime}>{t.time}</Text>
            </View>
          </View>
        ))}
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: AppTheme.admin.outlineVariant,
    borderRadius: 8,
  },
  outlineBtnText: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.onSurface },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppTheme.admin.primary,
    borderRadius: 8,
  },
  primaryBtnText: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.onPrimary },
  goalCard: { alignItems: 'center', backgroundColor: AppTheme.admin.primaryContainer },
  goalLabel: { color: AppTheme.admin.primaryFixedDim, fontSize: 12, textTransform: 'uppercase' },
  goalPct: { fontSize: 36, fontWeight: '700', color: AppTheme.admin.onPrimary, marginVertical: 8 },
  goalTarget: { color: AppTheme.admin.primaryFixed, fontSize: 12 },
  chartTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.onSurface, marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 200, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  barStack: { flexDirection: 'row', width: '100%', height: 160, alignItems: 'flex-end', gap: 2 },
  barCollected: { backgroundColor: AppTheme.admin.secondaryFixedDim, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  barPending: { backgroundColor: AppTheme.admin.errorContainer, borderTopLeftRadius: 4, borderTopRightRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 11, color: AppTheme.admin.onSurfaceVariant, marginTop: 8 },
  txnHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAll: { color: AppTheme.admin.primary, fontWeight: '600', fontSize: 13 },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  txnAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppTheme.admin.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnInitials: { fontWeight: '700', color: AppTheme.admin.primaryFixed },
  txnInfo: { flex: 1 },
  txnName: { fontWeight: '600', color: AppTheme.admin.onSurface },
  txnMethod: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant },
  txnAmount: { fontWeight: '600', color: AppTheme.admin.secondary, textAlign: 'right' },
  txnTime: { fontSize: 11, color: AppTheme.admin.onSurfaceVariant, textAlign: 'right' },
});
