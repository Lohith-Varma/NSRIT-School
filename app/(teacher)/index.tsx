import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { getClassesForTeacher } from '@/services/api';
import type { Class } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getClassesForTeacher(user, user.id)
      .then(setClasses)
      .finally(() => setLoading(false));
  }, [user]);

  const primaryClass = classes[0];

  return (
    <Screen loading={loading} scroll>
      <Card>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.hint}>
          Manage daily attendance and review fee status for your assigned classes.
        </Text>
      </Card>

      {primaryClass ? (
        <>
          <Text style={styles.section}>Your class</Text>
          <Card>
            <Text style={styles.className}>
              Grade {primaryClass.grade} — {primaryClass.name} ({primaryClass.section})
            </Text>
            <Text style={styles.meta}>{primaryClass.studentIds.length} students enrolled</Text>
          </Card>

          <Text style={styles.section}>Quick actions</Text>
          <Pressable onPress={() => router.push('/(teacher)/attendance')}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Mark attendance</Text>
              <Text style={styles.actionDesc}>Post present / absent for today</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => router.push('/(teacher)/fees')}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>View class fees</Text>
              <Text style={styles.actionDesc}>Paid, pending, and due amounts</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => router.push('/(teacher)/diary')}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Diary works</Text>
              <Text style={styles.actionDesc}>Review and publish student notes</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => router.push('/(teacher)/notifications')}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Notifications</Text>
              <Text style={styles.actionDesc}>Review campus alerts and updates</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => router.push('/(teacher)/students')}>
            <Card style={styles.actionCard}>
              <Text style={styles.actionTitle}>Student list</Text>
              <Text style={styles.actionDesc}>View your class roster</Text>
            </Card>
          </Pressable>

          <View style={styles.statsRow}>
            <StatCard label="Students" value={String(primaryClass.studentIds.length)} />
            <StatCard label="Class" value={`${primaryClass.grade}${primaryClass.section}`} />
            <StatCard label="Subject" value={primaryClass.subject} />
          </View>
        </>
      ) : (
        <Card>
          <Text style={styles.hint}>No classes assigned yet.</Text>
        </Card>
      )}
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
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  className: {
    fontSize: 17,
    fontWeight: '600',
    color: AppTheme.text,
  },
  meta: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  actionCard: {
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.accent,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text,
  },
  actionDesc: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
