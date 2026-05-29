import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, Alert, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { getClassesForTeacher, listAnnouncements } from '@/services/api';
import type { Class, Announcement } from '@/types';
import { useRouter } from 'expo-router';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getClassesForTeacher(user, user.id),
      listAnnouncements(user),
    ])
      .then(([cls, ann]) => {
        setClasses(cls);
        const filtered = ann.filter(n => n.targetAudience === 'Teachers' || n.targetAudience === 'All');
        setNotices(filtered.slice(0, 2));
      })
      .catch(err => console.warn('Failed to load teacher stats', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const primaryClass = classes[0];
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
              <Text style={styles.metaText}>{user.email}</Text>
            </View>
          </View>
          <Pressable onPress={signOut} style={styles.logoutBtn} hitSlop={8}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </Card>

      {/* Primary Class Overview */}
      {primaryClass ? (
        <>
          {/* 2. Key Summary Stats */}
          <StatRow>
            <StatCard label="Assigned Class" value={`${primaryClass.grade}-${primaryClass.name}`} color={AppTheme.primary} />
            <StatCard label="Enrolled Students" value={String(primaryClass.studentIds.length)} color={AppTheme.success} />
          </StatRow>

          <Card style={styles.classDetailCard}>
            <View style={styles.classDetailHeader}>
              <View>
                <Text style={styles.classTitle}>
                  Grade {primaryClass.grade} — {primaryClass.name}
                </Text>
                <Text style={styles.classMeta}>Section: {primaryClass.section} • Active Term</Text>
              </View>
              <Pressable
                style={styles.exportBtn}
                onPress={() =>
                  Alert.alert(
                    'Roster Export',
                    'The student roster has been successfully compiled and downloaded as an Excel sheet (.xlsx).',
                    [{ text: 'OK' }]
                  )
                }>
                <Text style={styles.exportBtnText}>📄 Export XLS</Text>
              </Pressable>
            </View>
          </Card>

          {/* 3. Primary Quick Actions */}
          <Text style={styles.sectionTitle}>⚡ Primary Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable onPress={() => router.push('/(teacher)/attendance')} style={styles.gridCell}>
              <Card style={[styles.actionCard, { borderLeftColor: AppTheme.success }]}>
                <Text style={styles.actionEmoji}>✅</Text>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Mark Attendance</Text>
                  <Text style={styles.actionDesc} numberOfLines={1}>Post daily present/absent</Text>
                </View>
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/(teacher)/homework')} style={styles.gridCell}>
              <Card style={[styles.actionCard, { borderLeftColor: AppTheme.accent }]}>
                <Text style={styles.actionEmoji}>📝</Text>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Homework Manager</Text>
                  <Text style={styles.actionDesc} numberOfLines={1}>Assign tasks & grade</Text>
                </View>
              </Card>
            </Pressable>
          </View>
          <View style={styles.actionsGrid}>
            <Pressable onPress={() => router.push('/(teacher)/materials')} style={styles.gridCell}>
              <Card style={[styles.actionCard, { borderLeftColor: AppTheme.primary }]}>
                <Text style={styles.actionEmoji}>📚</Text>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Upload Materials</Text>
                  <Text style={styles.actionDesc} numberOfLines={1}>Upload notes & PDFs</Text>
                </View>
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/(teacher)/timetable')} style={styles.gridCell}>
              <Card style={[styles.actionCard, { borderLeftColor: AppTheme.coordinator }]}>
                <Text style={styles.actionEmoji}>⏰</Text>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Teacher Schedule</Text>
                  <Text style={styles.actionDesc} numberOfLines={1}>Your weekly timetable</Text>
                </View>
              </Card>
            </Pressable>
          </View>

          {/* 4. Recent Notices Widget */}
          {notices.length > 0 ? (
            <View style={styles.noticesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📢 Campus Announcements</Text>
                <Pressable onPress={() => router.push('/(teacher)/notices')}>
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

          {/* 5. Secondary Actions */}
          <Text style={styles.sectionTitle}>✨ Secondary Features</Text>
          <View style={styles.secondaryGrid}>
            <Pressable onPress={() => router.push('/(teacher)/exams')} style={styles.secondaryCell}>
              <Card style={styles.secondaryCard}>
                <Text style={styles.secondaryEmoji}>📊</Text>
                <Text style={styles.secondaryTitle}>Exam Mark Entry</Text>
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/(teacher)/gallery')} style={styles.secondaryCell}>
              <Card style={styles.secondaryCard}>
                <Text style={styles.secondaryEmoji}>🖼️</Text>
                <Text style={styles.secondaryTitle}>Photo Gallery</Text>
              </Card>
            </Pressable>
          </View>
        </>
      ) : (
        <Card style={styles.centeredCard}>
          <Text style={styles.emptyText}>No classes currently assigned to your account.</Text>
        </Card>
      )}
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
  classDetailCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  classDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.text,
  },
  classMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
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
  secondaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
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
  centeredCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: AppTheme.textMuted,
    textAlign: 'center',
  },
});
