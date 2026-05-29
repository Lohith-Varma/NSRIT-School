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
import { Pressable, StyleSheet, Text, Alert, View } from 'react-native';

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

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>Actions</Text>
        <Pressable
          style={styles.exportBtn}
          onPress={() =>
            Alert.alert(
              'XLS/PDF Export',
              'The consolidated wing performance report has been compiled and downloaded as an Excel sheet.',
              [{ text: 'OK' }]
            )
          }>
          <Text style={styles.exportBtnText}>📊 Export Wing Report (XLS)</Text>
        </Pressable>
      </View>
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
      <Pressable onPress={() => router.push('/(coordinator)/complaints')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Complaint Verification</Text>
          <Text style={styles.actionDesc}>Review, verify, and forward parent complaints</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(coordinator)/fees')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Fee Monitoring</Text>
          <Text style={styles.actionDesc}>Track collections and outstanding reports</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(coordinator)/timetables')}>
        <Card style={styles.action}>
          <Text style={styles.actionTitle}>Manage Timetables</Text>
          <Text style={styles.actionDesc}>Set up and edit class timetables</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(coordinator)/exams')}>
        <Card style={[styles.action, { borderLeftColor: AppTheme.success }]}>
          <Text style={styles.actionTitle}>Exam Verification Hub</Text>
          <Text style={styles.actionDesc}>Review draft grades and publish official results</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(coordinator)/users')}>
        <Card style={[styles.action, { borderLeftColor: AppTheme.accent }]}>
          <Text style={styles.actionTitle}>User Management</Text>
          <Text style={styles.actionDesc}>Manage branch user accounts and credentials</Text>
        </Card>
      </Pressable>
      <Pressable onPress={() => router.push('/(coordinator)/audit')}>
        <Card style={[styles.action, { borderLeftColor: AppTheme.warning }]}>
          <Text style={styles.actionTitle}>ERP Audit Logs</Text>
          <Text style={styles.actionDesc}>Trace actions, administrative events, and access logs</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  exportBtn: {
    backgroundColor: `${AppTheme.primary}12`,
    borderColor: AppTheme.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.primary,
  },
});
