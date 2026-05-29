import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { StatusBadge } from '@/components/branch-admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listStudentRegistry } from '@/services/api';
import type { BranchStudentRegistryItem } from '@/types/branchAdmin';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function statusVariant(s: BranchStudentRegistryItem['status']) {
  if (s === 'enrolled') return 'enrolled' as const;
  if (s === 'on_leave') return 'on_leave' as const;
  return 'issue' as const;
}

export default function StudentRegistryScreen() {
  const actor = useActor();
  const router = useRouter();
  const [items, setItems] = useState<BranchStudentRegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    listStudentRegistry(actor).then(setItems).finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q),
    );
  }, [items, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Student Registry"
        subtitle={`Showing ${filtered.length} of ${items.length} students`}
        action={
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/(branch-admin)/students-add' as never)}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        }
      />
      <AdminSearchBar value={query} onChangeText={setQuery} placeholder="Search students..." />
      {filtered.map((s) => (
        <AdminCard
          key={s.id}
          style={s.status === 'issue' ? styles.issueCard : undefined}>
          <View style={styles.row}>
            <Pressable onPress={() => toggle(s.id)} style={styles.check}>
              <MaterialIcons
                name={selected.has(s.id) ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={AppTheme.admin.primary}
              />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{s.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.email}>{s.email}</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <View>
              <Text style={styles.metaLabel}>Student ID</Text>
              <Text style={styles.metaValue}>{s.studentCode}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Join Date</Text>
              <Text style={styles.metaValPlain}>{s.joinDate}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Class / Section</Text>
              <Text style={styles.metaValPlain}>{s.classSection}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Status</Text>
              <StatusBadge variant={statusVariant(s.status)} />
            </View>
          </View>
          <View style={styles.actions}>
            <Button title="Edit" variant="outline" onPress={() => {}} style={styles.half} />
            <Button title="Log" variant="secondary" onPress={() => {}} style={styles.half} />
          </View>
        </AdminCard>
      ))}
      {selected.size > 0 ? (
        <View style={styles.bulk}>
          <Text style={styles.bulkText}>{selected.size} selected</Text>
          <Pressable>
            <Text style={styles.bulkDelete}>Delete selected</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: AppTheme.admin.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: AppTheme.admin.onPrimary, fontWeight: '600' },
  issueCard: { borderColor: AppTheme.admin.errorContainer, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  check: { padding: 4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppTheme.admin.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: '700', color: AppTheme.admin.primary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: AppTheme.admin.onSurface },
  email: { fontSize: 13, color: AppTheme.admin.onSurfaceVariant },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: AppTheme.admin.outlineVariant },
  metaLabel: { fontSize: 10, fontWeight: '600', color: AppTheme.admin.onSurfaceVariant, textTransform: 'uppercase' },
  metaValue: { fontSize: 13, fontWeight: '700', color: AppTheme.admin.primary },
  metaValPlain: { fontSize: 13, color: AppTheme.admin.onSurface },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  half: { flex: 1 },
  bulk: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: AppTheme.admin.inverseSurface,
    borderRadius: 999,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulkText: { color: AppTheme.admin.inverseOnSurface, fontWeight: '600' },
  bulkDelete: { color: AppTheme.admin.error, fontWeight: '600' },
});
