import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { childGradeLabel } from '@/components/parent/childUtils';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { getStudentAttendance, getStudentFeeStatus } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function ParentDashboard() {
  const actor = useActor();
  const { studentId, child } = useActiveStudent();
  const router = useRouter();
  const [attendancePct, setAttendancePct] = useState('—');
  const [dueAmount, setDueAmount] = useState('—');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const [att, fee] = await Promise.all([
          getStudentAttendance(actor, studentId),
          getStudentFeeStatus(actor, studentId),
        ]);
        setAttendancePct(`${att.percentage}%`);
        setDueAmount(formatCurrency(fee.dueAmount));
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, studentId]);

  return (
    <Screen loading={loading} scroll embedded>
      <Card>
        <Text style={styles.welcome}>{child.name}&apos;s overview</Text>
        <Text style={styles.hint}>{childGradeLabel(child)}</Text>
        <Text style={styles.hint}>Switch children from the header or sidebar to update this view.</Text>
      </Card>

      <StatRow>
        <StatCard label="Attendance" value={attendancePct} color={AppTheme.success} />
        <StatCard label="Outstanding" value={dueAmount} color={AppTheme.warning} />
      </StatRow>

      <Text style={styles.section}>Quick links</Text>
      <Pressable onPress={() => router.push('/(parent)/attendance')}>
        <Card style={styles.linkCard}>
          <Text style={styles.linkTitle}>Attendance history</Text>
          <Text style={styles.linkDesc}>Daily records and overall percentage</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(parent)/fees')}>
        <Card style={styles.linkCard}>
          <Text style={styles.linkTitle}>Fee details</Text>
          <Text style={styles.linkDesc}>Structure, payments, and balance</Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 18,
    fontWeight: '600',
    color: AppTheme.text,
  },
  hint: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  linkCard: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.accent,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text,
  },
  linkDesc: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
});
