import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { AppTheme, formatCurrency, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getOutstandingFees, getWingClasses } from '@/services/api';
import type { FeeStatus, Class } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function CoordinatorFeesScreen() {
  const actor = useActor();
  const [outstandingFees, setOutstandingFees] = useState<FeeStatus[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // Totals calculations
  const [totals, setTotals] = useState({ collected: 0, outstanding: 0, total: 0, rate: 0 });

  const loadData = async () => {
    try {
      const [fees, cls] = await Promise.all([
        getOutstandingFees(actor),
        getWingClasses(actor),
      ]);
      setOutstandingFees(fees);
      setClasses(cls);

      // We need all fees including paid for total calculation
      // But outstanding API only returned pending. Let's calculate based on mockStore directly for accurate totals
      const wingClassesIds = cls.map((c) => c.id);
      const wingFees = mockStore.fees.filter((f) => wingClassesIds.includes(f.classId));
      
      const collected = wingFees.reduce((s, f) => s + f.paidAmount, 0);
      const outstanding = wingFees.reduce((s, f) => s + f.dueAmount, 0);
      const total = collected + outstanding;
      const rate = total > 0 ? Math.round((collected / total) * 100) : 0;

      setTotals({ collected, outstanding, total, rate });
    } catch (e) {
      console.warn('Failed to load fee data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  // Find student name helper
  const getStudentName = (sid: string) => {
    const student = mockStore.users.find((u) => u.id === sid);
    return student ? student.name : 'Unknown Student';
  };

  // Find class name helper
  const getClassName = (cid: string) => {
    const cls = classes.find((c) => c.id === cid);
    return cls ? `${cls.name} (${cls.section})` : '—';
  };

  return (
    <Screen title="Fee Monitoring" subtitle="Track collections and pending dues in your wing" loading={loading} scroll>
      <StatRow>
        <StatCard label="Total Collected" value={formatCurrency(totals.collected)} color={AppTheme.success} />
        <StatCard label="Total Outstanding" value={formatCurrency(totals.outstanding)} color={AppTheme.warning} />
      </StatRow>
      <StatRow>
        <StatCard label="Collection Rate" value={`${totals.rate}%`} />
        <StatCard label="Students with Dues" value={String(outstandingFees.length)} color={AppTheme.danger} />
      </StatRow>

      <Text style={styles.sectionTitle}>Outstanding Fee Report</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Card style={styles.tableCard}>
          {/* Header row */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.col, styles.nameCol, styles.headerText]}>Student</Text>
            <Text style={[styles.col, styles.classCol, styles.headerText]}>Class</Text>
            <Text style={[styles.col, styles.numCol, styles.headerText]}>Total (₹)</Text>
            <Text style={[styles.col, styles.numCol, styles.headerText]}>Due (₹)</Text>
            <Text style={[styles.col, styles.statusCol, styles.headerText]}>Status</Text>
          </View>

          {/* Data rows */}
          {outstandingFees.map((fee) => (
            <View key={fee.id} style={styles.row}>
              <Text style={[styles.col, styles.nameCol, styles.bodyText, styles.boldText]}>
                {getStudentName(fee.studentId)}
              </Text>
              <Text style={[styles.col, styles.classCol, styles.bodyText]}>
                {getClassName(fee.classId)}
              </Text>
              <Text style={[styles.col, styles.numCol, styles.bodyText]}>
                {fee.totalAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.col, styles.numCol, styles.bodyText, styles.redText, styles.boldText]}>
                {fee.dueAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.col, styles.statusCol, styles.statusLabel, fee.status === 'partial' ? styles.orangeText : styles.redText]}>
                {fee.status === 'partial' ? 'Partial' : 'Pending'}
              </Text>
            </View>
          ))}

          {outstandingFees.length === 0 ? (
            <Text style={styles.emptyText}>All students have fully cleared their fees!</Text>
          ) : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}

// Access mockStore directly for total calculation
import { mockStore } from '@/data/mock/store';

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: AppTheme.text,
    marginTop: 18,
    marginBottom: 12,
  },
  scroll: {
    maxHeight: 450,
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
  nameCol: {
    flex: 2,
  },
  classCol: {
    flex: 1.5,
  },
  numCol: {
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  statusCol: {
    flex: 1,
    textAlign: 'center',
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
  redText: {
    color: AppTheme.danger,
  },
  orangeText: {
    color: AppTheme.warning,
  },
  statusLabel: {
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    color: AppTheme.success,
    fontWeight: '600',
  },
});
