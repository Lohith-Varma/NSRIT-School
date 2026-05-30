import { AdminCard } from '@/components/admin/AdminCard';
import { AppTheme } from '@/constants/Theme';
import type { BranchAnnouncement } from '@/types/branchAdmin';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const ICON_BG: Record<BranchAnnouncement['icon'], { bg: string; fg: string; name: keyof typeof MaterialIcons.glyphMap }> = {
  campaign: { bg: AppTheme.admin.primaryFixed, fg: AppTheme.admin.onPrimaryFixed, name: 'campaign' },
  warning: { bg: AppTheme.admin.errorContainer, fg: AppTheme.admin.onErrorContainer, name: 'warning' },
  event: { bg: AppTheme.admin.surfaceVariant, fg: AppTheme.admin.onSurfaceVariant, name: 'event' },
};

export function BranchAnnouncementCard({ item }: { item: BranchAnnouncement }) {
  const ic = ICON_BG[item.icon];
  return (
    <AdminCard style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: ic.bg }]}>
        <MaterialIcons name={ic.name} size={24} color={ic.fg} />
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.time}>{item.timeAgo}</Text>
        </View>
        <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.tags}>
          {item.deliveryRate != null ? (
            <View style={styles.delivered}>
              <MaterialIcons name="check-circle" size={14} color={AppTheme.admin.secondary} />
              <Text style={styles.deliveredText}>Delivered ({item.deliveryRate}%)</Text>
            </View>
          ) : (
            <View style={styles.scheduled}>
              <MaterialIcons name="schedule" size={14} color={AppTheme.admin.onSurfaceVariant} />
              <Text style={styles.scheduledText}>Scheduled</Text>
            </View>
          )}
          <Text style={styles.chip}>{item.wing}</Text>
          <Text style={styles.chip}>{item.audience}</Text>
        </View>
      </View>
    </AdminCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 16, padding: 20 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: AppTheme.admin.onSurface },
  time: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant },
  summary: { fontSize: 14, color: AppTheme.admin.onSurfaceVariant, marginTop: 6, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },
  delivered: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${AppTheme.admin.secondaryFixed}33`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  deliveredText: { fontSize: 12, color: AppTheme.admin.secondary, fontWeight: '500' },
  scheduled: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: AppTheme.admin.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  scheduledText: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant },
  chip: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant, backgroundColor: AppTheme.admin.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});
