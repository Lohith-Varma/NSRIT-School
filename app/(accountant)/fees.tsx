import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Badge } from '@/components/ui/Badge';
import { AppTheme, formatCurrency, formatDate } from '@/constants/Theme';
import { useActor } from '@/hooks/useActor';
import { getOutstandingFees, getTransactions } from '@/services/api';
import type { FeeStatus, FeeReceipt } from '@/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, Pressable } from 'react-native';

export default function AccountantFeesScreen() {
  const actor = useActor();
  const [feeRecords, setFeeRecords] = useState<FeeStatus[]>([]);
  const [transactions, setTransactions] = useState<FeeReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters State
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'dues' | 'history'>('dues');

  const loadData = async () => {
    try {
      const [dues, txs] = await Promise.all([
        getOutstandingFees(actor),
        getTransactions(actor),
      ]);
      // Dues fetches pending/partial, let's load all records by matching store to have a complete database record list
      setFeeRecords(mockStore.fees);
      setTransactions(txs);
    } catch (e) {
      console.warn('Failed to load fee records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor]);

  // Helpers
  const getStudentName = (sid: string) => {
    const student = mockStore.users.find((u) => u.id === sid);
    return student ? student.name : 'Unknown Student';
  };

  const getClassName = (cid: string) => {
    const cls = mockStore.classes.find((c) => c.id === cid);
    return cls ? `${cls.name} (${cls.section})` : '—';
  };

  const filteredFeeRecords = feeRecords.filter((rec) => {
    const sName = getStudentName(rec.studentId).toLowerCase();
    const cName = getClassName(rec.classId).toLowerCase();
    const query = search.toLowerCase();
    return sName.includes(query) || cName.includes(query);
  });

  const filteredTransactions = transactions.filter((tx) => {
    const sName = tx.studentName.toLowerCase();
    const rNum = tx.receiptNumber.toLowerCase();
    const query = search.toLowerCase();
    return sName.includes(query) || rNum.includes(query);
  });

  const getStatusBadge = (status: FeeStatus['status']) => {
    switch (status) {
      case 'paid':
        return <Badge label="Paid" color={AppTheme.success} />;
      case 'partial':
        return <Badge label="Partial" color={AppTheme.warning} />;
      case 'pending':
      default:
        return <Badge label="Pending" color={AppTheme.danger} />;
    }
  };

  return (
    <Screen title="Student Fee Database" subtitle="Manage individual student accounts & receipts" loading={loading} scroll>
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by student or class..."
          placeholderTextColor={AppTheme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'dues' ? styles.toggleBtnActive : null]}
            onPress={() => setViewMode('dues')}>
            <Text style={[styles.toggleText, viewMode === 'dues' ? styles.toggleTextActive : null]}>
              All Fee Accounts
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'history' ? styles.toggleBtnActive : null]}
            onPress={() => setViewMode('history')}>
            <Text style={[styles.toggleText, viewMode === 'history' ? styles.toggleTextActive : null]}>
              Transaction Logs
            </Text>
          </Pressable>
        </View>
      </View>

      {viewMode === 'dues' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {filteredFeeRecords.map((rec) => (
            <Card key={rec.id} style={styles.recordCard}>
              <View style={styles.rowHeader}>
                <View>
                  <Text style={styles.studentName}>{getStudentName(rec.studentId)}</Text>
                  <Text style={styles.classNameSub}>{getClassName(rec.classId)}</Text>
                </View>
                {getStatusBadge(rec.status)}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Total Fee</Text>
                  <Text style={styles.statVal}>{formatCurrency(rec.totalAmount)}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Paid</Text>
                  <Text style={styles.statValGreen}>{formatCurrency(rec.paidAmount)}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Outstanding</Text>
                  <Text style={[styles.statValRed, rec.dueAmount > 0 ? styles.boldText : null]}>
                    {formatCurrency(rec.dueAmount)}
                  </Text>
                </View>
              </View>

              {rec.lastPaymentDate ? (
                <Text style={styles.lastPayment}>Last Payment Date: {formatDate(rec.lastPaymentDate)}</Text>
              ) : null}
            </Card>
          ))}
          {filteredFeeRecords.length === 0 ? (
            <Text style={styles.emptyText}>No fee accounts found matching your search.</Text>
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} style={styles.txCard}>
              <View style={styles.rowHeader}>
                <View>
                  <Text style={styles.txReceipt}>{tx.receiptNumber}</Text>
                  <Text style={styles.txStudent}>{tx.studentName}</Text>
                </View>
                <Text style={styles.txAmt}>{formatCurrency(tx.amountPaid)}</Text>
              </View>
              <View style={styles.txFooter}>
                <Text style={styles.txMeta}>Method: {tx.paymentMethod}</Text>
                <Text style={styles.txDate}>Processed: {formatDate(tx.transactionDate)}</Text>
              </View>
            </Card>
          ))}
          {filteredTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transaction history found matching your search.</Text>
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}

// Access mockStore directly
import { mockStore } from '@/data/mock/store';

const styles = StyleSheet.create({
  filterSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    minWidth: 260,
    borderWidth: 1.5,
    borderColor: AppTheme.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: AppTheme.text,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: AppTheme.border,
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppTheme.textMuted,
  },
  toggleTextActive: {
    color: AppTheme.primary,
  },
  scroll: {
    maxHeight: 520,
  },
  recordCard: {
    padding: 16,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppTheme.text,
  },
  classNameSub: {
    fontSize: 12,
    color: AppTheme.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: AppTheme.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppTheme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.text,
  },
  statValGreen: {
    fontSize: 14,
    fontWeight: '600',
    color: AppTheme.success,
  },
  statValRed: {
    fontSize: 14,
    color: AppTheme.danger,
  },
  boldText: {
    fontWeight: '700',
  },
  lastPayment: {
    fontSize: 11,
    color: AppTheme.textMuted,
    marginTop: 10,
    textAlign: 'right',
  },
  txCard: {
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: AppTheme.success,
  },
  txReceipt: {
    fontSize: 13,
    fontWeight: '700',
    color: AppTheme.textMuted,
  },
  txStudent: {
    fontSize: 15,
    fontWeight: '600',
    color: AppTheme.text,
    marginTop: 2,
  },
  txAmt: {
    fontSize: 15,
    fontWeight: '700',
    color: AppTheme.success,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: AppTheme.border,
    paddingTop: 8,
  },
  txMeta: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  txDate: {
    fontSize: 11,
    color: AppTheme.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: AppTheme.textMuted,
    padding: 32,
  },
});
