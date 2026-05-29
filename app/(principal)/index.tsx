import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { formatWing } from '@/constants/Wings';
import { useActor } from '@/hooks/useActor';
import { getSchoolAnalytics } from '@/services/api';
import type { SchoolAnalytics } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function PrincipalDashboard() {
  const actor = useActor();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchoolAnalytics(actor)
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [actor]);

  return (
    <Screen loading={loading} scroll>
      <Card>
        <Text style={styles.welcome}>Branch campus overview</Text>
        <Text style={styles.hint}>
          Manage classes, onboard teachers, and monitor attendance and fee collection for your site.
        </Text>
      </Card>

      {analytics ? (
        <>
          <StatRow>
            <StatCard label="Students" value={String(analytics.totalStudents)} />
            <StatCard label="Teachers" value={String(analytics.totalTeachers)} />
            <StatCard label="Classes" value={String(analytics.totalClasses)} />
          </StatRow>
          <StatRow>
            <StatCard
              label="Attendance"
              value={`${analytics.overallAttendanceRate}%`}
              color={AppTheme.success}
            />
            <StatCard
              label="Collected"
              value={formatCurrency(analytics.totalFeesCollected)}
              color={AppTheme.success}
            />
          </StatRow>
          <StatCard
            label="Outstanding fees"
            value={formatCurrency(analytics.totalFeesOutstanding)}
            color={AppTheme.warning}
          />

          <Text style={styles.section}>By wing</Text>
          {analytics.byWing.map((w) => (
            <Card key={w.wing}>
              <Text style={styles.wingTitle}>{formatWing(w.wing)}</Text>
              <Text style={styles.wingMeta}>
                {w.studentCount} students · {w.classCount} classes · {w.attendanceRate}% attendance
              </Text>
              <Text style={styles.wingMeta}>
                Fees: {formatCurrency(w.feesCollected)} collected ·{' '}
                {formatCurrency(w.feesOutstanding)} due
              </Text>
            </Card>
          ))}
        </>
      ) : null}

      <Text style={styles.section}>Quick actions</Text>
      <Pressable onPress={() => router.push('/(principal)/classes')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Manage classes</Text>
          <Text style={styles.actionDesc}>Create, update, or delete sections</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(principal)/teachers')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Manage teachers</Text>
          <Text style={styles.actionDesc}>Onboard staff and assign classes</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(principal)/attendance')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Attendance oversight</Text>
          <Text style={styles.actionDesc}>Review class attendance and fee performance</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(principal)/fees')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Fee tracking</Text>
          <Text style={styles.actionDesc}>View fee status for your branch classes</Text>
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
  wingTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  wingMeta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  action: { borderLeftWidth: 4, borderLeftColor: AppTheme.principal },
  actionTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  actionDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
});
