import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { childGradeLabel } from '@/components/parent/childUtils';
import { AppTheme, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { getStudentResults } from '@/services/api';
import type { ExamResult } from '@/types';

export default function ParentResultsScreen() {
  const actor = useActor();
  const { studentId, child } = useActiveStudent();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStudentResults(actor, studentId)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [actor, studentId]);

  // Calculate some overview metrics
  const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
  const totalMax = results.reduce((sum, r) => sum + r.maxMarks, 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  
  const getOverallGrade = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  return (
    <Screen loading={loading} scroll embedded>
      <Text style={styles.childLabel}>
        Showing academic results for <Text style={styles.childName}>{child.name}</Text> ({childGradeLabel(child)})
      </Text>

      {results.length > 0 ? (
        <StatRow>
          <StatCard
            label="Overall Grade"
            value={getOverallGrade(overallPercentage)}
            hint={`Based on ${results.length} subjects`}
            color={AppTheme.accent}
          />
          <StatCard
            label="Cumulative Score"
            value={`${totalObtained}/${totalMax}`}
            hint="Total Marks"
          />
          <StatCard
            label="Percentage"
            value={`${overallPercentage}%`}
            hint="Average Rate"
            color={overallPercentage >= 50 ? AppTheme.success : AppTheme.danger}
          />
        </StatRow>
      ) : null}

      <Text style={styles.sectionTitle}>Subject Performance</Text>
      {results.map((r) => {
        const percent = Math.round((r.marksObtained / r.maxMarks) * 100);
        return (
          <Card key={r.id} style={styles.resultCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.subjectText}>{r.subject}</Text>
                <Text style={styles.examText}>{r.examName}</Text>
              </View>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>{r.grade}</Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>
                Score: <Text style={styles.boldText}>{r.marksObtained}</Text> / {r.maxMarks}
              </Text>
              <Text style={styles.percentText}>{percent}%</Text>
            </View>

            {/* Performance Bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${percent}%`,
                    backgroundColor: percent >= 80 ? AppTheme.success : percent >= 60 ? AppTheme.accent : AppTheme.warning,
                  },
                ]}
              />
            </View>

            {r.remarks ? (
              <View style={styles.remarksBox}>
                <Text style={styles.remarksTitle}>Teacher Remarks:</Text>
                <Text style={styles.remarksText}>&ldquo;{r.remarks}&rdquo;</Text>
              </View>
            ) : null}

            <Text style={styles.dateText}>Declared on {formatDate(r.date)}</Text>
          </Card>
        );
      })}

      {!loading && results.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No academic results found for this term yet.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  childLabel: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  childName: {
    fontWeight: '600',
    color: AppTheme.text,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  resultCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  examText: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: `${AppTheme.accent}12`,
    borderColor: AppTheme.accent,
    borderWidth: 1,
    borderRadius: 8,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.accent,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreText: {
    fontSize: 14,
    color: AppTheme.textMuted,
  },
  boldText: {
    fontWeight: '700',
    color: AppTheme.text,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  remarksBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  remarksTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 2,
  },
  remarksText: {
    fontSize: 12,
    color: AppTheme.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  dateText: {
    fontSize: 10,
    color: AppTheme.textMuted,
    textAlign: 'right',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: AppTheme.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
});
