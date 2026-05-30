import { AdminCard } from '@/components/admin/AdminCard';
import { AdminChipTabs } from '@/components/admin/AdminChipTabs';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { BranchAnnouncementCard } from '@/components/branch-admin/BranchAnnouncementCard';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listBranchAnnouncements } from '@/services/api';
import type { BranchAnnouncement, BranchAnnouncementTab } from '@/types/branchAdmin';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const WING_TABS = [
  { id: 'All Wings', label: 'All Wings' },
  { id: 'Pre-primary', label: 'Pre-primary' },
  { id: 'Primary', label: 'Primary' },
  { id: 'Secondary', label: 'Secondary' },
] as const;

type WingFilter = (typeof WING_TABS)[number]['id'];

export function BranchNotificationsScreen() {
  const actor = useActor();
  const router = useRouter();
  const [items, setItems] = useState<BranchAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<BranchAnnouncementTab>('announcements');
  const [wing, setWing] = useState<WingFilter>('All Wings');
  const [query, setQuery] = useState('');

  useEffect(() => {
    listBranchAnnouncements(actor).then(setItems).finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      if (wing !== 'All Wings' && !a.wing.includes(wing)) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.summary.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, wing]);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Branch Notifications"
        subtitle="Manage communications for North Campus"
        action={
          <Pressable
            style={composeStyles.btn}
            onPress={() => router.push('/(branch-admin)/notifications-compose' as never)}>
            <Text style={composeStyles.btnText}>Compose</Text>
          </Pressable>
        }
      />
      <AdminSearchBar value={query} onChangeText={setQuery} placeholder="Search announcements..." />
      <AdminChipTabs tabs={[...WING_TABS]} active={wing} onChange={setWing} />
      <AdminChipTabs
        tabs={[
          { id: 'announcements' as const, label: 'Branch Announcements' },
          { id: 'circulars' as const, label: 'Circulars' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {filtered.map((item) => (
        <BranchAnnouncementCard key={item.id} item={item} />
      ))}
      <Button title="Load more announcements" variant="outline" onPress={() => {}} />
      <AdminCard style={styles.stats}>
        <Text style={styles.statsTitle}>Communication Overview</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statsLabel}>Messages (month)</Text>
            <Text style={styles.statsValue}>142</Text>
          </View>
          <View>
            <Text style={styles.statsLabel}>Avg. open rate</Text>
            <Text style={[styles.statsValue, { color: AppTheme.admin.secondary }]}>87%</Text>
          </View>
        </View>
      </AdminCard>
    </Screen>
  );
}

const composeStyles = StyleSheet.create({
  btn: {
    backgroundColor: AppTheme.admin.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: { color: AppTheme.admin.onPrimary, fontWeight: '600', fontSize: 14 },
});

const styles = StyleSheet.create({
  stats: { backgroundColor: AppTheme.admin.primaryContainer, marginTop: 8 },
  statsTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.onPrimary, marginBottom: 16 },
  statsLabel: { fontSize: 12, color: AppTheme.admin.primaryFixedDim, marginBottom: 4 },
  statsValue: { fontSize: 28, fontWeight: '700', color: AppTheme.admin.onPrimary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
