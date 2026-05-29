import { AppTheme } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { CoordinatorCircularReview } from '@/types';
import { StyleSheet, Text, View } from 'react-native';

interface CircularReviewCardProps {
  review: CoordinatorCircularReview;
  onApprove?: () => void;
  onReject?: () => void;
}

export function CircularReviewCard({ review, onApprove, onReject }: CircularReviewCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.category}>{review.category}</Text>
          <Text style={styles.title}>{review.title}</Text>
          <Text style={styles.subtitle}>{review.subtitle}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{review.status.toUpperCase()}</Text>
        </View>
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
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: AppTheme.textMuted,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  subtitle: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: AppTheme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppTheme.surfaceVariant,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppTheme.text,
    textTransform: 'uppercase',
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
