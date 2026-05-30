import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { formatWing } from '@/constants/Wings';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getSchoolAnalytics } from '@/services/api';
import type { SchoolAnalytics } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const QUICK_LINKS: { title: string; desc: string; route: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { title: 'Staff Management', desc: 'Students, teachers, class assignments', route: '/(branch-admin)/staff', icon: 'groups' },
  { title: 'Attendance Correction', desc: 'Review and rectify records', route: '/(branch-admin)/attendance-correction', icon: 'event-available' },
  { title: 'Financial Monitoring', desc: 'Collections, dues, transactions', route: '/(branch-admin)/financial-monitoring', icon: 'account-balance' },
  { title: 'Branch Notifications', desc: 'Announcements and circulars', route: '/(branch-admin)/notifications', icon: 'campaign' },
  { title: 'Course Management', desc: 'Curriculum and sections', route: '/(branch-admin)/courses-manage', icon: 'menu-book' },
  { title: 'Fee Lookup', desc: 'Student payment portal', route: '/(branch-admin)/fees-lookup', icon: 'payments' },
];

export default function BranchAdminDashboard() {
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
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="North Campus Overview"
        subtitle="Daily snapshot and performance metrics."
      />

      {analytics ? (
        <>
          <AdminStatGrid
            items={[
              { label: 'Student Strength', value: String(analytics.totalStudents), tone: 'secondary' },
              { label: 'Staff Overview', value: String(analytics.totalTeachers) },
              { label: 'Branch Revenue', value: formatCurrency(analytics.totalFeesCollected), tone: 'secondary' },
              {
                label: 'Pending Collections',
                value: formatCurrency(analytics.totalFeesOutstanding),
                tone: 'error',
              },
            ]}
          />

          <AdminCard>
            <Text style={styles.chartTitle}>Daily Attendance Summary</Text>
            <View style={styles.chart}>
              {analytics.byWing.map((w) => (
                <View key={w.wing} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max(24, (w.attendanceRate / 100) * 140) }]} />
                  <Text style={styles.barLabel}>{formatWing(w.wing).replace(' Wing', '')}</Text>
                  <Text style={styles.barPct}>{w.attendanceRate}%</Text>
                </View>
              ))}
            </View>
          </AdminCard>

          <Text style={styles.section}>By wing</Text>
          {analytics.byWing.map((w) => (
            <AdminCard key={w.wing}>
              <Text style={styles.wingTitle}>{formatWing(w.wing)}</Text>
              <Text style={styles.wingMeta}>
                {w.studentCount} students · {w.classCount} classes · {w.attendanceRate}% attendance
              </Text>
              <Text style={styles.wingMeta}>
                Fees: {formatCurrency(w.feesCollected)} collected · {formatCurrency(w.feesOutstanding)} due
              </Text>
            </AdminCard>
          ))}
        </>
      ) : null}

      <AdminCard>
        <Text style={styles.alertsTitle}>Recent Alerts</Text>
        <AlertRow icon="payments" tone="error" title="Fee Collection Delay" body="Grade 10 Section B has pending payments." />
        <AlertRow icon="event" tone="secondary" title="Staff Meeting" body="Today at 3:00 PM in Main Hall." />
        <Pressable onPress={() => router.push('/(branch-admin)/notifications' as never)}>
          <Text style={styles.viewAll}>View all notifications</Text>
        </Pressable>
      </AdminCard>

      <Text style={styles.section}>Quick actions</Text>
      {QUICK_LINKS.map((link) => (
        <Pressable key={link.route} onPress={() => router.push(link.route as never)}>
          <AdminCard style={styles.action}>
            <MaterialIcons name={link.icon} size={24} color={AppTheme.admin.primary} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{link.title}</Text>
              <Text style={styles.actionDesc}>{link.desc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={AppTheme.admin.outline} />
          </AdminCard>
        </Pressable>
      ))}
    </Screen>
  );
}

function AlertRow({
  icon,
  tone,
  title,
  body,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  tone: 'error' | 'secondary' | 'muted';
  title: string;
  body: string;
}) {
  const bg =
    tone === 'error'
      ? AppTheme.admin.errorContainer
      : tone === 'secondary'
        ? AppTheme.admin.secondaryContainer
        : AppTheme.admin.surfaceVariant;
  const fg =
    tone === 'error'
      ? AppTheme.admin.onErrorContainer
      : tone === 'secondary'
        ? AppTheme.admin.onSecondaryContainer
        : AppTheme.admin.onSurfaceVariant;
  return (
    <View style={styles.alertRow}>
      <View style={[styles.alertIcon, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={16} color={fg} />
      </View>
      <View style={styles.alertBody}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertText}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  chartTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.onSurface, marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: {
    width: 36,
    backgroundColor: AppTheme.admin.primaryContainer,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 24,
  },
  barLabel: { fontSize: 11, color: AppTheme.admin.onSurfaceVariant, marginTop: 8 },
  barPct: { fontSize: 10, fontWeight: '700', color: AppTheme.admin.primary },
  wingTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  wingMeta: { fontSize: 13, color: AppTheme.textMuted, marginTop: 4 },
  alertsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: AppTheme.admin.onSurface },
  alertRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  alertIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  alertBody: { flex: 1 },
  alertTitle: { fontWeight: '600', fontSize: 14 },
  alertText: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant, marginTop: 2 },
  viewAll: { color: AppTheme.admin.primary, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.branchAdmin,
    marginBottom: 8,
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  actionDesc: { fontSize: 13, color: AppTheme.textMuted, marginTop: 2 },
});
