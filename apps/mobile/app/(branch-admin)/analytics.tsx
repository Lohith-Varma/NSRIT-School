import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { formatWing } from '@/constants/Wings';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getSchoolAnalytics } from '@/services/api';
import type { SchoolAnalytics } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function BranchAdminAnalyticsScreen() {
  const actor = useActor();
  const [data, setData] = useState<SchoolAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchoolAnalytics(actor)
      .then(setData)
      .finally(() => setLoading(false));
  }, [actor]);

  return (
    <Screen loading={loading} scroll>
      <Text style={styles.intro}>Campus-wide attendance and fee collection for your branch.</Text>

      {data ? (
        <>
          <Text style={styles.section}>Attendance</Text>
          <StatCard
            label="Overall rate"
            value={`${data.overallAttendanceRate}%`}
            hint={`Across ${data.totalStudents} students`}
            color={AppTheme.success}
          />

          <Text style={styles.section}>Fee collection</Text>
          <StatRow>
            <StatCard label="Collected" value={formatCurrency(data.totalFeesCollected)} color={AppTheme.success} />
            <StatCard label="Outstanding" value={formatCurrency(data.totalFeesOutstanding)} color={AppTheme.warning} />
          </StatRow>
          <StatRow>
            <StatCard label="Fully paid" value={String(data.paidStudents)} />
            <StatCard label="Pending / partial" value={String(data.pendingStudents)} color={AppTheme.warning} />
          </StatRow>

          <Text style={styles.section}>Wing breakdown</Text>
          {data.byWing.map((w) => (
            <Card key={w.wing}>
              <Text style={styles.wingTitle}>{formatWing(w.wing)}</Text>
              <Text style={styles.line}>Students: {w.studentCount}</Text>
              <Text style={styles.line}>Classes: {w.classCount}</Text>
              <Text style={styles.line}>Attendance: {w.attendanceRate}%</Text>
              <Text style={styles.line}>Collected: {formatCurrency(w.feesCollected)}</Text>
              <Text style={styles.line}>Outstanding: {formatCurrency(w.feesOutstanding)}</Text>
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
    marginTop: 8,
    marginBottom: 8,
  },
  wingTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text, marginBottom: 8 },
  line: { fontSize: 14, color: AppTheme.text, marginTop: 4 },
});
