import { AppTheme } from '@/constants/Theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MaterialIcons } from '@expo/vector-icons';
import type { CoordinatorApprovalRequest } from '@/types';
import { StyleSheet, Text, View } from 'react-native';

interface ApprovalRequestCardProps {
  request: CoordinatorApprovalRequest;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ApprovalRequestCard({ request, onApprove, onReject }: ApprovalRequestCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}> 
          <MaterialIcons name="person" size={20} color={AppTheme.white} />
        </View>
        <View style={styles.heading}>
          <Text style={styles.name}>{request.studentName}</Text>
          <Text style={styles.meta}>{request.classLabel} • {request.reason}</Text>
        </View>
        <View style={[styles.badge, request.urgency === 'urgent' ? styles.urgent : styles.normal]}>
          <Text style={[styles.badgeText, request.urgency === 'urgent' ? styles.badgeTextUrgent : styles.badgeTextNormal]}>
            {request.urgency === 'urgent' ? 'URGENT' : 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.duration}>{request.duration}</Text>
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
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppTheme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heading: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  meta: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: AppTheme.radius.full,
  },
  urgent: {
    backgroundColor: AppTheme.danger,
  },
  normal: {
    backgroundColor: AppTheme.surfaceVariant,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeTextUrgent: {
    color: AppTheme.white,
  },
  badgeTextNormal: {
    color: AppTheme.text,
  },
  body: {
    marginTop: AppTheme.spacing.md,
  },
  duration: {
    fontSize: 14,
    color: AppTheme.text,
    fontWeight: '600',
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
