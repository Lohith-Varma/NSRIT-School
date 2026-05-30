import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getWingMonitoring } from '@/services/api';
import type { WingMonitoringSummary } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PrincipalAttendanceScreen() {
  const actor = useActor();
  const [monitoring, setMonitoring] = useState<WingMonitoringSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWingMonitoring(actor)
      .then(setMonitoring)
      .finally(() => setLoading(false));
  }, [actor]);

  const totals = useMemo(() => {
    const classCount = monitoring.length;
    const attendanceTotal = monitoring.reduce((sum, row) => sum + row.attendanceRate, 0);
    const feesCollected = monitoring.reduce((sum, row) => sum + row.feesCollected, 0);
    const feesOutstanding = monitoring.reduce((sum, row) => sum + row.feesOutstanding, 0);
    return {
      classCount,
      avgAttendance: classCount ? Math.round(attendanceTotal / classCount) : 0,
      feesCollected,
      feesOutstanding,
    };
  }, [monitoring]);

  return (
    <Screen loading={loading} scroll>
      <Text style={styles.intro}>Attendance oversight and branch-wide class performance.</Text>

      <StatRow>
        <StatCard label="Classes" value={String(totals.classCount)} />
        <StatCard
          label="Avg attendance"
          value={`${totals.avgAttendance}%`}
          color={AppTheme.success}
        />
        <StatCard
          label="Fees outstanding"
          value={formatCurrency(totals.feesOutstanding)}
          color={AppTheme.warning}
        />
      </StatRow>

      <Text style={styles.section}>Class monitoring</Text>
      {monitoring.map((row) => (
        <Card key={row.classId} style={styles.card}>
          <Text style={styles.className}>
            Grade {row.grade} · {row.className} ({row.section})
          </Text>
          <Text style={styles.meta}>Teacher: {row.teacherName}</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Students</Text>
              <Text style={styles.metricValue}>{row.studentCount}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Attendance</Text>
              <Text style={[styles.metricValue, { color: AppTheme.success }]}>
                {row.attendanceRate}%
              </Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Collected</Text>
              <Text style={styles.metricValue}>{formatCurrency(row.feesCollected)}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Due</Text>
              <Text style={[styles.metricValue, { color: AppTheme.warning }]}>
                {formatCurrency(row.feesOutstanding)}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    paddingVertical: 18,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text,
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    flex: 1,
    marginRight: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
});
