import { AdminCard } from '@/components/admin/AdminCard';
import { AdminChipTabs } from '@/components/admin/AdminChipTabs';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { StatusBadge } from '@/components/branch-admin/StatusBadge';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Screen } from '@/components/ui/Screen';
import { AppTheme } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { listAttendanceCorrections } from '@/services/api';
import type { AttendanceFilterTab, BranchAttendanceCorrectionRecord } from '@/types/branchAdmin';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const FILTER_TABS: { id: AttendanceFilterTab; label: string }[] = [
  { id: 'all', label: 'All Records' },
  { id: 'flagged', label: 'Flagged (3)' },
  { id: 'pending', label: 'Pending (12)' },
];

export default function AttendanceCorrectionScreen() {
  const actor = useActor();
  const [records, setRecords] = useState<BranchAttendanceCorrectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AttendanceFilterTab>('all');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('2023-10-24');

  useEffect(() => {
    listAttendanceCorrections(actor).then(setRecords).finally(() => setLoading(false));
  }, [actor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (q && !r.studentName.toLowerCase().includes(q) && !r.studentId.toLowerCase().includes(q)) return false;
      if (filter === 'flagged' && r.status !== 'absent') return false;
      if (filter === 'pending' && r.status === 'present') return false;
      return true;
    });
  }, [records, query, filter]);

  return (
    <Screen loading={loading} scroll embedded>
      <AdminPageHeader
        title="Attendance Correction"
        subtitle="Review and rectify student attendance records for Academic Wing - North."
      />
      <AdminSearchBar value={query} onChangeText={setQuery} placeholder="Search ID or Name" />
      <AdminCard>
        <Text style={styles.label}>Target Date</Text>
        <FormField label="" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <AdminChipTabs tabs={FILTER_TABS} active={filter} onChange={setFilter} />
      </AdminCard>
      <AdminCard>
        <View style={styles.listHead}>
          <Text style={styles.listTitle}>Grade 10 - Section A</Text>
          <Text style={styles.listMeta}>Showing {filtered.length} of 42 Students</Text>
        </View>
        {filtered.map((r) => (
          <View key={r.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{r.initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{r.studentName}</Text>
              <Text style={styles.id}>ID: {r.studentId}</Text>
            </View>
            <View style={styles.statusCol}>
              <StatusBadge variant={r.status === 'present' ? 'present' : 'absent'} />
              <Text style={styles.time}>Recorded: {r.recordedAt}</Text>
            </View>
            <Button title="Edit" variant="outline" onPress={() => {}} />
          </View>
        ))}
      </AdminCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', color: AppTheme.admin.outline, marginBottom: 8 },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: AppTheme.admin.surfaceContainer },
  listTitle: { fontSize: 18, fontWeight: '600', color: AppTheme.admin.onSurface },
  listMeta: { fontSize: 12, color: AppTheme.admin.outline },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.admin.surfaceContainer,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppTheme.admin.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontWeight: '700', fontSize: 16, color: AppTheme.admin.onPrimaryFixed },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: AppTheme.admin.onSurface },
  id: { fontSize: 12, color: AppTheme.admin.outline },
  statusCol: { alignItems: 'flex-end', marginRight: 8 },
  time: { fontSize: 10, color: AppTheme.admin.outline, marginTop: 4 },
});
