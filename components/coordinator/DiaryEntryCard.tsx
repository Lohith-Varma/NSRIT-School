import { AppTheme } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { CoordinatorDiaryEntry } from '@/types';
import { StyleSheet, Text, View } from 'react-native';

interface DiaryEntryCardProps {
  entry: CoordinatorDiaryEntry;
  onApprove?: () => void;
  onReject?: () => void;
}

export function DiaryEntryCard({ entry, onApprove, onReject }: DiaryEntryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.summary}>
          <Text style={styles.teacher}>{entry.teacherName}</Text>
          <Text style={styles.meta}>{entry.subject} • {entry.date}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.details}>{entry.details}</Text>
      </View>

      <View style={styles.actionRow}>
        <Button title="Approve" onPress={onApprove ?? (() => undefined)} style={[styles.actionButton, styles.actionLeft]} />
        <Button title="Reject" variant="danger" onPress={onReject ?? (() => undefined)} style={styles.actionButton} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: AppTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summary: {
    flex: 1,
    marginRight: 12,
  },
  teacher: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  meta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  body: {
    marginTop: AppTheme.spacing.md,
  },
  details: {
    fontSize: 14,
    color: AppTheme.textMuted,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: AppTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  actionLeft: {
    marginRight: 12,
  },
});
