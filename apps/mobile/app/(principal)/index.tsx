import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, Alert, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { formatWing } from '@/constants/Wings';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useAuth } from '@/context/AuthContext';
import { getSchoolAnalytics, listAnnouncements } from '@/services/api';
import type { SchoolAnalytics, Announcement } from '@/types';
import { useRouter } from 'expo-router';

export default function PrincipalDashboard() {
  const actor = useActor();
  const { signOut } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null);
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWings, setShowWings] = useState(false);

  useEffect(() => {
    Promise.all([
      getSchoolAnalytics(actor),
      listAnnouncements(actor),
    ])
      .then(([an, ann]) => {
        setAnalytics(an);
        const filtered = ann.filter(n => n.targetAudience === 'All' || n.targetAudience === 'Teachers' || n.targetAudience === 'Parents');
        setNotices(filtered.slice(0, 2));
      })
      .catch(err => console.warn('Failed to load principal stats', err))
      .finally(() => setLoading(false));
  }, [actor]);

  const initials = actor.name
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
            <Text style={styles.welcome}>Campus Principal Console</Text>
            <Text style={styles.name}>{actor.name}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Branch Code: {actor.branchId || '—'}</Text>
            </View>
          </View>
          <Pressable onPress={signOut} style={styles.logoutBtn} hitSlop={8}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </Pressable>
        </View>
      </Card>

      {analytics ? (
        <>
          {/* 2. Key Campus Summary Stats */}
          <StatRow>
            <StatCard label="Students" value={String(analytics.totalStudents)} color={AppTheme.primary} />
            <StatCard label="Teachers" value={String(analytics.totalTeachers)} color={AppTheme.coordinator} />
            <StatCard label="Classes" value={String(analytics.totalClasses)} color={AppTheme.accent} />
          </StatRow>
          <View style={{ marginTop: 8 }} />
          <StatRow>
            <StatCard
              label="Attendance Rate"
              value={`${analytics.overallAttendanceRate}%`}
              color={AppTheme.success}
            />
            <StatCard
              label="Fees Collected"
              value={formatCurrency(analytics.totalFeesCollected)}
              color={AppTheme.success}
            />
            <StatCard
              label="Outstanding Fees"
              value={formatCurrency(analytics.totalFeesOutstanding)}
              color={AppTheme.danger}
            />
          </StatRow>

          {/* Collapsible Wing Breakdown to reduce visual clutter */}
          <Pressable onPress={() => setShowWings(!showWings)} style={styles.toggleWingsBtn}>
            <Card style={styles.toggleWingsCard}>
              <Text style={styles.toggleWingsText}>
                {showWings ? '▼ Hide Wing Details' : '▶ Show Wing Breakdown'}
              </Text>
            </Card>
          </Pressable>

          {showWings ? (
            <View style={styles.wingSection}>
              {analytics.byWing.map((w) => (
                <Card key={w.wing} style={styles.wingCard}>
                  <Text style={styles.wingTitle}>{formatWing(w.wing)}</Text>
                  <Text style={styles.wingMeta}>
                    {w.studentCount} students • {w.classCount} classes • {w.attendanceRate}% attendance
                  </Text>
                  <Text style={styles.wingMeta}>
                    Fees: {formatCurrency(w.feesCollected)} collected •{' '}
                    {formatCurrency(w.feesOutstanding)} outstanding
                  </Text>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {/* 3. Primary Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ Primary Actions</Text>
        <Pressable
          style={styles.exportBtn}
          onPress={() =>
            Alert.alert(
              'Analytics Export',
              'The campus performance report has been compiled and downloaded as an Excel sheet.',
              [{ text: 'OK' }]
            )
          }>
          <Text style={styles.exportBtnText}>📄 Export XLS</Text>
        </Pressable>
      </View>
      <View style={styles.actionsGrid}>
        <Pressable onPress={() => router.push('/(principal)/classes')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.primary }]}>
            <Text style={styles.actionEmoji}>🏫</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Classes</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Grade & class sections</Text>
            </View>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(principal)/teachers')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.coordinator }]}>
            <Text style={styles.actionEmoji}>👥</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Manage Teachers</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Staff onboarding & classes</Text>
            </View>
          </Card>
        </Pressable>
      </View>
      <View style={styles.actionsGrid}>
        <Pressable onPress={() => router.push('/(principal)/complaints')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.danger }]}>
            <Text style={styles.actionEmoji}>🛠️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Complaints Desk</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Review & resolve issues</Text>
            </View>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(principal)/settings')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.accent }]}>
            <Text style={styles.actionEmoji}>⚙️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>ERP Settings</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Academic settings & notes</Text>
            </View>
          </Card>
        </Pressable>
      </View>

      {/* 4. Recent Notices Widget */}
      {notices.length > 0 ? (
        <View style={styles.noticesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📢 Campus Announcements</Text>
            <Pressable onPress={() => router.push('/(principal)/notices')}>
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
        <Pressable onPress={() => router.push('/(principal)/gallery')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>🖼️</Text>
            <Text style={styles.secondaryTitle}>School Gallery</Text>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(principal)/notices')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>🔔</Text>
            <Text style={styles.secondaryTitle}>Notice Board</Text>
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
  sectionHeader: {
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
  toggleWingsBtn: {
    marginTop: 10,
  },
  toggleWingsCard: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: AppTheme.background,
    marginBottom: 0,
  },
  toggleWingsText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
  },
  wingSection: {
    marginTop: 10,
    gap: 8,
  },
  wingCard: {
    padding: 14,
    marginBottom: 0,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.primary,
  },
  wingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.text,
  },
  wingMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 3,
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
});
