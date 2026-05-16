import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { getNetworkInsights, listBranches } from '@/services/api';
import type { Branch, NetworkInsights } from '@/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
    <Screen loading={loading} scroll>
      <Card>
        <Text style={styles.welcome}>Multi-branch network</Text>
        <Text style={styles.hint}>
          Tap a campus to focus drill-down metrics (Insights tab respects this selection).
        </Text>
      </Card>

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
        <Card>
          <Text style={styles.focusTitle}>Focused: {focused.branchName}</Text>
          <Text style={styles.meta}>{focused.studentCount} students · {focused.teacherCount} teachers · {focused.classCount} classes</Text>
          <Text style={styles.meta}>{focused.attendanceRate}% attendance</Text>
          <Text style={styles.meta}>
            {formatCurrency(focused.feesCollected)} collected · {formatCurrency(focused.feesOutstanding)} outstanding
          </Text>
        </Card>
      ) : null}

      {insights ? (
        <>
          <StatRow>
            <StatCard label="Branches" value={`${insights.activeBranches}/${insights.totalBranches}`} hint="Active / total" />
            <StatCard label="Students" value={String(insights.totalStudents)} />
            <StatCard label="Teachers" value={String(insights.totalTeachers)} />
          </StatRow>
          <StatRow>
            <StatCard label="Attendance" value={`${insights.overallAttendanceRate}%`} color={AppTheme.success} />
            <StatCard label="Fees collected" value={formatCurrency(insights.totalFeesCollected)} color={AppTheme.success} />
          </StatRow>
          <StatCard label="Outstanding" value={formatCurrency(insights.totalFeesOutstanding)} color={AppTheme.warning} />
        </>
      ) : null}

      <Pressable onPress={() => router.push('/(main-admin)/branches')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Manage branches</Text>
          <Text style={styles.actionDesc}>Create sites, deactivate, assign branch admins</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(main-admin)/insights')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Global insights</Text>
          <Text style={styles.actionDesc}>Cross-branch enrollment and revenue</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: { fontSize: 18, fontWeight: '600', color: AppTheme.text },
  hint: { fontSize: 14, color: AppTheme.textMuted, marginTop: 8, lineHeight: 20 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 16,
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
  action: { borderLeftWidth: 4, borderLeftColor: AppTheme.accent, marginTop: 12 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  actionDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
});
