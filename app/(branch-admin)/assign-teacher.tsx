import { AdminCard } from '@/components/admin/AdminCard';
import { AdminChipTabs } from '@/components/admin/AdminChipTabs';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listTeacherCandidates } from '@/services/api';
import type { BranchTeacherCandidate } from '@/types/branchAdmin';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const GRADE_TABS = [
  { id: 'g10', label: 'Grade 10' },
  { id: 'secA', label: 'Section A' },
] as const;

export default function AssignClassTeacherScreen() {
  const actor = useActor();
  const [teachers, setTeachers] = useState<BranchTeacherCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [gradeTab, setGradeTab] = useState<(typeof GRADE_TABS)[number]['id']>('g10');

  useEffect(() => {
    listTeacherCandidates(actor)
      .then((list) => {
        setTeachers(list);
        const sel = list.find((t) => t.selected);
        if (sel) setSelectedId(sel.id);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter((t) => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
  }, [teachers, query]);

  const selected = teachers.find((t) => t.id === selectedId);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader title="Assign Class Teacher" subtitle="Select faculty for Grade 10 - Section A" />
      <AdminSearchBar value={query} onChangeText={setQuery} placeholder="Search teachers by name..." />
      <AdminChipTabs tabs={[...GRADE_TABS]} active={gradeTab} onChange={setGradeTab} />
      <Text style={styles.count}>Available Faculty · {filtered.length} results</Text>
      {filtered.map((t) => {
        const isSelected = t.id === selectedId;
        return (
          <AdminCard key={t.id} style={isSelected ? styles.selectedCard : undefined}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{t.name.slice(0, 2)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.subject}>{t.subject}</Text>
                <View style={styles.badge}>
                  <MaterialIcons name="school" size={14} color={AppTheme.admin.primary} />
                  <Text style={styles.badgeText}>{t.statusLabel}</Text>
                </View>
              </View>
              <Pressable
                style={[styles.addBtn, isSelected && styles.addBtnActive]}
                onPress={() => setSelectedId(t.id)}>
                <MaterialIcons
                  name={isSelected ? 'done' : 'add'}
                  size={22}
                  color={isSelected ? AppTheme.admin.onPrimary : AppTheme.admin.primary}
                />
              </Pressable>
            </View>
          </AdminCard>
        );
      })}
      {selected ? (
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Selected for Grade 10 - A</Text>
            <Text style={styles.footerName}>{selected.name}</Text>
          </View>
          <Button title="Confirm" onPress={() => {}} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { fontSize: 14, fontWeight: '600', color: AppTheme.admin.primary, marginBottom: 12 },
  selectedCard: { borderWidth: 2, borderColor: AppTheme.admin.primaryContainer },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppTheme.admin.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: '700', fontSize: 18, color: AppTheme.admin.primary },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600' },
  subject: { fontSize: 13, color: AppTheme.admin.onSurfaceVariant },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start', backgroundColor: AppTheme.admin.surfaceContainerLow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, color: AppTheme.admin.onSurfaceVariant },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AppTheme.admin.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnActive: { backgroundColor: AppTheme.admin.primaryContainer },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 16,
    backgroundColor: AppTheme.admin.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppTheme.admin.surfaceContainer,
  },
  footerLabel: { fontSize: 11, color: AppTheme.admin.outline },
  footerName: { fontSize: 16, fontWeight: '700', color: AppTheme.admin.primary },
});
