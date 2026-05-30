import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { formatWing } from '@/constants/Wings';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useActor } from '@/hooks/useActor';
import { getWingAnalytics, getWingClasses, getWingStudents, getWingTeachers } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const actor = useActor();
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, attendance: 0, collected: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [students, teachers, classes, analytics] = await Promise.all([
          getWingStudents(actor),
          getWingTeachers(actor),
          getWingClasses(actor),
          getWingAnalytics(actor),
        ]);
        setStats({
          students: students.length,
          teachers: teachers.length,
          classes: classes.length,
          attendance: analytics.attendanceRate,
          collected: analytics.feesCollected,
          outstanding: analytics.feesOutstanding,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [actor]);

  return (
    <Screen loading={loading} scroll>
      <Card>
        <Text style={styles.welcome}>{user?.name}</Text>
        <Text style={styles.hint}>
          {user?.wing ? formatWing(user.wing) : 'Wing'} — manage students and monitor teacher submissions.
        </Text>
      </Card>

      <StatRow>
        <StatCard label="Students" value={String(stats.students)} color={AppTheme.coordinator} />
        <StatCard label="Teachers" value={String(stats.teachers)} />
        <StatCard label="Classes" value={String(stats.classes)} />
      </StatRow>
      <StatRow>
        <StatCard label="Attendance" value={`${stats.attendance}%`} color={AppTheme.success} />
        <StatCard label="Fees due" value={formatCurrency(stats.outstanding)} color={AppTheme.warning} />
      </StatRow>

      <Text style={styles.section}>Actions</Text>
      <Pressable onPress={() => router.push('/(coordinator)/students')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Onboard students</Text>
          <Text style={styles.actionDesc}>Create accounts within your wing</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(coordinator)/monitoring')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Wing monitoring</Text>
          <Text style={styles.actionDesc}>Attendance & fees by class</Text>
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
  action: { borderLeftWidth: 4, borderLeftColor: AppTheme.coordinator },
  actionTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  actionDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
});
