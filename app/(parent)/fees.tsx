import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { childGradeLabel } from '@/components/parent/childUtils';
import { AppTheme, formatCurrency, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { useActiveStudent } from '@/hooks/useActiveStudent';
import { feeStatusColor, formatFeeStatus, getStudentFeeStatus } from '@/services/api';
import type { FeeStatus } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ParentFeesScreen() {
  const actor = useActor();
  const { studentId, child } = useActiveStudent();
  const [fee, setFee] = useState<FeeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStudentFeeStatus(actor, studentId)
      .then(setFee)
      .catch(() => setFee(null))
      .finally(() => setLoading(false));
  }, [actor, studentId]);

  if (!fee && !loading) {
    return (
      <Screen scroll embedded>
        <Text style={styles.empty}>No fee information for {child.name}.</Text>
      </Screen>
    );
  }

  return (
    <Screen loading={loading} scroll embedded>
      <Text style={styles.childLabel}>
        Fee account for <Text style={styles.childName}>{child.name}</Text> ({childGradeLabel(child)})
      </Text>

      {fee ? (
        <>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment status</Text>
            <Badge label={formatFeeStatus(fee.status)} color={feeStatusColor(fee.status)} />
          </View>

          <StatRow>
            <StatCard label="Total" value={formatCurrency(fee.totalAmount)} />
            <StatCard label="Paid" value={formatCurrency(fee.paidAmount)} color={AppTheme.success} />
            <StatCard
              label="Due"
              value={formatCurrency(fee.dueAmount)}
              color={fee.dueAmount > 0 ? AppTheme.danger : AppTheme.textMuted}
            />
          </StatRow>

          {fee.lastPaymentDate ? (
            <Text style={styles.lastPayment}>Last payment: {formatDate(fee.lastPaymentDate)}</Text>
          ) : null}

          <Text style={styles.section}>Fee structure</Text>
          <Card>
            {fee.feeStructure.map((item) => (
              <View key={item.label} style={styles.lineItem}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
            <View style={[styles.lineItem, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(fee.totalAmount)}</Text>
            </View>
          </Card>

          <Text style={styles.section}>Summary</Text>
          <Card>
            <Text style={styles.summaryText}>
              {child.name} has paid {formatCurrency(fee.paidAmount)} of {formatCurrency(fee.totalAmount)}.
              {fee.dueAmount > 0
                ? ` An outstanding balance of ${formatCurrency(fee.dueAmount)} remains.`
                : ' Fees are fully paid.'}
            </Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  childLabel: {
    fontSize: 14,
    color: AppTheme.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  childName: {
    fontWeight: '600',
    color: AppTheme.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppTheme.text,
  },
  lastPayment: {
    fontSize: 13,
    color: AppTheme.textMuted,
    marginBottom: 8,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.border,
  },
  itemLabel: {
    fontSize: 15,
    color: AppTheme.text,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.primary,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: AppTheme.text,
  },
  empty: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    marginTop: 24,
  },
});
