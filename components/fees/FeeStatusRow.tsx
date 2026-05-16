import { formatCurrency } from '@/constants/Theme';
import { feeStatusColor, formatFeeStatus } from '@/services/api';
import type { ClassFeeRow } from '@/services/api/fees';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export function FeeStatusRow({ row }: { row: ClassFeeRow }) {
  const color = feeStatusColor(row.status);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.name}>{row.studentName}</Text>
        <Badge label={formatFeeStatus(row.status)} color={color} />
      </View>
      <View style={styles.details}>
        <View style={styles.col}>
          <Text style={styles.label}>Paid</Text>
          <Text style={styles.amount}>{formatCurrency(row.paidAmount)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Due</Text>
          <Text style={[styles.amount, row.dueAmount > 0 && styles.due]}>
            {formatCurrency(row.dueAmount)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    gap: 24,
  },
  col: {},
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  due: {
    color: '#dc2626',
  },
});
