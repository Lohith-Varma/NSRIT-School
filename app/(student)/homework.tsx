import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { getHomeworkForStudent } from '@/services/api';
import type { StudentHomeworkRow } from '@/services/api/homework';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function StudentHomeworkScreen() {
  const { user } = useAuth();
  const [rows, setRows] = useState<StudentHomeworkRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const data = await getHomeworkForStudent(user, user.id);
        setRows(data);
      } catch (e) {
        console.warn('Failed to load homework', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'submitted':
        return '#3b82f6';
      case 'graded':
        return AppTheme.success;
      case 'pending':
      default:
        return AppTheme.danger;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'graded':
        return 'Graded';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <Screen title="My Homework" subtitle="View and track your assignments" loading={loading} scroll>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {rows.map(({ homework, submission }) => (
          <Card key={homework.id} style={styles.homeworkCard}>
            <View style={styles.headerRow}>
              <View style={styles.titleCol}>
                <Text style={styles.homeworkTitle}>{homework.title}</Text>
                <Text style={styles.teacherMeta}>Assigned by: {homework.teacherName}</Text>
              </View>
              <Badge
                label={getStatusLabel(submission?.status)}
                color={getStatusColor(submission?.status)}
              />
            </View>

            <Text style={styles.descText}>{homework.description}</Text>
            
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>
                Due Date: <Text style={styles.boldDetail}>{formatDate(homework.dueDate)}</Text>
              </Text>
              {submission?.submittedAt ? (
                <Text style={styles.detailText}>
                  Submitted: <Text style={styles.boldDetail}>{formatDate(submission.submittedAt)}</Text>
                </Text>
              ) : null}
            </View>

            {submission?.status === 'graded' ? (
              <View style={styles.gradeBox}>
                <View style={styles.gradeHeader}>
                  <Text style={styles.gradeTitle}>Grade Assigned:</Text>
                  <Text style={styles.gradeVal}>{submission.grade}</Text>
                </View>
                {submission.remarks ? (
                  <Text style={styles.remarksText}>
                    Remarks: <Text style={styles.boldDetail}>{submission.remarks}</Text>
                  </Text>
                ) : null}
              </View>
            ) : null}
          </Card>
        ))}

        {rows.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No homework assignments found.</Text>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 8,
  },
  homeworkCard: {
    padding: 18,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleCol: {
    flex: 1,
  },
  homeworkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  teacherMeta: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 3,
  },
  descText: {
    fontSize: 14,
    color: AppTheme.text,
    marginTop: 12,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
  },
  detailText: {
    fontSize: 13,
    color: AppTheme.textMuted,
  },
  boldDetail: {
    fontWeight: '600',
    color: AppTheme.text,
  },
  gradeBox: {
    backgroundColor: `${AppTheme.success}08`,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: AppTheme.success,
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.text,
  },
  gradeVal: {
    fontSize: 15,
    fontWeight: '800',
    color: AppTheme.success,
  },
  remarksText: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    fontSize: 15,
  },
});
