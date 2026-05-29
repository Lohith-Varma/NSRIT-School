import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import type { User, Class } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native';
import { mockStore } from '@/data/mock/store';

export default function FrontDeskAdmissionsScreen() {
  const actor = useActor();
  const [admissions, setAdmissions] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const branchId = actor.branchId;
      // All student users in this branch represent our admissions records
      const bStudents = mockStore.users.filter((u) => u.branchId === branchId && u.role === 'student');
      const bClasses = mockStore.classes.filter((c) => c.branchId === branchId);

      setAdmissions(bStudents);
      setFiltered(bStudents);
      setClasses(bClasses);
    } catch (e) {
      console.warn('Failed to load admissions data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(admissions);
      return;
    }
    const q = search.toLowerCase();
    const result = admissions.filter(
      (adm) =>
        adm.name.toLowerCase().includes(q) ||
        adm.email.toLowerCase().includes(q) ||
        (adm.admissionNumber || '').toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, admissions]);

  const getClassName = (classId?: string) => {
    if (!classId) return 'Unassigned';
    const cls = classes.find((c) => c.id === classId);
    return cls ? `${cls.name} (${cls.section})` : '—';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return AppTheme.success;
      case 'Inactive':
        return AppTheme.danger;
      case 'Graduated':
        return AppTheme.primary;
      case 'Transferred':
        return AppTheme.warning;
      default:
        return AppTheme.textMuted;
    }
  };

  return (
    <Screen title="Admissions Ledger" subtitle="View branch-wide admissions intake and enrollment status records" loading={loading} scroll>
      <Card style={styles.searchCard}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search admissions by student name, email, or admission number..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </Card>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Card style={styles.tableCard}>
          {/* Header row */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.col, styles.admCol, styles.headerText]}>Adm Number</Text>
            <Text style={[styles.col, styles.nameCol, styles.headerText]}>Student Name</Text>
            <Text style={[styles.col, styles.classCol, styles.headerText]}>Class Section</Text>
            <Text style={[styles.col, styles.statusCol, styles.headerText]}>Status</Text>
          </View>

          {/* Data rows */}
          {filtered.map((adm) => (
            <View key={adm.id} style={styles.row}>
              <Text style={[styles.col, styles.admCol, styles.bodyText, styles.boldText]}>
                {adm.admissionNumber || '—'}
              </Text>
              <View style={styles.nameCol}>
                <Text style={[styles.col, styles.bodyText, styles.boldText]}>{adm.name}</Text>
                <Text style={styles.subText}>{adm.email}</Text>
              </View>
              <Text style={[styles.col, styles.classCol, styles.bodyText]}>
                {getClassName(adm.classId)}
              </Text>
              <View style={[styles.statusCol, styles.centeredCol]}>
                <Badge label={adm.status || 'Active'} color={getStatusColor(adm.status)} />
              </View>
            </View>
          ))}

          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No admissions records found.</Text>
          ) : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchCard: {
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: AppTheme.text,
    backgroundColor: AppTheme.background,
  },
  scroll: {
    marginTop: 4,
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  headerRow: {
    backgroundColor: `${AppTheme.primary}08`,
  },
  col: {
    fontSize: 14,
    color: AppTheme.text,
  },
  admCol: {
    flex: 1.2,
  },
  nameCol: {
    flex: 2,
    gap: 2,
  },
  classCol: {
    flex: 1.5,
  },
  statusCol: {
    flex: 1,
  },
  centeredCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: '700',
    color: AppTheme.textMuted,
    fontSize: 13,
  },
  bodyText: {
    color: AppTheme.text,
  },
  boldText: {
    fontWeight: '600',
  },
  subText: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    color: AppTheme.textMuted,
    fontWeight: '600',
  },
});
