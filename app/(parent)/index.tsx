import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, Alert, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { childGradeLabel } from '@/components/parent/childUtils';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { getStudentAttendance, getStudentFeeStatus, listAnnouncements } from '@/services/api';
import type { Announcement } from '@/types';
import { useRouter } from 'expo-router';

export default function ParentDashboard() {
  const actor = useActor();
  const { studentId, child } = useActiveStudent();
  const router = useRouter();
  const [attendancePct, setAttendancePct] = useState('—');
  const [dueAmount, setDueAmount] = useState('—');
  const [notices, setNotices] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const [att, fee, ann] = await Promise.all([
          getStudentAttendance(actor, studentId),
          getStudentFeeStatus(actor, studentId),
          listAnnouncements(actor),
        ]);
        setAttendancePct(`${att.percentage}%`);
        setDueAmount(formatCurrency(fee.dueAmount));
        // Filter announcements targeting Parents or All
        const filtered = ann.filter(n => n.targetAudience === 'Parents' || n.targetAudience === 'All');
        setNotices(filtered.slice(0, 2));
      } catch (err) {
        console.warn('Failed to load parent child insights', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [actor, studentId]);

  return (
    <Screen loading={loading} scroll embedded>
      {/* 1. Profile Hero Card */}
      <Card style={styles.profileCard}>
        <View style={styles.childHeader}>
          <View style={styles.childAvatar}>
            <Text style={styles.childAvatarText}>
              {child.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childSubTitle}>Active Child Profile</Text>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childMeta}>{childGradeLabel(child)}</Text>
          </View>
        </View>
        <Text style={styles.switcherNote}>
          💡 Switch sibling records in the portal header or sidebar to refresh this overview.
        </Text>
      </Card>

      {/* 2. Key Child Summary Stats */}
      <StatRow>
        <StatCard label="Attendance" value={attendancePct} color={AppTheme.success} />
        <StatCard label="Outstanding Dues" value={dueAmount} color={AppTheme.warning} />
      </StatRow>

      {/* 3. Primary Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <Pressable
          style={styles.exportBtn}
          onPress={() =>
            Alert.alert(
              'Statement Export',
              'Consolidated fee ledger statement generated as a PDF file.',
              [{ text: 'OK' }]
            )
          }>
          <Text style={styles.exportBtnText}>📄 PDF Statement</Text>
        </Pressable>
      </View>
      <View style={styles.actionsGrid}>
        <Pressable onPress={() => router.push('/(parent)/homework')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.accent }]}>
            <Text style={styles.actionEmoji}>📝</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Homework</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Assignments & submissions</Text>
            </View>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(parent)/attendance')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.success }]}>
            <Text style={styles.actionEmoji}>📅</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Attendance</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Daily log & calendar</Text>
            </View>
          </Card>
        </Pressable>
      </View>
      <View style={styles.actionsGrid}>
        <Pressable onPress={() => router.push('/(parent)/fees')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.warning }]}>
            <Text style={styles.actionEmoji}>💳</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Fee Portals</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Pay invoices & statement</Text>
            </View>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(parent)/timetable')} style={styles.gridCell}>
          <Card style={[styles.actionCard, { borderLeftColor: AppTheme.primary }]}>
            <Text style={styles.actionEmoji}>⏰</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Timetable</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Weekly schedule slots</Text>
            </View>
          </Card>
        </Pressable>
      </View>

      {/* 4. Recent Bulletins Widget */}
      {notices.length > 0 ? (
        <View style={styles.noticesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📢 Parent Bulletins</Text>
            <Pressable onPress={() => router.push('/(parent)/notices')}>
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

      {/* 5. Secondary Tools / Features list */}
      <Text style={styles.sectionTitle}>✨ Secondary Features</Text>
      <View style={styles.secondaryGrid}>
        <Pressable onPress={() => router.push('/(parent)/results')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>📊</Text>
            <Text style={styles.secondaryTitle}>Exam Results</Text>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(parent)/materials')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>📖</Text>
            <Text style={styles.secondaryTitle}>Study Notes</Text>
          </Card>
        </Pressable>
      </View>
      <View style={styles.secondaryGrid}>
        <Pressable onPress={() => router.push('/(parent)/complaints')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>🛠️</Text>
            <Text style={styles.secondaryTitle}>Complaints</Text>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(parent)/feedback')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>⭐</Text>
            <Text style={styles.secondaryTitle}>Feedback</Text>
          </Card>
        </Pressable>
      </View>
      <View style={styles.secondaryGrid}>
        <Pressable onPress={() => router.push('/(parent)/profile')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>👤</Text>
            <Text style={styles.secondaryTitle}>Emergency Contacts</Text>
          </Card>
        </Pressable>
        <Pressable onPress={() => router.push('/(parent)/gallery')} style={styles.secondaryCell}>
          <Card style={styles.secondaryCard}>
            <Text style={styles.secondaryEmoji}>🖼️</Text>
            <Text style={styles.secondaryTitle}>Photo Gallery</Text>
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
    backgroundColor: '#ffffff',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppTheme.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: AppTheme.primary,
    borderWidth: 1.5,
  },
  childAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.primary,
  },
  childInfo: {
    marginLeft: 14,
    flex: 1,
  },
  childSubTitle: {
    fontSize: 11,
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  childName: {
    fontSize: 18,
    fontWeight: '800',
    color: AppTheme.text,
    marginTop: 1,
  },
  childMeta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  switcherNote: {
    fontSize: 12,
    color: AppTheme.textMuted,
    lineHeight: 18,
    backgroundColor: AppTheme.background,
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    borderWidth: 1,
    borderColor: AppTheme.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 16,
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
