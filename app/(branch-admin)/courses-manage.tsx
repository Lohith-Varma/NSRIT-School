import { AdminCard } from '@/components/admin/AdminCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { StatusBadge } from '@/components/branch-admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listBranchCourses } from '@/services/api';
import type { BranchCourseRow } from '@/types/branchAdmin';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function CourseManagementScreen() {
  const actor = useActor();
  const router = useRouter();
  const [courses, setCourses] = useState<BranchCourseRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listBranchCourses(actor).then(setCourses).finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q),
    );
  }, [courses, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const statusVariant = (s: BranchCourseRow['status']) => {
    if (s === 'active') return 'active' as const;
    if (s === 'archived') return 'archived' as const;
    return 'inactive' as const;
  };

  return (
    <Screen loading={loading} scroll embedded>
      {selected.size > 0 ? (
        <AdminCard style={styles.selectionBar}>
          <Text style={styles.selectionText}>{selected.size} Course Selected</Text>
          <Button title="Delete Selected" variant="danger" onPress={() => setSelected(new Set())} />
        </AdminCard>
      ) : null}
      <AdminPageHeader
        title="Course Management"
        subtitle="Manage academic curriculum and course allocation"
        action={
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/(branch-admin)/courses-add' as never)}>
            <MaterialIcons name="add" size={18} color={AppTheme.admin.onPrimary} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        }
      />
      <AdminSearchBar value={query} onChangeText={setQuery} placeholder="Search courses..." />
      {filtered.map((c) => (
        <AdminCard key={c.id} style={selected.has(c.id) ? styles.selectedRow : undefined}>
          <Pressable style={styles.checkRow} onPress={() => toggle(c.id)}>
            <MaterialIcons
              name={selected.has(c.id) ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={AppTheme.admin.primary}
            />
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{c.name}</Text>
              <Text style={styles.courseMeta}>
                {c.code} · {c.classLabel} · {c.section}
              </Text>
              <Text style={styles.dept}>{c.department}</Text>
            </View>
            <StatusBadge variant={statusVariant(c.status)} />
          </Pressable>
        </AdminCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  selectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: `${AppTheme.admin.primaryContainer}18` },
  selectionText: { fontWeight: '600', color: AppTheme.admin.primary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppTheme.admin.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: AppTheme.admin.onPrimary, fontWeight: '600' },
  selectedRow: { borderLeftWidth: 4, borderLeftColor: AppTheme.admin.primary },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 16, fontWeight: '600', color: AppTheme.admin.onSurface },
  courseMeta: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant },
  dept: { fontSize: 12, color: AppTheme.admin.onSurfaceVariant, marginTop: 2 },
});
