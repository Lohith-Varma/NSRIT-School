import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { getNetworkInsights } from '@/services/api';
import type { NetworkInsights } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function MainAdminInsightsScreen() {
  const actor = useActor();
  const { selectedBranchFocusId } = useAuth();
  const [data, setData] = useState<NetworkInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetworkInsights(actor)
      .then(setData)
      .finally(() => setLoading(false));
  }, [actor]);

  const rows =
    data?.byBranch.filter((b) =>
      selectedBranchFocusId ? b.branchId === selectedBranchFocusId : true,
    ) ?? [];

  return (
    <Screen loading={loading} scroll>
      <Text style={styles.intro}>
        {selectedBranchFocusId
          ? 'Showing metrics for the branch selected on the Network tab.'
          : 'System-wide enrollment, revenue, and performance across all campuses.'}
      </Text>

      {data ? (
        <>
          <StatRow>
            <StatCard label="Total students" value={String(data.totalStudents)} />
            <StatCard label="Total teachers" value={String(data.totalTeachers)} />
            <StatCard label="Classes" value={String(data.totalClasses)} />
          </StatRow>
          <StatRow>
            <StatCard label="Network attendance" value={`${data.overallAttendanceRate}%`} color={AppTheme.success} />
            <StatCard label="Revenue collected" value={formatCurrency(data.totalFeesCollected)} color={AppTheme.success} />
          </StatRow>
          <StatCard label="Outstanding (all branches)" value={formatCurrency(data.totalFeesOutstanding)} color={AppTheme.warning} />

          <Text style={styles.section}>Per branch</Text>
          {rows.map((b) => (
            <Card key={b.branchId}>
              <Text style={styles.bName}>{b.branchName}</Text>
              <Text style={styles.line}>
                {b.active ? 'Active' : 'Inactive'} · {b.studentCount} students · {b.teacherCount} staff ·{' '}
                {b.classCount} classes
              </Text>
              <Text style={styles.line}>Attendance {b.attendanceRate}%</Text>
              <Text style={styles.line}>
                Fees {formatCurrency(b.feesCollected)} collected · {formatCurrency(b.feesOutstanding)} due
              </Text>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, color: AppTheme.textMuted, marginBottom: 16, lineHeight: 20 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  bName: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  line: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
});
