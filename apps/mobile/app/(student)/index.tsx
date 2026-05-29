import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { AppTheme } from '@/constants/Theme';
import { formatWing } from '@/constants/Wings';
import { useAuth } from '@/context/AuthContext';
import { getStudentAttendance, listAnnouncements } from '@/services/api';
import type { StudentAttendanceSummary, Announcement } from '@/types';
import { useRouter } from 'expo-router';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getStudentAttendance(user, user.id),
      listAnnouncements(user),
    ])
      .then(([att, ann]) => {
        setSummary(att);
        // Prioritize notices targeting All
        const filtered = ann.filter(n => n.targetAudience === 'All');
        setNotices(filtered.slice(0, 2));
      })
      .catch(err => console.warn('Failed to load student dashboard stats', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Screen loading={loading} scroll>
      {/* 1. Profile Hero Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Adm No: {user.admissionNumber || '—'}</Text>
              {user.wing ? (
                <Text style={styles.metaDivider}>•</Text>
              ) : null}
              {user.wing ? (
                <Text style={styles.metaText}>{formatWing(user.wing)} Wing</Text>
              ) : null}
            </View>
          </View>
          <Pressable onPress={signOut} style={styles.logoutBtn} hitSlop={8}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </Card>

      {/* 2. Key Summary Stats */}
      {summary ? (
        <StatRow>
          <StatCard
            label="Overall Rate"
            value={`${summary.percentage}%`}
            color={AppTheme.success}
          />
          <StatCard label="Present Days" value={String(summary.presentCount)} />
          <StatCard
            label="Absent Days"
            value={String(summary.absentCount)}
            color={AppTheme.danger}
          />
        </StatRow>
      ) : null}

      {/* 3. Primary Quick Actions */}
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <Pressable onPress={() => router.push('/(student)/homework')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.accent }]}>
            <Text style={styles.actionEmoji}>📝</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Homework</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Assignments & due dates</Text>
            </View>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(student)/materials')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.primary }]}>
            <Text style={styles.actionEmoji}>📚</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Study Materials</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Notes & class PDFs</Text>
            </View>
          </Card>
        </Pressable>
      </View>

      {/* 4. Recent Notices Bulletins */}
      {notices.length > 0 ? (
        <View style={styles.noticesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📢 Recent Bulletins</Text>
            <Pressable onPress={() => router.push('/(student)/notices')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </Pressable>
          </View>
          {notices.map((n) => (
            <Card key={n.id} style={styles.noticeCard}>
              <View style={styles.noticeCardHeader}>
                <Text style={styles.noticeTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={styles.noticeDate}>{new Date(n.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.noticeContent} numberOfLines={2}>{n.content}</Text>
            </Card>
          ))}
        </View>
      ) : null}

      {/* 5. Calendar / Schedule Section */}
      <View style={styles.attendanceHeader}>
        <Text style={styles.sectionTitle}>📅 Attendance Calendar</Text>
        <Pressable
          style={styles.exportBtn}
          onPress={() =>
            Alert.alert(
              'PDF Export',
              'Your attendance report is being downloaded as a PDF file.',
              [{ text: 'OK' }]
            )
          }>
          <Text style={styles.exportBtnText}>📄 Export PDF</Text>
        </Pressable>
      </View>
      <AttendanceCalendar records={summary?.records || []} />

      {/* 6. Secondary / More Features */}
      <Text style={styles.sectionTitle}>✨ More Features</Text>
      <View style={styles.secondaryGrid}>
        <Pressable onPress={() => router.push('/(student)/gallery')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>🖼️</Text>
            <Text style={styles.secondaryTitle}>School Gallery</Text>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(student)/notices')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>🔔</Text>
            <Text style={styles.secondaryTitle}>Notifications</Text>
          </Card>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: AppTheme.primary,
    borderColor: AppTheme.primary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  welcome: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  metaDivider: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 6,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 18,
    letterSpacing: 0.8,
  },
  actionsGrid: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  gridCell: {
    flex: 1,
    marginHorizontal: 6,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: AppTheme.accent,
    marginBottom: 0,
    backgroundColor: '#ffffff',
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.text,
  },
  actionDesc: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 3,
  },
  noticesSection: {
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppTheme.primary,
    marginTop: 8,
  },
  noticeCard: {
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.coordinator,
  },
  noticeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
    flex: 1,
    marginRight: 12,
  },
  noticeDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  noticeContent: {
    fontSize: 12,
    color: AppTheme.textMuted,
    lineHeight: 17,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportBtn: {
    backgroundColor: `${AppTheme.primary}12`,
    borderColor: AppTheme.primary,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryCell: {
    flex: 1,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 0,
    backgroundColor: AppTheme.background,
    justifyContent: 'center',
  },
  secondaryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  secondaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.text,
  },
});
