import { FeeStatusRow } from '@/components/fees/FeeStatusRow';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppTheme, formatCurrency } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getClassFeeStatuses, listAllClasses } from '@/services/api';
import type { ClassFeeRow } from '@/services/api/fees';
import type { Class } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrincipalFeesScreen() {
  const actor = useActor();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [rows, setRows] = useState<ClassFeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAllClasses(actor);
      setClasses(data);
      setSelectedClassId((current) => current ?? data[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!selectedClassId) return;

    let active = true;
    setRefreshing(true);

    getClassFeeStatuses(actor, selectedClassId)
      .then((result) => {
        if (active) setRows(result);
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, [actor, selectedClassId]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => ({
        total: acc.total + row.totalAmount,
        paid: acc.paid + row.paidAmount,
        due: acc.due + row.dueAmount,
      }),
      { total: 0, paid: 0, due: 0 },
    );
  }, [rows]);

  return (
    <Screen loading={loading} scroll>
      <Text style={styles.intro}>Branch-wide fee tracking for selected classes.</Text>

      <Text style={styles.section}>Class selection</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
        {classes.map((cls) => {
          const selected = cls.id === selectedClassId;
          return (
            <Pressable
              key={cls.id}
              onPress={() => setSelectedClassId(cls.id)}
              style={[styles.classChip, selected ? styles.classChipActive : null]}>
              <Text style={[styles.classChipText, selected ? styles.classChipTextActive : null]}>
                {cls.grade} {cls.name} ({cls.section})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card>
        <Text style={styles.section}>Fee summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totals.total)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Paid</Text>
            <Text style={[styles.summaryValue, { color: AppTheme.success }]}>
              {formatCurrency(totals.paid)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Due</Text>
            <Text style={[styles.summaryValue, { color: AppTheme.warning }]}>
              {formatCurrency(totals.due)}
            </Text>
          </View>
        </View>
      </Card>

      <Text style={styles.section}>Student fee status</Text>
      {rows.length ? (
        rows.map((row) => <FeeStatusRow key={row.id} row={row} />)
      ) : (
        <Card>
          <Text style={styles.emptyText}>
            {refreshing ? 'Loading fee details…' : 'No fee records available for this class.'}
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  classScroll: {
    marginBottom: 16,
  },
  classChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: AppTheme.radius.lg,
    backgroundColor: AppTheme.surfaceContainer,
    marginRight: 10,
  },
  classChipActive: {
    backgroundColor: AppTheme.principal,
  },
  classChipText: {
    color: AppTheme.text,
    fontSize: 13,
  },
  classChipTextActive: {
    color: AppTheme.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  emptyText: {
    fontSize: 14,
    color: AppTheme.textMuted,
  },
});
