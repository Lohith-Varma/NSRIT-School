import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { formatWing } from '@/constants/Wings';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { getWingMonitoring } from '@/services/api';
import type { WingMonitoringSummary } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CoordinatorMonitoringScreen() {
  const { user } = useAuth();
  const actor = useActor();
  const [rows, setRows] = useState<WingMonitoringSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWingMonitoring(actor)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [actor]);

  return (
    <Screen loading={loading} scroll>
      <Text style={styles.intro}>
        Attendance and fee status submitted by teachers
        {user?.wing ? ` in ${formatWing(user.wing)}` : ''}.
      </Text>

      {rows.map((row) => (
        <Card key={row.classId}>
          <Text style={styles.title}>
            Grade {row.grade} — {row.className} ({row.section})
          </Text>
          <Text style={styles.meta}>Teacher: {row.teacherName}</Text>
          <Text style={styles.meta}>{row.studentCount} students</Text>

          <View style={styles.stats}>
            <StatCard
              label="Attendance"
              value={`${row.attendanceRate}%`}
              color={row.attendanceRate >= 75 ? AppTheme.success : AppTheme.warning}
            />
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Collected</Text>
            <Text style={styles.feeValue}>{formatCurrency(row.feesCollected)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Outstanding</Text>
            <Text style={[styles.feeValue, row.feesOutstanding > 0 && styles.due]}>
              {formatCurrency(row.feesOutstanding)}
            </Text>
          </View>
        </Card>
      ))}

      {!loading && rows.length === 0 ? (
        <Text style={styles.empty}>No classes in this wing.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, color: AppTheme.textMuted, marginBottom: 16, lineHeight: 20 },
  title: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  meta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  stats: { marginTop: 12 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  feeLabel: { fontSize: 14, color: AppTheme.textMuted },
  feeValue: { fontSize: 14, fontWeight: '600', color: AppTheme.text },
  due: { color: AppTheme.danger },
  empty: { textAlign: 'center', color: AppTheme.textMuted, marginTop: 24 },
});
