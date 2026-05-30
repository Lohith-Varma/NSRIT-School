import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { listAdminInbox } from '@/services/api';
import type { AdminInboxNotification } from '@/types/admin';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

function priorityColor(priority: AdminInboxNotification['priority']) {
  if (priority === 'critical') return AppTheme.danger;
  if (priority === 'normal') return AppTheme.accent;
  return AppTheme.textMuted;
}

function typeLabel(type: AdminInboxNotification['type']) {
  switch (type) {
    case 'academic':
      return 'Academic';
    case 'fees':
      return 'Fees';
    case 'security':
      return 'Security';
    case 'administrative':
      return 'Administrative';
    default:
      return 'System';
  }
}

export default function TeacherNotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminInboxNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    listAdminInbox(user)
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Screen title="Notifications" loading={loading} scroll>
      {notifications.map((notification) => (
        <Card key={notification.id} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{notification.title}</Text>
            <Badge label={typeLabel(notification.type)} color={priorityColor(notification.priority)} />
          </View>
          <Text style={styles.body}>{notification.body}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{notification.timeAgo}</Text>
            <Text style={[styles.priority, { color: priorityColor(notification.priority) }]}> 
              {notification.priority.toUpperCase()}
            </Text>
          </View>
        </Card>
      ))}
      {!loading && notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications available.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
    flex: 1,
    marginRight: 10,
  },
  body: {
    fontSize: 14,
    color: AppTheme.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
    color: AppTheme.textMuted,
  },
  priority: {
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 32,
  },
});