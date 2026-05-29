import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listExams, publishExamResults } from '@/services/api';
import type { Exam } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { mockStore } from '@/data/mock/store';

export default function CoordinatorExamsScreen() {
  const actor = useActor();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllExams = async () => {
    setLoading(true);
    try {
      const wingClasses = mockStore.classes.filter(
        (c) => c.wing === actor.wing && c.branchId === actor.branchId
      );
      const allExams: Exam[] = [];
      for (const cls of wingClasses) {
        const data = await listExams(actor, cls.id);
        allExams.push(...data);
      }
      setExams(allExams.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e) {
      console.warn('Failed to load coordinator wing exams', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllExams();
  }, [actor]);

  const handlePublish = async (examId: string) => {
    Alert.alert(
      'Publish Results',
      'This will publish these exam results. Parents and students will be instantly notified and gain dashboard access. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              await publishExamResults(actor, examId);
              Alert.alert('Published', 'Results are now live and notifications have been sent!');
              loadAllExams();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to publish results');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'published':
        return AppTheme.success;
      case 'grading':
        return AppTheme.warning;
      case 'scheduled':
      default:
        return '#3b82f6';
    }
  };

  return (
    <Screen title="Exam Verification Hub" subtitle="Review grading lists and publish official results" loading={loading} scroll>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.grid}>
          {exams.map((ex) => (
            <Card key={ex.id} style={styles.examCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleBlock}>
                  <Text style={styles.className}>{ex.className}</Text>
                  <Text style={styles.examTitle}>{ex.name}</Text>
                </View>
                <Badge label={ex.status.toUpperCase()} color={getStatusColor(ex.status)} />
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>Subject: <Text style={styles.bold}>{ex.subject}</Text></Text>
                <Text style={styles.detailText}>Max Marks: <Text style={styles.bold}>{ex.maxMarks}</Text></Text>
                <Text style={styles.detailText}>Exam Date: <Text style={styles.bold}>{formatDate(ex.date)}</Text></Text>
              </View>

              {ex.status === 'grading' ? (
                <Button
                  title="Verify & Declare Results"
                  onPress={() => handlePublish(ex.id)}
                  style={styles.publishBtn}
                />
              ) : ex.status === 'published' ? (
                <View style={styles.successBlock}>
                  <Text style={styles.successText}>✓ Official Results Declared</Text>
                </View>
              ) : (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoText}>Grading in progress by teacher...</Text>
                </View>
              )}
            </Card>
          ))}

          {exams.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No examinations posted in your wing.</Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 8,
  },
  grid: {
    gap: 16,
  },
  examCard: {
    padding: 18,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  className: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.coordinator,
    textTransform: 'uppercase',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  detailText: {
    fontSize: 13,
    color: AppTheme.textMuted,
  },
  bold: {
    fontWeight: '600',
    color: AppTheme.text,
  },
  publishBtn: {
    marginTop: 4,
  },
  successBlock: {
    backgroundColor: `${AppTheme.success}08`,
    borderColor: AppTheme.success,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  successText: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.success,
  },
  infoBlock: {
    backgroundColor: `${AppTheme.border}40`,
    borderColor: AppTheme.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: AppTheme.textMuted,
    fontStyle: 'italic',
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
