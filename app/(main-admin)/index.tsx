import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { getNetworkInsights, listBranches } from '@/services/api';
import type { Branch, NetworkInsights } from '@/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const QUICK_LINKS = [
  { href: '/(main-admin)/security' as const, label: 'Security Center', icon: 'shield' as const, color: AppTheme.danger },
  { href: '/(main-admin)/audit-logs' as const, label: 'Audit Logs', icon: 'history' as const, color: AppTheme.primary },
  { href: '/(main-admin)/notifications' as const, label: 'Notifications', icon: 'bell' as const, color: AppTheme.accent },
  { href: '/(main-admin)/users' as const, label: 'User & Roles', icon: 'users' as const, color: AppTheme.primary },
  { href: '/(main-admin)/fees' as const, label: 'Fee Tracking', icon: 'credit-card' as const, color: AppTheme.accent },
  { href: '/(main-admin)/profile' as const, label: 'Profile', icon: 'user' as const, color: AppTheme.textMuted },
];

export default function MainAdminDashboard() {
  const actor = useActor();
  const router = useRouter();
  const { selectedBranchFocusId, setSelectedBranchFocusId } = useAuth();
  const [insights, setInsights] = useState<NetworkInsights | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [net, br] = await Promise.all([getNetworkInsights(actor), listBranches(actor)]);
      setInsights(net);
      setBranches(br);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const focused = selectedBranchFocusId
    ? insights?.byBranch.find((b) => b.branchId === selectedBranchFocusId)
    : null;

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Dashboard Overview"
        subtitle="Welcome back. Here is the latest global summary."
      />

      {insights ? (
        <>
          <AdminStatGrid
            items={[
              { label: 'Total Branches', value: String(insights.totalBranches) },
              { label: 'Total Students', value: insights.totalStudents.toLocaleString() },
              { label: 'Total Staff', value: String(insights.totalTeachers) },
              {
                label: 'Global Revenue',
                value: formatCurrency(insights.totalFeesCollected + insights.totalFeesOutstanding),
              },
            ]}
          />

          <AdminCard style={styles.pendingCard}>
            <View style={styles.pendingHeader}>
              <FontAwesome name="warning" size={18} color="#fff" />
              <Text style={styles.pendingTitle}>Pending Fees</Text>
              <Pressable onPress={() => router.push('/(main-admin)/fees' as never)}>
                <Text style={styles.pendingLink}>View All</Text>
              </Pressable>
            </View>
            <Text style={styles.pendingAmount}>{formatCurrency(insights.totalFeesOutstanding)}</Text>
            <Text style={styles.pendingSub}>Across all branches this semester.</Text>
          </AdminCard>
        </>
      ) : null}

      <Text style={styles.section}>Branch switcher</Text>
      <View style={styles.chips}>
        <Pressable
          style={[styles.chip, !selectedBranchFocusId && styles.chipActive]}
          onPress={() => setSelectedBranchFocusId(null)}>
          <Text style={[styles.chipText, !selectedBranchFocusId && styles.chipTextActive]}>All branches</Text>
        </Pressable>
        {branches.map((b) => (
          <Pressable
            key={b.id}
            style={[styles.chip, selectedBranchFocusId === b.id && styles.chipActive]}
            onPress={() => setSelectedBranchFocusId(b.id)}>
            <Text style={[styles.chipText, selectedBranchFocusId === b.id && styles.chipTextActive]}>
              {b.code}
              {!b.active ? ' (off)' : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      {focused ? (
        <AdminCard>
          <Text style={styles.focusTitle}>Focused: {focused.branchName}</Text>
          <Text style={styles.meta}>
            {focused.studentCount} students · {focused.teacherCount} teachers · {focused.classCount}{' '}
            classes
          </Text>
          <Text style={styles.meta}>{focused.attendanceRate}% attendance</Text>
          <Text style={styles.meta}>
            {formatCurrency(focused.feesCollected)} collected ·{' '}
            {formatCurrency(focused.feesOutstanding)} outstanding
          </Text>
        </AdminCard>
      ) : null}

      <Text style={styles.section}>Admin modules</Text>
      <View style={styles.linkGrid}>
        {QUICK_LINKS.map((link) => (
          <Pressable key={link.href} style={styles.linkCard} onPress={() => router.push(link.href as never)}>
            <FontAwesome name={link.icon} size={20} color={link.color} />
            <Text style={styles.linkLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => router.push('/(main-admin)/branches')}>
        <AdminCard style={styles.action}>
          <Text style={styles.actionTitle}>Manage branches</Text>
          <Text style={styles.actionDesc}>Create sites, deactivate, assign branch admins</Text>
        </AdminCard>
      </Pressable>
      <Pressable onPress={() => router.push('/(main-admin)/insights')}>
        <AdminCard style={styles.action}>
          <Text style={styles.actionTitle}>Global analytics</Text>
          <Text style={styles.actionDesc}>Cross-branch enrollment and revenue trends</Text>
        </AdminCard>
      </Pressable>

      <AdminCard>
        <Text style={styles.activityTitle}>System Activity</Text>
        <Text style={styles.activityLine}>New semester announcement published globally · 2h ago</Text>
        <Text style={styles.activityLine}>System maintenance completed successfully · 5h ago</Text>
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pendingCard: {
    marginTop: 12,
    backgroundColor: AppTheme.admin.primaryContainer,
    borderWidth: 0,
  },
  pendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  pendingLink: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.secondaryContainer },
  pendingAmount: { fontSize: 32, fontWeight: '700', color: '#fff', marginTop: 12 },
  pendingSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppTheme.border,
    backgroundColor: AppTheme.surface,
  },
  chipActive: { backgroundColor: AppTheme.mainAdmin, borderColor: AppTheme.mainAdmin },
  chipText: { fontSize: 13, fontWeight: '600', color: AppTheme.textMuted },
  chipTextActive: { color: '#fff' },
  focusTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  meta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  linkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  linkCard: {
    width: '47%',
    minWidth: 140,
    backgroundColor: AppTheme.admin.surfaceContainerLowest,
    borderRadius: AppTheme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: AppTheme.admin.surfaceContainerHighest,
    gap: 8,
  },
  linkLabel: { fontSize: 14, fontWeight: '600', color: AppTheme.text },
  action: { borderLeftWidth: 4, borderLeftColor: AppTheme.accent, marginTop: 12 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  actionDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  activityTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.primary },
  activityLine: { fontSize: 14, color: AppTheme.textMuted, marginTop: 10 },
});
