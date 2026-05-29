import { AdminCard } from '@/components/admin/AdminCard';
import { AdminChipTabs } from '@/components/admin/AdminChipTabs';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminStatGrid } from '@/components/admin/AdminStatGrid';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listBroadcasts } from '@/services/api';
import type { AdminBroadcast } from '@/types/admin';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type TabId = 'broadcast' | 'push' | 'emergency';

export default function GlobalNotificationCenterScreen() {
  const actor = useActor();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('broadcast');
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBroadcasts(await listBroadcasts(actor));
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = broadcasts.filter((b) =>
    b.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Notification Center"
        subtitle="Manage and track global announcements."
        action={
          <Pressable
            style={styles.composePrimary}
            onPress={() => router.push('/(main-admin)/notifications-compose' as never)}>
            <Text style={styles.composePrimaryText}>Compose</Text>
          </Pressable>
        }
      />

      <AdminStatGrid
        columns={3}
        items={[
          { label: 'Total Sent', value: '1,248' },
          { label: 'Delivery Rate', value: '98.5%', tone: 'secondary' },
          { label: 'Active Alerts', value: '2', tone: 'error' },
        ]}
      />

      <AdminCard style={styles.tabsCard}>
        <AdminChipTabs
          tabs={[
            { id: 'broadcast' as TabId, label: 'Broadcast' },
            { id: 'push' as TabId, label: 'Push' },
            { id: 'emergency' as TabId, label: 'Emergency' },
          ]}
          active={tab}
          onChange={setTab}
        />
        <AdminSearchBar value={search} onChangeText={setSearch} placeholder="Search broadcasts..." />
        {tab === 'broadcast'
          ? filtered.map((item) => (
              <View key={item.id} style={styles.broadcastRow}>
                <View style={styles.broadcastMain}>
                  <Text style={styles.broadcastTitle}>{item.title}</Text>
                  <Text style={styles.broadcastSummary} numberOfLines={2}>
                    {item.summary}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.categoryChip}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.sentAt}>{item.sentAt}</Text>
                  </View>
                </View>
                <View style={styles.deliveryBox}>
                  <Text style={styles.deliveryLabel}>Delivery {item.deliveryRate}%</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item.deliveryRate}%` }]} />
                  </View>
                  <Text style={styles.deliveryStats}>
                    S: {(item.sent / 1000).toFixed(1)}k · D: {(item.delivered / 1000).toFixed(1)}k · R:{' '}
                    {(item.read / 1000).toFixed(1)}k
                  </Text>
                </View>
              </View>
            ))
          : (
              <Text style={styles.emptyTab}>
                {tab === 'push' ? 'Push notification history will appear here.' : 'No active emergency alerts.'}
              </Text>
            )}
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  composePrimary: {
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: AppTheme.radius.lg,
  },
  composePrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  tabsCard: { marginTop: 16 },
  broadcastRow: {
    borderTopWidth: 1,
    borderTopColor: AppTheme.admin.surfaceContainerHigh,
    paddingTop: 16,
    marginTop: 16,
    gap: 12,
  },
  broadcastMain: { flex: 1 },
  broadcastTitle: { fontSize: 16, fontWeight: '600', color: AppTheme.text },
  broadcastSummary: { fontSize: 14, color: AppTheme.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  categoryChip: {
    backgroundColor: '#e0e0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: AppTheme.primary },
  sentAt: { fontSize: 12, color: AppTheme.textMuted },
  deliveryBox: {
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    padding: 12,
    borderRadius: AppTheme.radius.lg,
    borderWidth: 1,
    borderColor: AppTheme.admin.surfaceContainerHigh,
  },
  deliveryLabel: { fontSize: 11, color: AppTheme.textMuted },
  progressTrack: {
    height: 6,
    backgroundColor: AppTheme.admin.surfaceContainerHighest,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: AppTheme.accent },
  deliveryStats: { fontSize: 11, color: AppTheme.textMuted, marginTop: 8 },
  emptyTab: { fontSize: 14, color: AppTheme.textMuted, marginTop: 24, textAlign: 'center' },
});
