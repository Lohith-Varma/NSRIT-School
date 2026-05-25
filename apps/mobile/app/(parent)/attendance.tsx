import { AttendanceMonthCalendar } from '@/components/attendance/AttendanceMonthCalendar';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { childGradeLabel } from '@/components/parent/childUtils';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { getStudentAttendance } from '@/services/api';
import type { StudentAttendanceSummary } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

export default function ParentAttendanceScreen() {
  const actor = useActor();
  const { studentId, child } = useActiveStudent();
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStudentAttendance(actor, studentId)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [actor, studentId]);

  return (
    <Screen loading={loading} scroll embedded>
      <Text style={styles.childLabel}>
        Monthly attendance for <Text style={styles.childName}>{child.name}</Text> (
        {childGradeLabel(child)})
      </Text>

      <StatRow>
        <StatCard
          label="Overall"
          value={summary ? `${summary.percentage}%` : '—'}
          hint="Attendance rate"
          color={AppTheme.success}
        />
        <StatCard
          label="Present"
          value={summary ? String(summary.presentCount) : '—'}
          hint="Days"
        />
        <StatCard
          label="Absent"
          value={summary ? String(summary.absentCount) : '—'}
          hint="Days"
          color={AppTheme.absent}
        />
      </StatRow>

      <Text style={styles.section}>Monthly calendar</Text>
      {summary && summary.records.length > 0 ? (
        <AttendanceMonthCalendar records={summary.records} />
      ) : !loading ? (
        <Text style={styles.empty}>No attendance records yet.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  childLabel: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  childName: {
    fontWeight: '600',
    color: AppTheme.text,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  empty: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 24,
  },
});
