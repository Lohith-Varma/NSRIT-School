import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listAuditLogs } from '@/services/api';
import type { AdminAuditLogEntry } from '@/types/admin';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AuditLogsScreen() {
  const actor = useActor();
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('log1');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await listAuditLogs(actor));
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q),
    );
  }, [logs, search]);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="System Audit Logs"
        subtitle="Track all critical system activities and data modifications."
        action={
          <View style={styles.headerActions}>
            <Pressable style={styles.outlineBtn} onPress={() => {}}>
              <FontAwesome name="download" size={14} color={AppTheme.textMuted} />
              <Text style={styles.outlineBtnText}>Export</Text>
            </Pressable>
            <Button title="Refresh" onPress={load} />
          </View>
        }
      />

      <AdminSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by user, ID, or action..."
      />

      <AdminCard style={styles.table}>
        {filtered.map((entry) => {
          const expanded = expandedId === entry.id;
          return (
            <View key={entry.id} style={styles.entry}>
              <Pressable
                style={styles.entryHeader}
                onPress={() => setExpandedId(expanded ? null : entry.id)}>
                <View style={styles.entryMain}>
                  <Text style={styles.timestamp}>{entry.timestamp}</Text>
                  <Text style={styles.user}>
                    {entry.userName} ({entry.userRole})
                  </Text>
                  <View style={[styles.moduleBadge, moduleStyle(entry.module)]}>
                    <Text style={styles.moduleText}>{entry.module}</Text>
                  </View>
                  <Text style={styles.action}>{entry.action}</Text>
                  <Text style={styles.target}>{entry.target}</Text>
                  {entry.detailBefore && entry.detailAfter ? (
                    <View style={styles.changeRow}>
                      <Text style={styles.strike}>{entry.detailBefore}</Text>
                      <Text style={styles.arrow}>→</Text>
                      <Text style={styles.after}>{entry.detailAfter}</Text>
                    </View>
                  ) : null}
                </View>
                <FontAwesome
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={AppTheme.primary}
                />
              </Pressable>
              {expanded && (entry.reason || entry.ipAddress) ? (
                <View style={styles.expanded}>
                  {entry.reason ? (
                    <Text style={styles.reason}>
                      <Text style={styles.reasonLabel}>Reason: </Text>
                      {entry.reason}
                    </Text>
                  ) : null}
                  {entry.ipAddress ? (
                    <Text style={styles.ip}>IP: {entry.ipAddress}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}
      </AdminCard>

      <Text style={styles.pagination}>Showing 1–{filtered.length} of 124 entries</Text>
    </Screen>
  );
}

function moduleStyle(module: AdminAuditLogEntry['module']) {
  if (module === 'Finance') return { backgroundColor: AppTheme.admin.secondaryContainer };
  if (module === 'Academics') return { backgroundColor: '#e0e0ff' };
  return { backgroundColor: AppTheme.surfaceVariant };
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: AppTheme.radius.lg,
  },
  outlineBtnText: { fontSize: 13, color: AppTheme.textMuted, fontWeight: '500' },
  table: { marginTop: 16, padding: 0, overflow: 'hidden' },
  entry: { borderBottomWidth: 1, borderBottomColor: AppTheme.admin.surfaceContainerHighest },
  entryHeader: { flexDirection: 'row', padding: 16, alignItems: 'flex-start' },
  entryMain: { flex: 1, paddingRight: 8 },
  timestamp: { fontSize: 13, fontWeight: '700', color: AppTheme.text },
  user: { fontSize: 12, color: AppTheme.textMuted, marginTop: 4 },
  moduleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  moduleText: { fontSize: 11, fontWeight: '700', color: AppTheme.admin.onSecondaryContainer },
  action: { fontSize: 15, fontWeight: '600', marginTop: 8, color: AppTheme.text },
  target: { fontSize: 12, color: AppTheme.outline, marginTop: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  strike: { fontSize: 13, color: AppTheme.danger, textDecorationLine: 'line-through' },
  arrow: { color: AppTheme.outline },
  after: { fontSize: 13, fontWeight: '600', color: AppTheme.accent },
  expanded: {
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    padding: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppTheme.border,
  },
  reason: { fontSize: 14, color: AppTheme.text },
  reasonLabel: { fontWeight: '600', color: AppTheme.outline },
  ip: { fontSize: 13, fontFamily: 'monospace', marginTop: 8, color: AppTheme.text },
  pagination: { textAlign: 'center', fontSize: 12, color: AppTheme.outline, marginTop: 16 },
});
